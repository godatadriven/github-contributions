SELECT * FROM {{ source('github_contributions', 'pull_requests') }}
