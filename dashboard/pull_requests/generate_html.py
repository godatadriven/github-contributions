from __future__ import annotations

import argparse
from pathlib import Path

import duckdb
from jinja2 import Environment, FileSystemLoader


PULL_REQUESTS_TEMPLATE = "pull_requests_template.html"


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

    pull_requests_table = "main_consumers_xebia.consm_xebia_pull_requests"
    pull_requests = connection.table(pull_requests_table).to_df()

    unique_authors = pull_requests["author"].unique().tolist()

    env = Environment(loader=FileSystemLoader("pull_requests/"))
    template = env.get_template(PULL_REQUESTS_TEMPLATE)
    html = template.render(
        authors=unique_authors, pull_requests=pull_requests.to_records()
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
