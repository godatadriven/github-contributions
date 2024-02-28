SELECT
    user_login as author,
    max(updated_at) as last_update
FROM {{ ref('stg_pull_requests') }}
group by 1 order by 2 desc
