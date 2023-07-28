import os
from typing import Any

import pandas as pd
import requests
from dbt.adapters.duckdb.plugins import BasePlugin
from dbt.adapters.duckdb.utils import SourceConfig

from . import api as github_api


class Plugin(BasePlugin):
    def initialize(self, plugin_config: dict[str, Any]) -> None:
        """Initialize the plugin

        The configuration is specfied in the profile.

        Parameters
        ----------
        plugin_config : dict[str, Any]
            A dictionary representing the plugin configuration
        """
        github_token = plugin_config.get("GITHUB_TOKEN", os.getenv("GITHUB_TOKEN"))
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
