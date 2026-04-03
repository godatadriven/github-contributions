"""Tests for github_contributions.plugin – cost-center integration."""
import pandas as pd
import pytest
from unittest.mock import MagicMock, patch

from github_contributions.plugin import Plugin
from github_contributions.constants import DEFAULT_COST_CENTER_COLUMNS


def _make_plugin(enterprise: str = "") -> Plugin:
    """Return an initialised Plugin instance without touching external APIs."""
    plugin_config: dict = {
        "GITHUB_TOKEN": "test-token",
        "ENTERPRISE": enterprise,
        "cache": False,
    }
    return Plugin("github_contributions", plugin_config)


class TestCostCentersToDataFrame:
    def test_returns_empty_dataframe_when_no_enterprise_configured(self):
        """Regression test: when GH_ENTERPRISE / ENTERPRISE is absent the plugin must
        return an empty DataFrame with the correct schema so that the dbt pipeline can
        continue without error – even if fct_cost_centers ends up empty in the DB."""
        plugin = _make_plugin(enterprise="")
        df = plugin._cost_centers_to_df()

        assert isinstance(df, pd.DataFrame)
        assert list(df.columns) == DEFAULT_COST_CENTER_COLUMNS
        assert len(df) == 0

    def test_returns_dataframe_with_data_when_enterprise_configured(self):
        expected = pd.DataFrame(
            [{"cost_center_name": "Engineering", "user_login": "alice"}]
        )
        plugin = _make_plugin(enterprise="my-org")
        with patch(
            "github_contributions.plugin.github_api.get_cost_centers",
            return_value=expected,
        ):
            df = plugin._cost_centers_to_df()

        assert len(df) == 1
        assert df["user_login"].iloc[0] == "alice"

    def test_cost_center_users_populated_from_enterprise_api(self):
        """Users returned by the cost-center API must be added to _cost_center_users
        so that the subsequent pull-request fetch can include them."""
        rows = pd.DataFrame(
            [
                {"cost_center_name": "Eng", "user_login": "Alice"},
                {"cost_center_name": "Eng", "user_login": "Bob"},
            ]
        )
        plugin = _make_plugin(enterprise="my-org")
        with patch(
            "github_contributions.plugin.github_api.get_cost_centers",
            return_value=rows,
        ):
            plugin._cost_centers_to_df()

        # Logins are lower-cased when stored
        assert plugin._cost_center_users == {"alice", "bob"}

    def test_cost_center_users_empty_when_no_enterprise(self):
        plugin = _make_plugin(enterprise="")
        plugin._cost_centers_to_df()
        assert plugin._cost_center_users == set()
