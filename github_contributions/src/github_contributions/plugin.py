import functools
import logging
import os
import sys
import time
from typing import Any

import frozendict
import pandas as pd
from dbt.adapters.duckdb.plugins import BasePlugin
from dbt.adapters.duckdb.utils import SourceConfig
from duckdb import DuckDBPyConnection

from . import api as github_api
from .constants import AUTHOR_VIEW, REPO_VIEW


def setup_logger(info: bool = False, debug: bool = False) -> logging.Logger:
    """Setup the logger.

    Default log level is warning.

    Parameters
    ----------
    info : bool (default : False)
        Set the log level to info
    debug : bool (default : False)
        Set the log level to debug
    """
    if debug:
        log_level = logging.DEBUG
    elif info:
        log_level = logging.INFO
    else:
        log_level = logging.WARNING

    if debug:
        date_format = "%Y-%m-%d %H:%M:%S"
        log_format = (
            "%(asctime)s - [%(levelname)s] - %(name)s - "
            "(%(filename)s).%(funcName)s(%(lineno)d) - %(message)s"
        )
    else:
        date_format = "%H:%M:%S"
        log_format = "%(asctime)s  %(message)s"

    package_name = __name__.split(".")[0]
    logger = logging.getLogger(package_name)

    formatter = logging.Formatter(log_format, datefmt=date_format)
    formatter.converter = time.gmtime

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    logger.setLevel(log_level)
    logger.addHandler(handler)
    return logger


def extract_repositories_from_pull_requests(pull_requests: pd.DataFrame) -> list[str]:
    """Extract repositories from pull requests

    Parameters
    ----------
    pull_requests : pd.DataFrame
        The pull requests

    Returns
    -------
    list[str] :
        The repositories
    """
    regex_pattern = "^https:\/\/github\.com\/((.+)\/(.+))\/pull\/\d+$"
    repositories = pull_requests["html_url"].str.extract(regex_pattern)[0].unique()
    return repositories


class Plugin(BasePlugin):
    def initialize(self, plugin_config: dict[str, Any]) -> None:
        """Initialize the plugin

        The configuration is specfied in the profile.

        Parameters
        ----------
        plugin_config : dict[str, Any]
            A dictionary representing the plugin configuration
        """
        log_info = plugin_config.get("info", False)
        log_debug = plugin_config.get("debug", False)
        github_token = plugin_config.get("GITHUB_TOKEN", os.getenv("GITHUB_TOKEN"))
        use_cache = plugin_config.get("cache", False)

        self.logger = setup_logger(info=log_info, debug=log_debug)
        self.headers = frozendict.frozendict(github_api.create_headers(github_token))
        self.repositories = None
        self._set_duckdb_entries = False
        self.duckdb_author_updates = dict()
        self.duckdb_repositories = set()

        self.methods = {
            "pull_requests": github_api.search_author_public_pull_requests,
            "repositories": github_api.get_repository,
        }
        if use_cache:
            self.methods = {
                method: functools.cache(method_function)
                for method, method_function in self.methods.items()
            }

    def _filter_out_duckdb_repositories(self, repositories: list[str]) -> set[str]:
        """

        Parameters
        ----------
        repositories : list[str]
            list of repositories that are part of the PRs from different authors

        Returns
        -------
        out - set[str]
            set of repositories that are new, to not do unnecessary API calls for incremental loads

        """
        self.logger.info("Filtering out duckdb repositories from all repos to get the list of new repos")
        self.logger.info(f"{self.duckdb_repositories=}")
        self.logger.info(f"{repositories=}")
        new_repos = {repo for repo in repositories if repo not in self.duckdb_repositories}
        self.logger.info(f"{new_repos=}")
        return new_repos

    def configure_connection(self, conn: DuckDBPyConnection):
        """
        This function is called with the DuckDB connection object for every defined source
        Using this function to be able to query DuckDB for existing records to make incremental loads possible

        Parameters
        ----------
        conn : DuckDBPyConnection

        Returns
        -------

        """
        available_views = conn.cursor().execute("FROM duckdb_views SELECT schema_name, view_name").fetchall()
        if all((
                REPO_VIEW in available_views,
                AUTHOR_VIEW in available_views,
                not self._set_duckdb_entries
        )):
            self.duckdb_author_updates = {
                author: last_update
                for author, last_update
                in conn.cursor().execute(
                    f"SELECT author, last_update FROM {AUTHOR_VIEW[0]}.{AUTHOR_VIEW[1]}"
                ).fetchall()
            }
            self.duckdb_repositories = {
                repo[0] for repo in conn.cursor().execute(
                    f"SELECT name FROM {REPO_VIEW[0]}.{REPO_VIEW[1]}"
                ).fetchall()
            }
            self._set_duckdb_entries = True

    def load(self, source_config: SourceConfig) -> pd.DataFrame:
        """Load the data for a source.

        Parameters
        ----------
        source_config : SourceConfig
            The configuration of the source

        Returns
        -------
        out : pd.DataFrame
            The public pull requests

        """
        resource = source_config.get("resource")
        get_repositories_from_pull_requests = source_config.get(
            "get_repositories_from_pull_requests",
            False,
        )

        df = None
        if resource == "pull_requests" or get_repositories_from_pull_requests:
            df = self._pull_requests_to_df(source_config)
        if resource == "repositories":
            df = self._repositories_to_df(get_repositories_from_pull_requests, source_config)

        if df is None:
            raise ValueError(f"Unrecognized resource: {resource}")
        return df

    def _pull_requests_to_df(self, source_config):
        authors = {author["name"] for author in source_config.get("authors", [])}
        df = self.methods["pull_requests"](authors, headers=self.headers, author_updates=self.duckdb_author_updates)
        self.repositories = extract_repositories_from_pull_requests(df)
        return df

    def _repositories_to_df(self, get_repositories_from_pull_requests, source_config):
        if get_repositories_from_pull_requests:
            repositories = self.repositories
        else:
            repositories = source_config.get("repositories", [])
        filtered_repositories = self._filter_out_duckdb_repositories(repositories=repositories)
        df = self.methods["repositories"](filtered_repositories, headers=self.headers)
        return df
