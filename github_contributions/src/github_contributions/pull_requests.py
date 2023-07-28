import requests
from typing import Any

import pandas as pd
from dbt.adapters.duckdb.plugins import BasePlugin
from dbt.adapters.duckdb.utils import SourceConfig


class Plugin(BasePlugin):
    search_url = (
        "https://api.github.com/search/issues?per_page=100&q=is:public+is:pr"
    )

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
        response = requests.get(
            f"{self.search_url}+author:{author}",
            headers=self.headers,
        )
        df = pd.DataFrame(response.json()["items"])
        return df
