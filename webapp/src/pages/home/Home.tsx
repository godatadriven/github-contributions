import { Grid } from '@mui/material';
import PlaceholderCard from '../../components/PlaceHolderCard.tsx';
import { useDuckDbQuery } from 'duckdb-wasm-kit';

function Home() {
    const {
        arrow: arrow1,
        loading: loading1,
    } = useDuckDbQuery('SELECT count(*) as amount FROM main_marts.fct_pull_requests;');
    const {
        arrow: arrow2,
        loading: loading2
    } = useDuckDbQuery('SELECT count(*) as amount FROM main_marts.fct_repositories;');
    const {
        arrow: arrow3,
        loading: loading3
    } = useDuckDbQuery('SELECT count(distinct author) as amount FROM main_marts.fct_pull_requests;');

    if (!loading1) {
        console.log();
    }
    return (
        <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
                <PlaceholderCard title="Total PRs" value={arrow1?.get(0)?.toJSON().amount} loading={loading1} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
                <PlaceholderCard title="Total Repositories" value={arrow2?.get(0)?.toJSON().amount} loading={loading2} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
                <PlaceholderCard title="Total Contributors" value={arrow3?.get(0)?.toJSON().amount} loading={loading3} />
            </Grid>
            {/* Add more cards as needed */}
        </Grid>
    );

}
export default Home;
