select *
from {{ ref("fct_pull_requests") }}
where
    author in (
        {% for author in var("authors") %}
            {% if author.organization == "Xebia" %}
                '{{ author.name }}' {%- if not loop.last %}, {% endif %}
            {% endif %}
        {% endfor %}
    )
order by state desc, draft asc, created_at desc
