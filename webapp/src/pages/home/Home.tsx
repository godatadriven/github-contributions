import { Counter, OrderedCounter } from '../../types/global.ts';
import { Grid, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';
import { ChartWrapperOptions } from 'react-google-charts';
import { format } from 'date-fns';

import PlaceholderCard from '../../components/PlaceHolderCard.tsx';
import useQuery from '../../hooks/useQuery.ts';


const chartOptions: ChartWrapperOptions['options'] = {
    colors: ['#6C1D5F'],
    hAxis: {
        minValue: 0,
    },
    vAxis: {
        title: 'Amount of Pull Requests',
        minValue: 0,
    },
    legend: {
        position: 'none'
    }
};

function Home() {
    const [weeklyPullRequestChartData, setWeeklyPullRequestChartData] = useState<(string | number)[][]>([]);
    const [monthlyPullRequestChartData, setMonthlyPullRequestChartData] = useState<(string | number)[][]>([]);
    const { data: pullRequestCount,  loading: loadingPullRequests } = useQuery<Counter>(
        'SELECT count(*) as amount FROM main_marts.fct_pull_requests;'
    );
    const { data: repositoryCount, loading: loadingRepositories } = useQuery<Counter>(
        'SELECT count(*) as amount FROM main_marts.fct_repositories;'
    );
    const { data: contributorCount, loading: loadingConbributors } = useQuery<Counter>(
        'SELECT count(distinct author) as amount FROM main_marts.fct_pull_requests;'
    );
    const { data: weeklyPullRequestCounts, loading: loadingWeeklyData } = useQuery<OrderedCounter<Date>>(
        `
            SELECT
                DATE_TRUNC('week', CAST(created_at AS DATE)) AS orderedField,
                COUNT(DISTINCT title) AS amount
            FROM
                main_marts.fct_pull_requests
            WHERE
                CAST(created_at AS DATE) >= date_add(CURRENT_DATE(), INTERVAL '-1 year')
            GROUP BY
                DATE_TRUNC('week', CAST(created_at AS DATE))
            ORDER BY
                orderedField;
        `
    );
    const { data: monthlyPullRequestCounts, loading: loadingMonthlyData } = useQuery<OrderedCounter<Date>>(
        `
            SELECT
                DATE_TRUNC('month', CAST(created_at AS DATE)) AS orderedField,
                COUNT(DISTINCT title) AS amount
            FROM
                main_marts.fct_pull_requests
            WHERE
                CAST(created_at AS DATE) >= date_add(CURRENT_DATE(), INTERVAL '-1 year')
            GROUP BY
                DATE_TRUNC('month', CAST(created_at AS DATE))
            ORDER BY
                orderedField;
        `
    );

    const prepareChartData = (data: OrderedCounter<Date>[], columns: (string | number)[][]) => {
        const chartData = data.map((item) => [
            format(item.orderedField, 'dd-MM-yyyy'),
            item.amount
        ]);
        return columns.concat(chartData);
    };

    useEffect(() => {
        if (weeklyPullRequestCounts && monthlyPullRequestCounts && !weeklyPullRequestChartData && !monthlyPullRequestChartData) {
            setWeeklyPullRequestChartData(prepareChartData(weeklyPullRequestCounts, [['Week', 'Amount']]));
            setMonthlyPullRequestChartData(prepareChartData(monthlyPullRequestCounts, [['Maand', 'Amount']]));
        }
    }, [weeklyPullRequestCounts, monthlyPullRequestCounts, weeklyPullRequestChartData, monthlyPullRequestChartData]);


    return (
        <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
                <PlaceholderCard title="Total PRs" loading={loadingPullRequests}>
                    {!!pullRequestCount && (<Typography variant="h4">{pullRequestCount[0].amount}</Typography>)}
                </PlaceholderCard>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
                <PlaceholderCard title="Total Repositories" loading={loadingRepositories}>
                    {!!repositoryCount && (<Typography variant="h4">{repositoryCount[0].amount}</Typography>)}
                </PlaceholderCard>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
                <PlaceholderCard title="Total Contributors" loading={loadingConbributors}>
                    {!!contributorCount && (<Typography variant="h4">{contributorCount[0].amount}</Typography>)}
                </PlaceholderCard>
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
                <PlaceholderCard title="Pull requests per week (last year)" loading={loadingWeeklyData}>
                    {!!weeklyPullRequestChartData && (<Chart
                        chartType="ColumnChart"
                        width="100%"
                        height="400px"
                        data={weeklyPullRequestChartData}
                        options={{
                            ...chartOptions,
                            hAxis: {
                                title: 'Week'
                            }
                        }}
                    />)}
                </PlaceholderCard>
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
                <PlaceholderCard title="Pull requests per month (last year)" loading={loadingMonthlyData}>
                    {!!monthlyPullRequestChartData && (<Chart
                        chartType="ColumnChart"
                        width="100%"
                        height="400px"
                        data={monthlyPullRequestChartData}
                        options={{
                            ...chartOptions,
                            hAxis: {
                                title: 'Month'
                            }
                        }}
                    />)}
                </PlaceholderCard>
            </Grid>
        </Grid>
    );

}
export default Home;
