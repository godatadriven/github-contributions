WITH extract_owner_and_repository AS (

SELECT
    *,
    regexp_extract(
        html_url,
        '^https:/\/github\.com\/(.+)\/(.+)\/pull\/\d+$',
        ['owner', 'repository']
    ) AS owner_and_repository
FROM {{ ref("stg_pull_requests") }}

)

SELECT
    title,
    body,
    user_login AS author,
    author_association,
    owner_and_repository.owner,
    owner_and_repository.repository,
    state,
    draft,
    comments,
    created_at,
    updated_at,
    closed_at,
    reactions_total_count,
    pull_request_merged_at AS merged_at,
    html_url AS url,
FROM extract_owner_and_repository
