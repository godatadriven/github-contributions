"""Tests for github_contributions.plugin – cost-center integration."""
import logging
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


def _make_source_config(resource: str, authors: list | None = None) -> MagicMock:
    """Return a mock SourceConfig that behaves like a dict."""
    data: dict = {"resource": resource}
    if authors is not None:
        data["authors"] = authors
    config = MagicMock()
    config.get = lambda key, default=None: data.get(key, default)
    return config


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


class TestWarningsOnInitialize:
    """Verify that the plugin emits warnings when credentials are absent so
    operators know immediately why data may be missing instead of silently
    receiving empty tables or hitting rate limits."""

    def test_warns_when_github_token_is_missing(self, caplog: pytest.LogCaptureFixture):
        """A warning must be logged when GITHUB_TOKEN is not provided so
        that the operator knows API calls will be unauthenticated."""
        with caplog.at_level(logging.WARNING, logger="github_contributions"):
            Plugin("github_contributions", {
                "GITHUB_TOKEN": "",   # empty → falsy → triggers warning
                "ENTERPRISE": "my-org",
                "cache": False,
            })

        assert "GITHUB_TOKEN" in caplog.text

    def test_warns_when_enterprise_is_missing(self, caplog: pytest.LogCaptureFixture):
        """A warning must be logged when GH_ENTERPRISE / ENTERPRISE is absent so
        the operator knows cost-center data will not be fetched."""
        with caplog.at_level(logging.WARNING, logger="github_contributions"):
            Plugin("github_contributions", {
                "GITHUB_TOKEN": "test-token",
                "ENTERPRISE": "",   # empty → triggers warning
                "cache": False,
            })

        assert "GH_ENTERPRISE" in caplog.text or "ENTERPRISE" in caplog.text

    def test_no_warning_when_both_credentials_present(self, caplog: pytest.LogCaptureFixture):
        """No spurious warnings when both token and enterprise are configured."""
        with caplog.at_level(logging.WARNING, logger="github_contributions"):
            Plugin("github_contributions", {
                "GITHUB_TOKEN": "test-token",
                "ENTERPRISE": "my-org",
                "cache": False,
            })

        warning_messages = [
            r.message for r in caplog.records if r.levelno >= logging.WARNING
        ]
        assert not any("GITHUB_TOKEN" in m for m in warning_messages)
        assert not any("GH_ENTERPRISE" in m or "ENTERPRISE" in m for m in warning_messages)


class TestLoadMethodSchema:
    """Verify that the load() dispatcher returns DataFrames with the correct
    column schema – this is what dbt tests validate at the SQL layer, and
    these tests cover the Python layer equivalent."""

    def test_load_cost_centers_returns_correct_schema_without_enterprise(self):
        """When no enterprise is configured, load() must return an empty DataFrame
        with cost_center_name and user_login columns (not raise an exception)."""
        plugin = _make_plugin(enterprise="")
        df = plugin.load(_make_source_config("cost_centers"))

        assert isinstance(df, pd.DataFrame)
        assert list(df.columns) == DEFAULT_COST_CENTER_COLUMNS
        assert len(df) == 0

    def test_load_cost_centers_returns_data_with_enterprise(self):
        """load() must return the DataFrame produced by the enterprise API."""
        api_response = pd.DataFrame([
            {"cost_center_name": "Engineering", "user_login": "alice"},
            {"cost_center_name": "Marketing", "user_login": "bob"},
        ])
        plugin = _make_plugin(enterprise="my-org")
        with patch(
            "github_contributions.plugin.github_api.get_cost_centers",
            return_value=api_response,
        ):
            df = plugin.load(_make_source_config("cost_centers"))

        assert list(df.columns) == DEFAULT_COST_CENTER_COLUMNS
        assert len(df) == 2
        assert set(df["user_login"]) == {"alice", "bob"}

    def test_load_raises_for_unknown_resource(self):
        """load() must raise ValueError for unrecognised resource names."""
        plugin = _make_plugin(enterprise="")
        with pytest.raises(ValueError, match="Unrecognized resource"):
            plugin.load(_make_source_config("unknown_resource"))
