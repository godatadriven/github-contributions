select
    cast(url as varchar) as url,
    cast(repository_url as varchar) as repository_url,
    cast(labels_url as varchar) as labels_url,
    cast(comments_url as varchar) as comments_url,
    cast(events_url as varchar) as events_url,
    cast(html_url as varchar) as html_url,
    cast(id as bigint) as id,
    cast(node_id as varchar) as node_id,
    cast("number" as bigint) as "number",
    cast(title as varchar) as title,

    -- user
    cast(user_login as varchar) as user_login,
    cast(user_id as integer) as user_id,
    cast(user_node_id as varchar) as user_node_id,
    cast(user_avatar_url as varchar) as user_avatar_url,
    cast(user_gravatar_id as varchar) as user_gravatar_id,
    cast(user_url as varchar) as user_url,
    cast(user_html_url as varchar) as user_html_url,
    cast(user_followers_url as varchar) as user_followers_url,
    cast(user_following_url as varchar) as user_following_url,
    cast(user_gists_url as varchar) as user_gists_url,
    cast(user_starred_url as varchar) as user_starred_url,
    cast(user_subscriptions_url as varchar) as user_subscription_url,
    cast(user_organizations_url as varchar) as user_organizations_url,
    cast(user_repos_url as varchar) as user_repose_url,
    cast(user_events_url as varchar) as user_events_url,
    cast(user_received_events_url as varchar) as user_received_events_url,
    cast(user_type as varchar) as user_type,
    cast(user_site_admin as boolean) as user_site_admin,

    -- labels : Can not select because is a list
    -- CAST(labels_id AS BIGINT) As labels_id,
    -- CAST(labels_node_id AS VARCHAR) AS labels_node_id,
    -- CAST(labels_url AS VARCHAR) AS labels_url,
    -- CAST(labels_name AS VARCHAR) AS labels_name,
    -- CAST(labels_color AS VARCHAR) AS labels_color,
    -- CAST(labels_default AS BOOLEAN) AS labels_default,
    -- CAST(labels_description AS VARCHAR) AS labels_description,
    cast(state as varchar) as state,
    cast(locked as boolean) as locked,

    -- assignee
    cast(assignee_login as varchar) as assignee_login,
    cast(assignee_id as integer) as assignee_id,
    cast(assignee_node_id as varchar) as assignee_node_id,
    cast(assignee_avatar_url as varchar) as assignee_avatar_url,
    cast(assignee_gravatar_id as varchar) as assignee_gravatar_id,
    cast(assignee_url as varchar) as assignee_url,
    cast(assignee_html_url as varchar) as assignee_html_url,
    cast(assignee_followers_url as varchar) as assignee_followers_url,
    cast(assignee_following_url as varchar) as assignee_following_url,
    cast(assignee_gists_url as varchar) as assignee_gists_url,
    cast(assignee_starred_url as varchar) as assignee_starred_url,
    cast(assignee_subscriptions_url as varchar) as assignee_subscriptions_url,
    cast(assignee_organizations_url as varchar) as assignee_organizations_url,
    cast(assignee_repos_url as varchar) as assignee_repos_url,
    cast(assignee_events_url as varchar) as assignee_events_url,
    cast(assignee_received_events_url as varchar) as assignee_received_events_url,
    cast(assignee_type as varchar) as assignee_type,
    cast(assignee_site_admin as boolean) as assignee_site_admin,

    -- assignees - Can not select because is a list
    -- CAST(assignees_login AS VARCHAR) AS assignees_login,
    -- CAST(assignees_id AS INTEGER) AS assignees_id,
    -- CAST(assignees_node_id AS VARCHAR) AS assignees_node_id,
    -- CAST(assignees_avatar_url AS VARCHAR) AS assignees_avatar_url,
    -- CAST(assignees_gravatar_id AS VARCHAR) AS assignees_gravatar_id,
    -- CAST(assignees_url AS VARCHAR) AS assignees_url,
    -- CAST(assignees_html_url AS VARCHAR) AS assignees_html_url,
    -- CAST(assignees_followers_url AS VARCHAR) AS assignees_followers_url,
    -- CAST(assignees_following_url AS VARCHAR) AS assignees_following_url,
    -- CAST(assignees_gists_url AS VARCHAR) AS assignees_gists_url,
    -- CAST(assignees_starred_url AS VARCHAR) AS assignees_starred_url,
    -- CAST(assignees_subscriptions_url AS VARCHAR) AS assignees_subscriptions_url,
    -- CAST(assignees_organizations_url AS VARCHAR) AS assignees_organizations_url,
    -- CAST(assignees_repos_url AS VARCHAR) AS assignees_repos_url,
    -- CAST(assignees_events_url AS VARCHAR) AS assignees_events_url,
    -- CAST(assignees_received_events_url AS VARCHAR) AS assignees_received_events_url,
    -- CAST(assignees_"type" AS VARCHAR) AS assignees_type,
    -- CAST(assignees_site_admin AS BOOLEAN) AS assignees_site_admin,
    -- milestone
    cast(milestone_url as varchar) as milestone_url,
    cast(milestone_html_url as varchar) as milestone_html_url,
    cast(milestone_labels_url as varchar) as milestone_labels_url,
    cast(milestone_id as integer) as milestone_id,
    cast(milestone_node_id as varchar) as milestone_node_id,
    cast(milestone_number as tinyint) as milestone_number,
    cast(milestone_title as varchar) as milestone_title,
    cast(milestone_description as varchar) as milestone_description,
    cast(milestone_open_issues as tinyint) as milestone_open_issues,
    cast(milestone_closed_issues as tinyint) as milestone_closed_issues,
    cast(milestone_state as varchar) as milestone_state,
    cast(milestone_created_at as varchar) as milestone_created_at,
    cast(milestone_updated_at as varchar) as milestone_updated_at,
    cast(milestone_due_on as varchar) as milestone_due_on,
    cast(milestone_closed_at as varchar) as milestone_closed_at,

    -- milestone_creator
    cast(milestone_creator_login as varchar) as milestone_creator_login,
    cast(milestone_creator_id as integer) as milestone_creator_id,
    cast(milestone_creator_node_id as varchar) as milestone_creator_node_id,
    cast(milestone_creator_avatar_url as varchar) as milestone_creator_avatar_url,
    cast(milestone_creator_gravatar_id as varchar) as milestone_creator_gravatar_id,
    cast(milestone_creator_url as varchar) as milestone_creator_url,
    cast(milestone_creator_html_url as varchar) as milestone_creator_html_url,
    cast(milestone_creator_followers_url as varchar) as milestone_creator_followers_url,
    cast(milestone_creator_following_url as varchar) as milestone_creator_following_url,
    cast(milestone_creator_gists_url as varchar) as milestone_creator_gists_url,
    cast(milestone_creator_starred_url as varchar) as milestone_creator_starred_url,
    cast(
        milestone_creator_subscriptions_url as varchar
    ) as milestone_creator_subscriptions_url,
    cast(
        milestone_creator_organizations_url as varchar
    ) as milestone_creator_organizations_url,
    cast(milestone_creator_repos_url as varchar) as milestone_creator_repos_url,
    cast(milestone_creator_events_url as varchar) as milestone_creator_events_url,
    cast(
        milestone_creator_received_events_url as varchar
    ) as milestone_creator_received_events_url,
    cast(milestone_creator_type as varchar) as milestone_creator_type,
    cast(milestone_creator_site_admin as boolean) as site_admin,

    cast(comments as bigint) as comments,
    cast(created_at as varchar) as created_at,
    cast(updated_at as varchar) as updated_at,
    cast(closed_at as varchar) as closed_at,
    cast(author_association as varchar) as author_association,
    cast(active_lock_reason as varchar) as active_lock_reason,
    cast(draft as boolean) as draft,

    -- pull_request
    cast(pull_request_url as varchar) as pull_request_url,
    cast(pull_request_html_url as varchar) as pull_request_html_url,
    cast(pull_request_diff_url as varchar) as pull_request_diff_url,
    cast(pull_request_patch_url as varchar) as pull_request_patch_url,
    cast(pull_request_merged_at as varchar) as pull_request_merged_at,

    cast(body as varchar) as body,

    -- reactions
    cast(reactions_url as varchar) as reactions_url,
    cast(reactions_total_count as tinyint) as reactions_total_count,
    cast("reactions_+1" as tinyint) as reactions_plus_one,
    cast("reactions_-1" as tinyint) as reactions_minus_one,
    cast(reactions_laugh as tinyint) as reactions_laugh,
    cast(reactions_hooray as tinyint) as reactions_hooray,
    cast(reactions_confused as tinyint) as reactions_confused,
    cast(reactions_heart as tinyint) as reactions_heart,
    cast(reactions_rocket as tinyint) reactions_rocket,
    cast(reactions_eyes as tinyint) as reactions_eyes,

    cast(timeline_url as varchar) as timeline_url,
    cast(performed_via_github_app as integer) as performed_via_github_app,
    cast(state_reason as integer) as state_reason,
    cast(score as double) as score,
from {{ ref("src_deduplicated_pull_requests") }}
