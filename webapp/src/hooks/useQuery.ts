import { useDuckDbQuery } from 'duckdb-wasm-kit';

function useQuery<T>(query: string) {
    const { arrow, loading, error } = useDuckDbQuery(query);

    if (!loading && arrow) {
        const data: T[] = arrow.toArray().map(record => record.toJSON());
        return { data, loading, error };
    }

    return { data: undefined, loading, error };
}

export default useQuery;