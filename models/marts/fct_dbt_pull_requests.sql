SELECT *
FROM {{ ref('int_pull_requests') }}
WHERE 'dbt-labs' = owner OR contains(repository, 'dbt') OR suffix(repository, '-utils')
ORDER BY state DESC, draft ASC, closed_at DESC
