# Github contributions 

Keep track of your Github contributions!

## Contributions

The following **public** Github contributions are tracked:
1. Pull requests to repositories

### Public contributions

Only public contributions are tracked to avoid a potential data breach. 

This is enforced by:
- not authenticating to the Github API
- AND explicitly query for public contributions

## Data access

The contributions are made **publicly** available as a Duckdb file through
the artifacts in Github actions.

## Track your Github contributions

Add your Github handle to the `authors` variable in the
[dbt_project.yml](./dbt_project.yml) to track your Github contributions.

Contributions are only tracked when a Github user opted-in:
1. A Github handle is added through a pull request.
2. The Github user approves the pull request that adds hers or his Github handle.
3. Git and Github is used for auditing.

## **STOP** tracking your Github contributions

Remove your Github handle from the `authors` variable in the
[dbt_project.yml](./dbt_project.yml) to stop tracking your Github contributions.

Github users can decide to stop tracking their contributions at any time:
1. A Github handle is removed through a pull request.
2. A Github user approves the pull request that removes hers or his Github handle.
3. Git and Github is used for auditing.

### Data retention

Data is retained for a maximum of **30** days. If you remove your Github handle,
the data gathered until then remains available for a maximum of **30** days.
