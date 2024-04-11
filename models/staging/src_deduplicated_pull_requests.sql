{{ dbt_utils.deduplicate(
    relation=source("github_contributions", "src_pull_requests"),
    partition_by="pull_request_url",
    order_by="updated_at desc",
   )
}}
