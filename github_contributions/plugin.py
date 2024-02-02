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

from . import api as github_api


def setup_logger(info: bool = False, debug: bool = False) -> None:
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

        setup_logger(info=log_info, debug=log_debug)

        self.headers = frozendict.frozendict(github_api.create_headers(github_token))
        self.repositories = None

        self.methods = {
            "pull_requests": github_api.search_author_public_pull_requests,
            "repositories": github_api.get_repository,
        }
        if use_cache:
            self.methods = {
                method: functools.cache(method_function)
                for method, method_function in self.methods.items()
            }

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
            authors = {author["name"] for author in source_config.get("authors", [])}
            df = self.methods["pull_requests"](*authors, headers=self.headers)
            self.repositories = extract_repositories_from_pull_requests(df)
        if resource == "repositories":
            if get_repositories_from_pull_requests:
                repositories = self.repositories
            else:
                repositories = source_config.get("repositories", [])
            df = self.methods["repositories"](*repositories, headers=self.headers)

        if df is None:
            raise ValueError(f"Unrecognized resource: {resource}")

        return df
