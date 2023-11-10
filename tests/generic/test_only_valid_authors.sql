{% test only_valid_authors(model, column_name, valid_authors) %}

with validation as (
    select
        distinct lower({{ column_name }}) as author
    from {{ model }}
),

validation_errors as (
    select
        author
    from validation
    where author not in (
        {%- for author in valid_authors -%}
            '{{ author | lower }}'{% if not loop.last %},{% endif %}
        {%- endfor -%}
    )
)

select *
from validation_errors

{% endtest %}
