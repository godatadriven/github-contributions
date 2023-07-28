import logging
import os
import sys
import time
from typing import Any

import pandas as pd
import requests
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

        setup_logger(info=log_info, debug=log_debug)

        self.headers = github_api.create_headers(github_token)

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
        author = source_config.name
        df = github_api.search_author_public_pull_requests(
            author, headers=self.headers
        )
        return df
