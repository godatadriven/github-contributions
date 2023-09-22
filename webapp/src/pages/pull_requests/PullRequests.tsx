import {PullRequest} from '../../types/PullRequest.ts';
import {useDuckDbQuery} from '../../../duckdb-wasm-kit/index';
import {Container} from '@mui/material';
import {DataGrid, GridToolbar} from '@mui/x-data-grid';
import GlobalSpinner from '../../components/GlobalSpinner.tsx';


function PullRequests() {
    const {
        arrow,
        loading,
        error
    } = useDuckDbQuery('SELECT * FROM main_marts.fct_pull_requests ORDER BY updated_at DESC;');

    if (loading) {
        return <GlobalSpinner/>;
    }

    if (error) {
        return <>Something went wrong..</>;
    }

    if (arrow) {
        const records: PullRequest[] = arrow.toArray().map((record: { toJSON: () => PullRequest; }) => record.toJSON());
        const columns = Object.keys(records[0]).map(key => ({
            field: key,
            headerName: key.toUpperCase()
        }));
        console.log(columns);
        return (
            <Container fixed maxWidth="xl">
                <DataGrid
                    slots={{toolbar: GridToolbar}}
                    columns={columns}
                    rows={records.map((record, index) => ({...record, id: index}))}
                    initialState={{
                        pagination: {
                            paginationModel: {page: 0, pageSize: 15},
                        },
                    }}
                    pageSizeOptions={[15, 20, 50, 100]}
                />
            </Container>
        );
    }

    return <></>;

}

export default PullRequests;
