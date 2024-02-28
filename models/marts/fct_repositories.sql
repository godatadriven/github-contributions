-- there is no is_incremental() clause
-- this part is handled by the github_contributions duckdb plugin
-- the plugin checks for every author the last_update and only retrieves newer PRs
-- the plugin also selects all repositories that were already ingested, and skips
-- retrieving those from the API
{{
    config(
        materialized="incremental",
        incremental_strategy="append",
    )
}}

select
    full_name,
    description,
    owner_login as owner,
    name,
    owner_type,
    fork,
    archived,
    disabled,
    created_at,
    updated_at,
    pushed_at,
    stargazers_count,
    watchers_count,
    forks_count,
    open_issues_count,
    network_count,
    subscribers_count,
    language,
from {{ ref("stg_repositories") }}
