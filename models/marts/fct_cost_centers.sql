select
    cost_center_name,
    user_login
from {{ ref('stg_cost_centers') }}
