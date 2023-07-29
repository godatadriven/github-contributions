SELECT
    title,
    body,
    user_login AS author,
    author_association,
    owner_and_repository.full_repository_name,
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
FROM {{ ref("int_pull_requests") }}
