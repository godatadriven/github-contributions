SELECT
    *,
    regexp_extract(
        html_url,
        '^https:/\/github\.com\/(.+)\/(.+)\/pull\/\d+$',
        ['owner', 'repository']
    ) AS owner_and_repository
FROM {{ ref("stg_pull_requests") }}
