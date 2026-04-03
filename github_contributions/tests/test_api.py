"""Tests for github_contributions.api – cost-center related functions."""
import pytest
import pandas as pd
from unittest.mock import MagicMock, patch

from github_contributions.api import get_cost_centers


def _make_response(json_data: dict, ok: bool = True, status_code: int = 200) -> MagicMock:
    response = MagicMock()
    response.ok = ok
    response.status_code = status_code
    response.json.return_value = json_data
    response.headers = {}
    return response


@pytest.fixture
def sample_headers() -> dict:
    return {"Authorization": "Bearer test-token"}


class TestGetCostCenters:
    def test_returns_dataframe_with_expected_columns(self, sample_headers):
        response = _make_response({
            "cost_centers": [
                {
                    "name": "Engineering",
                    "resources": {
                        "users": [
                            {"github_com_login": "alice"},
                            {"github_com_login": "bob"},
                        ]
                    },
                }
            ]
        })
        with patch("github_contributions.api.paginate", return_value=[response]):
            df = get_cost_centers(enterprise="my-org", headers=sample_headers)

        assert list(df.columns) == ["cost_center_name", "user_login"]
        assert len(df) == 2
        assert set(df["user_login"]) == {"alice", "bob"}
        assert all(df["cost_center_name"] == "Engineering")

    def test_multiple_cost_centers(self, sample_headers):
        response = _make_response({
            "cost_centers": [
                {
                    "name": "Engineering",
                    "resources": {"users": [{"github_com_login": "alice"}]},
                },
                {
                    "name": "Marketing",
                    "resources": {"users": [{"github_com_login": "carol"}]},
                },
            ]
        })
        with patch("github_contributions.api.paginate", return_value=[response]):
            df = get_cost_centers(enterprise="my-org", headers=sample_headers)

        assert len(df) == 2
        assert set(df["cost_center_name"]) == {"Engineering", "Marketing"}

    def test_skips_users_without_login(self, sample_headers):
        response = _make_response({
            "cost_centers": [
                {
                    "name": "Engineering",
                    "resources": {
                        "users": [
                            {"github_com_login": "alice"},
                            {"github_com_login": ""},   # empty login – should be skipped
                            {},                         # missing key – should be skipped
                        ]
                    },
                }
            ]
        })
        with patch("github_contributions.api.paginate", return_value=[response]):
            df = get_cost_centers(enterprise="my-org", headers=sample_headers)

        assert len(df) == 1
        assert df["user_login"].iloc[0] == "alice"

    def test_empty_cost_centers_returns_empty_dataframe(self, sample_headers):
        response = _make_response({"cost_centers": []})
        with patch("github_contributions.api.paginate", return_value=[response]):
            df = get_cost_centers(enterprise="my-org", headers=sample_headers)

        assert isinstance(df, pd.DataFrame)
        assert list(df.columns) == ["cost_center_name", "user_login"]
        assert len(df) == 0

    def test_missing_cost_centers_key_returns_empty_dataframe(self, sample_headers):
        response = _make_response({})
        with patch("github_contributions.api.paginate", return_value=[response]):
            df = get_cost_centers(enterprise="my-org", headers=sample_headers)

        assert len(df) == 0
