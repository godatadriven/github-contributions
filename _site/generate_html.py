from __future__ import annotations

import argparse
from pathlib import Path

import duckdb
from jinja2 import Environment, FileSystemLoader


TEMPLATES_PATH = Path(__file__).parent / "templates"
PULL_REQUESTS_TEMPLATE = "pull_requests.html"


def generate_html(duckdb_database: str | Path, output_file: str | Path) -> None:
    """Generate the HTML page that summarizes Xebia's Github contributions.

    Parameters
    ----------
    duckdb_database : str | Path
        The path to the Duckdb database
    output_directory : str | Path
        The directory to output the webpage into
    """
    connection = duckdb.connect(str(duckdb_database), read_only=True)

    pull_requests_sql = (
        "SELECT author, title, url "
        "FROM main_consumers_xebia.consm_xebia_pull_requests"
    )
    pull_requests = connection.sql(pull_requests_sql).df()

    unique_authors = pull_requests["author"].unique().tolist()
    titles_and_urls = pull_requests[["title", "url"]].drop_duplicates().to_records(index=False)

    env = Environment(loader=FileSystemLoader(TEMPLATES_PATH))
    template = env.get_template(PULL_REQUESTS_TEMPLATE)
    html = template.render(
        authors=unique_authors,
        titles_and_urls=titles_and_urls,
    )

    output_path = Path(output_file)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with Path(output_file).open("w") as f:
        f.write(html)


if __name__ == "__main__":
    parser = argparse.ArgumentParser("Generate Xebia pull request website")

    parser.add_argument("duckdb_database", type=Path)
    parser.add_argument("output_file", type=Path)

    args = parser.parse_args()

    if not args.duckdb_database.is_file():
        raise ValueError(f"Database does not exists: {args.duckdb_database}")

    generate_html(args.duckdb_database, args.output_file)
