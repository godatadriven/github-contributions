from typing import Any

import pandas as pd
import requests
from dbt.adapters.duckdb.plugins import BasePlugin
from dbt.adapters.duckdb.utils import SourceConfig

from . import api as github_api


class Plugin(BasePlugin):
    def initialize(self, plugin_config: dict[str, Any]) -> None:
        headers = {
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        }

        bearer_token = plugin_config.get("GITHUB_TOKEN")
        if bearer_token:
            headers["Authorization"] = f"Bearer {bearer_token}"

        self.headers = headers

    def load(self, source_config: SourceConfig) -> pd.DataFrame:
        author = source_config.name
        df = github_api.search_author_public_pull_requests(
            author, headers=self.headers
        )
        return df
