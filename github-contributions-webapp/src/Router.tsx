import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { DuckDBConfig, DuckDBAccessMode } from '@duckdb/duckdb-wasm';
import { initializeDuckDb } from 'duckdb-wasm-kit';
import { useEffect, useState } from 'react';

import Home from './pages/home/Home.tsx';

const config: DuckDBConfig = {
    query: {
        castBigIntToDouble: true,
    },
    path: './assets/github_contributions.duckdb',
    accessMode: DuckDBAccessMode.AUTOMATIC,
};

const router = createBrowserRouter([
    {
        path: '/',
        element: <Home/>,
    },
]);

function Router() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        initializeDuckDb({ config, debug: true }).then(() => setLoading(false));
    }, []);

    return loading ? (<>loading</>) : (<RouterProvider router={router}/>);
}

export default Router;