SELECT * FROM {{ source('github_contributions', 'src_repositories') }}
