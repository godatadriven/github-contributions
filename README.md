# Github contributions 

Keep track of your Github contributions!

## Contributions

The following **public** Github contributions are tracked:
1. Pull requests to repositories

### Data access

The contributions are made **publicly** available as a Duckdb file through
the artifacts in Github actions.

### Data freshness

The data is updated every Thursday at noon UTC time.

## Track your Github contributions

Add your Github handle to the `authors` variable in the
[dbt_project.yml](./dbt_project.yml) to track your Github contributions.

Contributions are only tracked when a Github user opted-in. Git and Github is
used for auditing.

A Github handle is added through a pull request. The Github user:
- Supplies the Github handle her- or himself through a PR
- OR approves the pull request that adds its Github handle.

## **STOP** tracking your Github contributions

Remove your Github handle from the `authors` variable in the
[dbt_project.yml](./dbt_project.yml) to stop tracking your Github contributions.

Github users can decide to stop tracking their contributions at any time. Git
and Github is used for auditing.

A Github handle is removed through a pull request. The Github user:
- Removes the Github handle her- or himself through a PR
- OR approves the pull request that removes its Github handle.

### Data retention

Data is retained for a maximum of **30** days. If you remove your Github handle,
the data gathered until then remains available for a maximum of **30** days.
