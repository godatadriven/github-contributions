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

with
    authors as (
        select *
        from
            (
                values
                    {%- for author in var("authors") -%}
                        ('{{ author.name }}', '{{  author.organization }}')
                        {%- if not loop.last %}, {%- endif -%}
                    {%- endfor -%}
            ) author(name, organization)
    )

select
    pull_requests.title,
    pull_requests.body,
    pull_requests.user_login as author,
    authors.organization as author_organization,
    pull_requests.author_association,
    pull_requests.owner_and_repository.full_repository_name,
    pull_requests.owner_and_repository.owner,
    pull_requests.owner_and_repository.repository,
    pull_requests.state,
    pull_requests.draft,
    pull_requests.comments,
    pull_requests.created_at,
    pull_requests.updated_at,
    pull_requests.closed_at,
    pull_requests.pull_request_merged_at as merged_at,
    pull_requests.reactions_total_count,
    pull_requests.html_url as url,
from {{ ref("int_pull_requests") }} as pull_requests
left join authors on pull_requests.user_login = authors.name
