import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { PullRequest } from '../../types/global.ts';

import GlobalSpinner from '../../components/GlobalSpinner.tsx';
import useQuery from '../../hooks/useQuery.ts';

function PullRequests() {
    const { data: pullRequests, loading, error } = useQuery<PullRequest>(
        'SELECT * FROM main_marts.fct_pull_requests ORDER BY updated_at DESC;'
    );

    if (loading) {
        return <GlobalSpinner/>;
    }

    if (error) {
        return <>Something went wrong..</>;
    }

    if (pullRequests) {
        const columns = Object.keys(pullRequests[0]).map(key => ({
            field: key,
            headerName: key.toUpperCase(),
            flex: 1,
        }));

        return (
            <DataGrid
                slots={{ toolbar: GridToolbar }}
                density="compact"
                columns={columns}
                rows={pullRequests.map((record, index) => ({ ...record, id: index }))}
                initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 15 },
                    },
                    columns: {
                        columnVisibilityModel: {
                            url: false,
                            body: false,
                            updated_at: false,
                            created_at: false,
                            closed_at: false,
                            draft: false,
                            repository: false,
                        },
                   },
                }}
                pageSizeOptions={[15, 20, 50, 100]}
            />
        );
    }

    return <></>;

}

export default PullRequests;
