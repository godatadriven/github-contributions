select *
from {{ ref("fct_pull_requests") }}
where 'dbt-labs' = owner or contains(repository, 'dbt') or suffix(repository, '-utils')
order by state desc, draft asc, closed_at desc
