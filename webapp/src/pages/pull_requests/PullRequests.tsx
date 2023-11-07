import { PullRequest } from '../../types/global.ts';

import GlobalSpinner from '../../components/GlobalSpinner.tsx';
import MaterialReactTable from 'material-react-table';
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
            accessorKey: key,
            header: key.toUpperCase(),
        }));

        return (
            <MaterialReactTable
                columns={columns}
                data={pullRequests.map((record, index) => ({ ...record, id: index }))}
                enableColumnResizing
                columnResizeMode='onChange'
                initialState={{
                    columnVisibility: {
                        url: false,
                        body: false,
                        updated_at: false,
                        created_at: false,
                        closed_at: false,
                        draft: false,
                        repository: false,
                        owner: false,
                        author_association: false

                    },
                    density: 'compact',
                    pagination: { pageIndex: 0, pageSize: 15 },
                }}
                muiTablePaginationProps={{
                    rowsPerPageOptions: [15, 20, 50, 100],
                  }}
            />

        );
    }

    return <></>;

}

export default PullRequests;
