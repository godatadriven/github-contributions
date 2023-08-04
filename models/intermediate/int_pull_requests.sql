select
    *,
    regexp_extract(
        html_url,
        '^https:\/\/github\.com\/((.+)\/(.+))\/pull\/\d+$',
        ['full_repository_name', 'owner', 'repository']
    ) as owner_and_repository
from {{ ref("stg_pull_requests") }}
