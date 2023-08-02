from pathlib import Path

import duckdb
import pandas as pd
from jinja2 import Environment, FileSystemLoader

TEMPLATES_PATH = Path(__file__).parent / "templates"
INDEX_TEMPLATE = "index.html"


def main():
    # Load data from github_contributions.duckdb into pandas dataframe
    connection = duckdb.connect(database="github_contributions.duckdb")

    pull_requests_sql = "SELECT * FROM main_consumers_xebia.consm_xebia_pull_requests"
    pull_requests = pd.read_sql_query(pull_requests_sql, connection)

    # Load some pull request info for use in the html
    pull_requests["username"] = pull_requests["user"].apply(lambda x: x["login"])
    unique_contributors = pull_requests["username"].unique().tolist()
    pull_requests = pull_requests[["title", "html_url"]].drop_duplicates().to_records(index=False)

    # generate html using jinja2
    env = Environment(loader=FileSystemLoader(TEMPLATES_PATH))
    template = env.get_template(INDEX_TEMPLATE)
    html = template.render(
        contributors=unique_contributors,
        pull_requests=pull_requests,
    )

    # Write html to file
    path = Path("public")
    path.mkdir(exist_ok=True)
    with (path / INDEX_TEMPLATE).open("w") as f:
        f.write(html)


if __name__ == "__main__":
    main()
