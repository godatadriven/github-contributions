import logging
import re
import time
from typing import Any, Optional
import pandas as pd
import requests
from requests.models import Response

GITHUB_API_BASE_URL = "https://api.github.com"


def wait_for_rate_limit_to_reset(response: Response):
    """Wait for the rate limit to reset.

    Parameters
    ----------
    response : Response
        The response

    Raises
    ------
    request.Error :
        The requests error if the rate limit is not the issue
    """
    wait_buffer = 5
    # The secondary rate limit is found through the following message
    rate_limit_exceeded_message = (
        "You have exceeded a secondary rate limit. "
        "Please wait a few minutes before you try again."
    )

    logger = logging.getLogger(__name__)

    rate_limit = response.headers.get("X-RateLimit-Remaining")
    message = response.json().get("message")

    if rate_limit == "0" or message == rate_limit_exceeded_message:
        rate_limit_reset = int(response.headers.get("X-RateLimit-Reset"))
        wait_time = int(rate_limit_reset - time.time() + wait_buffer + 1)
        logger.info("Waiting %s seconds for Github API rate limit to reset", wait_time)
        time.sleep(max(wait_time, wait_buffer))
    else:
        response.raise_for_status()


def paginate(url: str, **request_arguments: Any) -> Response:
    """Paginate a request

    Parameters
    ------------
    url : str
        The url to paginate
    request_arguments : Any
        The request arguments

    Yields
    ------
    out : Response
        The response
    """
    regex = re.compile('.*<([^>]+)>; rel="next"')
    match_next = True
    logger = logging.getLogger(__name__)

    while match_next:
        logger.debug(f"Doing request towards: {url}")
        response = requests.get(url, **request_arguments)
        while not response.ok:
            wait_for_rate_limit_to_reset(response)
            response = requests.get(url, **request_arguments)

        yield response

        link_header = response.headers.get("Link")
        match_next = link_header and regex.match(link_header)

        if match_next:
            url = match_next.group(1)


def create_headers(
    authorization_token: Optional[str] = None,
) -> dict[str, str]:
    """Create the API headers.

    Parameters
    ----------
    authorization_token : Optional[str] (default : None)
        The API authorization token

    Returns
    -------
    out : dict[str, str]
        The API headers
    """
    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    if authorization_token is not None:
        headers["Authorization"] = f"Bearer {authorization_token}"

    return headers


def _prep_and_concat_dfs(
    initial_df: pd.DataFrame, api_df: pd.DataFrame
) -> pd.DataFrame:
    """
    prepares and concat the api dataframe to the initial dataframe

    Parameters
    ----------
    initial_df : pd.DataFrame
    api_df : pd.DataFrame

    Returns
    -------
    out : pd.DataFrame
        concat of both dataframes
    """
    api_df.rename(
        columns={column: column.replace(".", "_") for column in api_df.columns},
        inplace=True,
    )
    new_df = pd.concat((initial_df, api_df), axis=0)
    final_df = new_df[initial_df.columns]
    final_df.reset_index(drop=True, inplace=True)
    final_df.fillna('', inplace=True)
    return final_df


def search_author_public_pull_requests(
    initial_df: pd.DataFrame,
    authors: set[str],
    headers: dict[str, str],
    author_updates: dict[str, str],
    per_page: int = 100,
) -> pd.DataFrame:
    """Search for the public pull requests of an author.

    Parameters
    ----------
    initial_df:
        Initial dataframe can come from the already existing data in duckdb (incremental load)
        Or a newly initialized dataframe with only the specified columns
    authors : str
        The authors
    headers : dict[str, str]
        The API call headers
    author_updates : dict[str, str]
        Dictionary of GitHub handle : latest update for incremental runs
    per_page : int (default: 100)
        The number of results returned per page

    Returns
    -------
    out : pd.DataFrame
        The author's public pull requests
    """
    logger = logging.getLogger(__name__)
    search_url = (
        f"{GITHUB_API_BASE_URL}/search/issues?per_page={per_page}&q=is:public+is:pr"
    )
    for author in list(authors):
        counter = 0
        last_update = author_updates.get(author.lower())
        url = f"{search_url}+author:{author}{'+created:>' + last_update if last_update else ''}"
        for response in paginate(url, headers=headers):
            if items := response.json().get("items"):
                page_df = pd.json_normalize(items)
                counter += len(page_df)
                initial_df = _prep_and_concat_dfs(initial_df, page_df)
        logger.info(
            f"Handle '{author}' - Fetched {counter} new pull requests {'since ' + last_update if last_update else ''}"
        )
    return initial_df


def get_repository(
    initial_df: pd.DataFrame,
    repositories: set[str],
    headers: dict[str, str],
) -> pd.DataFrame:
    """Get a repository.

    Parameters
    ----------
    initial_df:
        Initial dataframe can come from the already existing data in duckdb (incremental load)
        Or a newly initialized dataframe with only the specified columns
    repositories : str
        The full name of the repositories, like "{owner}/{repo}".
    headers : dict[str, str]
        The API call headers

    Returns
    -------
    out : pd.DataFrame
        The repository
    """
    repo_url = f"{GITHUB_API_BASE_URL}/repos"
    for repository in repositories:
        for response in paginate(f"{repo_url}/{repository}", headers=headers):
            repo_df = pd.json_normalize(response.json())
            initial_df = _prep_and_concat_dfs(initial_df, repo_df)
    return initial_df
