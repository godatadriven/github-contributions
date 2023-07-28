SELECT
    CAST(url AS VARCHAR) AS url,
    CAST(repository_url AS VARCHAR) AS repository_url,
    CAST(labels_url AS VARCHAR) AS labels_url,
    CAST(comments_url AS VARCHAR) AS comments_url,
    CAST(events_url AS VARCHAR) AS events_url,
    CAST(html_url AS VARCHAR) AS html_url,
    CAST(id AS BIGINT) AS id,
    CAST(node_id AS VARCHAR) As node_id,
    CAST("number" AS BIGINT) AS "number",
    CAST(title AS VARCHAR) AS title,

    -- user
    CAST(user.login AS VARCHAR) AS user_login,
    CAST(user.id AS INTEGER) AS user_id,
    CAST(user.node_id AS VARCHAR) AS user_node_id,
    CAST(user.avatar_url AS VARCHAR) AS user_avatar_url,
    CAST(user.gravatar_id AS VARCHAR) AS user_gravatar_id,
    CAST(user.url AS VARCHAR) AS user_url,
    CAST(user.html_url AS VARCHAR) AS user_html_url,
    CAST(user.followers_url AS VARCHAR) AS user_followers_url,
    CAST(user.following_url AS VARCHAR) AS user_following_url,
    CAST(user.gists_url AS VARCHAR) AS user_gists_url,
    CAST(user.starred_url AS VARCHAR) AS user_starred_url,
    CAST(user.subscriptions_url AS VARCHAR) AS user_subscription_url,
    CAST(user.organizations_url AS VARCHAR) AS user_organizations_url,
    CAST(user.repos_url AS VARCHAR) AS user_repose_url,
    CAST(user.events_url AS VARCHAR) AS user_events_url,
    CAST(user.received_events_url AS VARCHAR) AS user_received_events_url,
    CAST(user."type" AS VARCHAR) AS user_type,
    CAST(user.site_admin AS BOOLEAN) AS user_site_admin,

    -- labels : Can not select because is a list
    -- CAST(labels.id AS BIGINT) As labels_id,
    -- CAST(labels.node_id AS VARCHAR) AS labels_node_id,
    -- CAST(labels.url AS VARCHAR) AS labels_url,
    -- CAST(labels.name AS VARCHAR) AS labels_name,
    -- CAST(labels.color AS VARCHAR) AS labels_color,
    -- CAST(labels.default AS BOOLEAN) AS labels_default,
    -- CAST(labels.description AS VARCHAR) AS labels_description,

    CAST(state AS VARCHAR) AS state,
    CAST(locked AS BOOLEAN) AS locked,

    -- assignee
    CAST(assignee.login AS VARCHAR) AS assignee_login,
    CAST(assignee.id AS INTEGER) AS assignee_id,
    CAST(assignee.node_id AS VARCHAR) AS assignee_node_id,
    CAST(assignee.avatar_url AS VARCHAR) AS assignee_avatar_url,
    CAST(assignee.gravatar_id AS VARCHAR) AS assignee_gravatar_id,
    CAST(assignee.url AS VARCHAR) AS assignee_url,
    CAST(assignee.html_url AS VARCHAR) AS assignee_html_url,
    CAST(assignee.followers_url AS VARCHAR) AS assignee_followers_url,
    CAST(assignee.following_url AS VARCHAR) AS assignee_following_url,
    CAST(assignee.gists_url AS VARCHAR) AS assignee_gists_url,
    CAST(assignee.starred_url AS VARCHAR) AS assignee_starred_url,
    CAST(assignee.subscriptions_url AS VARCHAR) AS assignee_subscriptions_url,
    CAST(assignee.organizations_url AS VARCHAR) AS assignee_organizations_url,
    CAST(assignee.repos_url AS VARCHAR) AS assignee_repos_url,
    CAST(assignee.events_url AS VARCHAR) AS assignee_events_url,
    CAST(assignee.received_events_url AS VARCHAR) AS assignee_received_events_url,
    CAST(assignee."type" AS VARCHAR) AS assignee_type,
    CAST(assignee.site_admin AS BOOLEAN) AS assignee_site_admin,

    -- assignees - Can not select because is a list
    -- CAST(assignees.login AS VARCHAR) AS assignees_login,
    -- CAST(assignees.id AS INTEGER) AS assignees_id,
    -- CAST(assignees.node_id AS VARCHAR) AS assignees_node_id,
    -- CAST(assignees.avatar_url AS VARCHAR) AS assignees_avatar_url,
    -- CAST(assignees.gravatar_id AS VARCHAR) AS assignees_gravatar_id,
    -- CAST(assignees.url AS VARCHAR) AS assignees_url,
    -- CAST(assignees.html_url AS VARCHAR) AS assignees_html_url,
    -- CAST(assignees.followers_url AS VARCHAR) AS assignees_followers_url,
    -- CAST(assignees.following_url AS VARCHAR) AS assignees_following_url,
    -- CAST(assignees.gists_url AS VARCHAR) AS assignees_gists_url,
    -- CAST(assignees.starred_url AS VARCHAR) AS assignees_starred_url,
    -- CAST(assignees.subscriptions_url AS VARCHAR) AS assignees_subscriptions_url,
    -- CAST(assignees.organizations_url AS VARCHAR) AS assignees_organizations_url,
    -- CAST(assignees.repos_url AS VARCHAR) AS assignees_repos_url,
    -- CAST(assignees.events_url AS VARCHAR) AS assignees_events_url,
    -- CAST(assignees.received_events_url AS VARCHAR) AS assignees_received_events_url,
    -- CAST(assignees."type" AS VARCHAR) AS assignees_type,
    -- CAST(assignees.site_admin AS BOOLEAN) AS assignees_site_admin,

    -- milestone
    CAST(milestone.url AS VARCHAR) AS milestone_url,
    CAST(milestone.html_url AS VARCHAR) AS milestone_html_url,
    CAST(milestone.labels_url AS VARCHAR) AS milestone_labels_url,
    CAST(milestone.id AS INTEGER) AS milestone_id,
    CAST(milestone.node_id AS VARCHAR) AS milestone_node_id,
    CAST(milestone.number AS TINYINT) AS milestone_number,
    CAST(milestone.title AS VARCHAR) AS milestone_title,
    CAST(milestone.description AS VARCHAR) AS milestone_description,
    CAST(milestone.open_issues AS TINYINT) AS milestone_open_issues,
    CAST(milestone.closed_issues AS TINYINT) AS milestone_closed_issues,
    CAST(milestone.state AS VARCHAR) AS milestone_state,
    CAST(milestone.created_at AS VARCHAR) AS milestone_created_at,
    CAST(milestone.updated_at AS VARCHAR) AS milestone_updated_at,
    CAST(milestone.due_on AS VARCHAR) AS milestone_due_on,
    CAST(milestone.closed_at AS VARCHAR) AS milestone_closed_at,

    -- milestone.creator
    CAST(milestone.creator.login AS VARCHAR) AS milestone_creator_login,
    CAST(milestone.creator.id AS INTEGER) AS milestone_creator_id,
    CAST(milestone.creator.node_id AS VARCHAR) AS milestone_creator_node_id,
    CAST(milestone.creator.avatar_url AS VARCHAR) AS milestone_creator_avatar_url,
    CAST(milestone.creator.gravatar_id AS VARCHAR) AS milestone_creator_gravatar_id,
    CAST(milestone.creator.url AS VARCHAR) AS milestone_creator_url,
    CAST(milestone.creator.html_url AS VARCHAR) AS milestone_creator_html_url,
    CAST(milestone.creator.followers_url AS VARCHAR) AS milestone_creator_followers_url,
    CAST(milestone.creator.following_url AS VARCHAR) AS milestone_creator_following_url,
    CAST(milestone.creator.gists_url AS VARCHAR) AS milestone_creator_gists_url,
    CAST(milestone.creator.starred_url AS VARCHAR) AS milestone_creator_starred_url,
    CAST(milestone.creator.subscriptions_url AS VARCHAR) AS milestone_creator_subscriptions_url,
    CAST(milestone.creator.organizations_url AS VARCHAR) AS milestone_creator_organizations_url,
    CAST(milestone.creator.repos_url AS VARCHAR) AS milestone_creator_repos_url,
    CAST(milestone.creator.events_url AS VARCHAR) AS milestone_creator_events_url,
    CAST(milestone.creator.received_events_url AS VARCHAR) AS milestone_creator_received_events_url,
    CAST(milestone.creator."type" AS VARCHAR) AS milestone_creator_type,
    CAST(milestone.creator.site_admin AS BOOLEAN) AS site_admin,

    CAST(comments AS BIGINT) AS comments,
    CAST(created_at AS VARCHAR) AS created_at,
    CAST(updated_at AS VARCHAR) AS updated_at,
    CAST(closed_at AS VARCHAR) AS closed_at,
    CAST(author_association AS VARCHAR) AS author_association,
    CAST(active_lock_reason AS VARCHAR) AS active_lock_reason,
    CAST(draft AS BOOLEAN) AS draft,

    -- pull_request
    CAST(pull_request.url AS VARCHAR) AS pull_request_url,
    CAST(pull_request.html_url AS VARCHAR) AS pull_request_html_url,
    CAST(pull_request.diff_url AS VARCHAR) AS pull_request_diff_url,
    CAST(pull_request.patch_url AS VARCHAR) AS pull_request_patch_url,
    CAST(pull_request.merged_at AS VARCHAR) AS pull_request_merged_at,

    CAST(body AS VARCHAR) AS body,

    -- reactions
    CAST(reactions.url AS VARCHAR) AS reactions_url,
    CAST(reactions.total_count AS TINYINT) AS reactions_total_count,
    CAST(reactions."+1" AS TINYINT) AS reactions_plus_one,
    CAST(reactions."-1" AS TINYINT) AS reactions_minus_one,
    CAST(reactions.laugh AS TINYINT) AS reactions_laugh,
    CAST(reactions.hooray AS TINYINT) AS reactions_hooray,
    CAST(reactions.confused AS TINYINT) AS reactions_confused,
    CAST(reactions.heart AS TINYINT) AS reactions_heart,
    CAST(reactions.rocket AS TINYINT) reactions_rocket,
    CAST(reactions.eyes AS TINYINT) AS reactions_eyes,

    CAST(timeline_url AS VARCHAR) AS timeline_url,
    CAST(performed_via_github_app AS INTEGER) AS performed_via_github_app,
    CAST(state_reason AS INTEGER) AS state_reason,
    CAST(score AS DOUBLE) AS score,

FROM {{ source('github_contributions', 'src_pull_requests') }}