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
