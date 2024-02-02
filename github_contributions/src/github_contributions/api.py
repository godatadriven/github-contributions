import logging
import re
import time
from typing import Any, Optional

import pandas as pd
import requests
from requests.models import Response


GITHUB_API_BASE_URL = "https://api.github.com"


def wait_for_rate_limit_to_reset(response: Response) -> Response:
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

    while match_next:
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


def search_author_public_pull_requests(
    *authors: str,
    headers: dict[str, str],
    per_page: int = 100,
) -> pd.DataFrame:
    """Search for the public pull requests of an author.

    Parameters
    ----------
    authors : str
        The authors
    headers : dict[str, str]
        The API call headers
    per_page : int (default: 100)
        The number of results returned per page

    Returns
    -------
    out : pd.DataFrame
        The author's public pull requests
    """
    search_url = (
        f"{GITHUB_API_BASE_URL}/search/issues?per_page={per_page}&q=is:public+is:pr"
    )
    df = pd.concat(
        (
            pd.DataFrame(response.json()["items"])
            for author in authors
            for response in paginate(f"{search_url}+author:{author}", headers=headers)
        )
    )
    return df


def get_repository(
    *repositories: str,
    headers: dict[str, str],
) -> pd.DataFrame:
    """Get a repository.

    Parameters
    ----------
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
    df = pd.DataFrame(
        (
            response.json()
            for repository in repositories
            for response in paginate(f"{repo_url}/{repository}", headers=headers)
        )
    )
    return df
