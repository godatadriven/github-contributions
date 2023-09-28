
export interface QueryFilter {
    column: string;
    operator: string;
    target: string;
}
function useQueryFilter(filters: (QueryFilter | undefined)[]): string {
    if (filters.length === 0 || filters.every(item => item === undefined)) {
        return ''; // Return an empty string if there are no filters
    }

    const activeFilters = filters.filter((item): item is QueryFilter => item !== undefined);

    const whereClauses = activeFilters.map((filter) => {
        return `${filter.column} ${filter.operator} ${filter.target}`;
    });

    const whereClause = whereClauses.join(' AND ');

    return `WHERE ${whereClause}`;
}

export default useQueryFilter;