from pathlib import Path

import duckdb
import pandas as pd
from jinja2 import Environment, FileSystemLoader

TEMPLATES_PATH = Path(__file__).parent / "templates"
INDEX_TEMPLATE = "index.html"


def main():
    # Load data from github_contributions.duckdb into pandas dataframe
    con = duckdb.connect(database="github_contributions.duckdb")
    df = pd.read_sql_query("SELECT * FROM main_consumers_xebia.consm_xebia_pull_requests", con)

    # Load some pull request info for use in the html
    df["username"] = df["user"].apply(lambda x: x["login"])
    unique_contributors = df["username"].unique().tolist()
    pull_requests = df[["title", "html_url"]].drop_duplicates().to_records(index=False)

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
