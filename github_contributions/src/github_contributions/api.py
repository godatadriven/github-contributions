import re
from typing import Any, Optional

import pandas as pd
import requests
from requests.models import Response


GITHUB_API_BASE_URL = "https://api.github.com"


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

        yield response

        link_header = response.headers.get("Link")
        match_next = link_header and regex.match(link_header)

        if match_next:
            url = match_next.group(1)


def create_headers(authorization_token: Optional[str] = None) -> dict[str, str]:
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
    author: str, *, headers: dict[str, str], per_page: int = 100,
) -> pd.DataFrame:
    """Search for the public pull requests of an author.

    Parameters
    ----------
    author : str
        The author
    headers : dict[str, str]
        The API call headers
    per_page : int (default: 100)
        The number of results returned per page

    Returns
    -------
    out : pd.DataFrame
        The author's public pull requests
    """
    search_url = f"{GITHUB_API_BASE_URL}/search/issues?per_page={per_page}&q=is:public+is:pr"
    search_pagination = paginate(search_url, headers=headers)

    df = pd.concat(
        (pd.DataFrame(repsonse.json()["items"]) for repsonse in search_pagination)
    )
    return df
