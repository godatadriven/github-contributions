select
    cost_center_name,
    user_login
from {{ source('github_contributions', 'src_cost_centers') }}
