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
from .constants import REPOS_TABLE, PRS_TABLE, DEFAULT_PR_COLUMNS, DEFAULT_REPO_COLUMNS


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
        self._initital_configure_connection_execution = True
        self._duckdb_src_pull_requests_df = pd.DataFrame(columns=DEFAULT_PR_COLUMNS)
        self._duckdb_src_repositories_df = pd.DataFrame(columns=DEFAULT_REPO_COLUMNS)
        self._duckdb_known_author_updates = dict()

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
        self.logger.info(
            "Filtering out duckdb repositories from all repos to get the list of new repos"
        )
        new_repos = {
            repo
            for repo in repositories
            if repo not in self._duckdb_src_repositories_df["full_name"].tolist()
        }
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
        if not self._initital_configure_connection_execution:
            return  # I want to avoid query-ing DuckDB on every dbt model, only the first execution is fine
        available_tables = conn.cursor().execute("SHOW TABLES").fetchall()
        if all(
            (
                (PRS_TABLE,) in available_tables,
                (REPOS_TABLE,) in available_tables,
            )
        ):
            # This is a hack because there is no concept such as "incremental" sources in dbt-duckdb plugin ecosystem
            # I load the src_pull_requests and src_repositories from the .duckdb file in to a dataframe
            # then fetch all the new records, and concat it to the already existing dataframe and return
            # that as new dataframe
            self.logger.info(
                "found required views in existing .duckdb file, switching to incremental load"
            )
            self._duckdb_src_pull_requests_df = (
                conn.cursor().execute(f"SELECT * FROM {PRS_TABLE}").df()
            )
            self._duckdb_src_repositories_df = (
                conn.cursor().execute(f"SELECT * FROM {REPOS_TABLE}").df()
            )
            author_updates = (
                self._duckdb_src_pull_requests_df.groupby("user_login")
                .agg(last_update=("updated_at", "max"))
                .reset_index()
            )
            self._duckdb_known_author_updates = dict(
                zip(author_updates["user_login"], author_updates["last_update"])
            )
            self.logger.info(f"{self._duckdb_known_author_updates=}")
        self._initital_configure_connection_execution = False

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

        df = None
        if resource == "pull_requests":
            authors = {author["name"] for author in source_config.get("authors", [])}
            df = self._pull_requests_to_df(authors)
        if resource == "repositories":
            df = self._repositories_to_df()

        if df is None:
            raise ValueError(f"Unrecognized resource: {resource}")
        return df

    def _pull_requests_to_df(self, authors: set[str]):
        """
        Fetches pull requests and returns a pandas dataframe

        Parameters
        ----------
        authors : set[str]
            set of authors to fetch PRs for

        Returns
        -------
        out - pd.DataFrame
        """
        df = self.methods["pull_requests"](
            initial_df=self._duckdb_src_pull_requests_df,
            authors=authors,
            headers=self.headers,
            author_updates=self._duckdb_known_author_updates,
        )
        self.repositories = extract_repositories_from_pull_requests(df)
        return df

    def _repositories_to_df(self):
        """
        Fetches repositories and returns a pandas dataframe

        Returns
        -------
        out - pd.DataFrame
        """
        filtered_repositories = self._filter_out_duckdb_repositories(
            repositories=self.repositories
        )
        df = self.methods["repositories"](
            initial_df=self._duckdb_src_repositories_df,
            repositories=filtered_repositories,
            headers=self.headers,
        )
        return df
