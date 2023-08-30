from __future__ import annotations

import argparse
from pathlib import Path

import duckdb
from jinja2 import Environment, FileSystemLoader

from definitions import CONSTANTS_TEMPLATE, TEMPLATES_PATH


def generate_constants(duckdb_database: str | Path, output_file: str | Path) -> None:
    """Generate the constants page for the dashboard.

    Parameters
    ----------
    duckdb_database : str | Path
        The path to the Duckdb database
    output_file : str | Path
        The file to output
    """
    connection = duckdb.connect(str(duckdb_database), read_only=True)

    pull_requests_table = "main_consumers_xebia.consm_xebia_pull_requests"
    pull_requests = connection.table(pull_requests_table).to_df()

    unique_authors = pull_requests["author"].nunique()
    unique_pull_requests = pull_requests["url"].nunique()
    unique_projects = pull_requests["full_repository_name"].nunique()

    env = Environment(loader=FileSystemLoader(TEMPLATES_PATH))
    template = env.get_template(CONSTANTS_TEMPLATE)
    html = template.render(
        unique_authors=unique_authors,
        unique_pull_requests=unique_pull_requests,
        unique_projects=unique_projects,
    )

    output_path = Path(output_file)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with Path(output_file).open("w") as f:
        f.write(html)


if __name__ == "__main__":
    parser = argparse.ArgumentParser("Generate constants")

    parser.add_argument("duckdb_database", type=Path)
    parser.add_argument("output_file", type=Path)

    args = parser.parse_args()

    if not args.duckdb_database.is_file():
        raise ValueError(f"Database does not exists: {args.duckdb_database}")

    generate_constants(args.duckdb_database, args.output_file)
