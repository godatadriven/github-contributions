SELECT *
FROM {{ ref('fct_pull_requests') }}
WHERE author IN (
 {% for author in var('authors') %}
 {% if author.organization == 'Xebia' %}
 '{{ author.name }}' {%- if not loop.last %}, {% endif %}
 {% endif %}
 {%endfor %}
)
ORDER BY state DESC, draft ASC, created_at DESC
