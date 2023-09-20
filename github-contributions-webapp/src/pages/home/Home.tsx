import { useDuckDbQuery } from 'duckdb-wasm-kit';

function Home() {
    const { arrow, loading, error } = useDuckDbQuery(
        'SHOW DATABASES;'
    );

    if (loading) {
        return <>loading</>;
    }

    if (error) {
        console.log(error);
        return <>error</>;
    }

    if (arrow) {
        console.log(arrow.toArray().map((row) => row.toJSON()));
        return <>arrow</>;
    }
}

export default Home;
