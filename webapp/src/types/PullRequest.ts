export interface PullRequest {
    author: string;
    author_association: string;
    body: undefined | string;
    closed_at: string;
    comments: number;
    created_at: string;
    draft: boolean;
    full_repository_name: string;
    merged_at: string;
    owner: string;
    reactions_total_count: number;
    repository: string;
    state: string;
    title: string;
    updated_at: string;
    url: string;
}