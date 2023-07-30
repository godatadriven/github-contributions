SELECT
    *,
    regexp_extract(
        html_url,
        '^https:\/\/github\.com\/((.+)\/(.+))\/pull\/\d+$',
        ['full_repository_name', 'owner', 'repository']
    ) AS owner_and_repository
FROM {{ ref('stg_pull_requests') }}
