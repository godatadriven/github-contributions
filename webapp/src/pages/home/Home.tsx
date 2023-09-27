import { Counter, OrderedCounter } from '../../types/global.ts';
import { Grid, Typography, useTheme } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { ApexOptions } from 'apexcharts';
import { format } from 'date-fns';

import PlaceholderCard from '../../components/PlaceHolderCard.tsx';
import ReactApexChart from 'react-apexcharts';
import useQuery from '../../hooks/useQuery.ts';


function Home() {
    const [allDataLoaded, setAllDataLoaded] = useState(false);
    const { data: pullRequestCount, loading: loadingPullRequests } = useQuery<Counter>(
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
            SELECT DATE_TRUNC('week', CAST(created_at AS DATE)) AS orderedField,
                   COUNT(DISTINCT title)                        AS amount
            FROM main_marts.fct_pull_requests
            WHERE CAST(created_at AS DATE) >= date_add(CURRENT_DATE(), INTERVAL '-1 year')
            GROUP BY DATE_TRUNC('week', CAST(created_at AS DATE))
            ORDER BY orderedField;
        `
    );
    const { data: monthlyPullRequestCounts, loading: loadingMonthlyData } = useQuery<OrderedCounter<Date>>(
        `
            SELECT DATE_TRUNC('month', CAST(created_at AS DATE)) AS orderedField,
                   COUNT(DISTINCT title)                         AS amount
            FROM main_marts.fct_pull_requests
            WHERE CAST(created_at AS DATE) >= date_add(CURRENT_DATE(), INTERVAL '-1 year')
            GROUP BY DATE_TRUNC('month', CAST(created_at AS DATE))
            ORDER BY orderedField;
        `
    );
    const { data: pullRequestsPerRepository, loading: loadingPerRepoData } = useQuery<OrderedCounter<string>>(
        `
            SELECT repository            AS            orderedField,
                   COUNT(DISTINCT title) AS amount
            FROM main_marts.fct_pull_requests
            WHERE CAST(created_at AS DATE) >= date_add(CURRENT_DATE(), INTERVAL '-1 year')
            GROUP BY repository
            ORDER BY amount DESC;
        `
    );
    const theme = useTheme();

    const chartOptions = useMemo<ApexOptions>(() => ({
        chart: {
            type: 'bar',
        },
        colors: [theme.palette.primary.main],
        plotOptions: {
            bar: {
                borderRadius: 4,
                dataLabels: {
                    position: 'top',
                },
            }
        },
        dataLabels: {
            enabled: true,
            offsetY: -20,
            style: {
                fontSize: '10px',
                colors: [theme.palette.text.primary]
            }
        },
        xaxis: {
            position: 'top',
            axisTicks: {
                show: false
            },
            tooltip: {
                enabled: true,
            },
            labels: {
                show: false
            }
        },
        yaxis: {
            axisBorder: {
                show: true
            },
            axisTicks: {
                show: true,
                color: theme.palette.text.secondary,
            },
            labels: {
                show: true,
                style: {
                    colors: [theme.palette.text.primary]
                }
            }
        },
    }), [theme]);

    useEffect(() => {
        if (
            pullRequestCount &&
            repositoryCount &&
            contributorCount &&
            weeklyPullRequestCounts &&
            monthlyPullRequestCounts &&
            pullRequestsPerRepository
        ) {
            setAllDataLoaded(true); // so the UI triggers only one rerender
        }
    }, [
        pullRequestCount,
        repositoryCount,
        contributorCount,
        weeklyPullRequestCounts,
        monthlyPullRequestCounts,
        pullRequestsPerRepository,
    ]);

    return (
        <Grid container spacing={2}>
            {allDataLoaded && (
                <>
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
                            {!!weeklyPullRequestCounts && (
                                <ReactApexChart
                                    options={{
                                        ...chartOptions,
                                        xaxis: {
                                            ...chartOptions.xaxis,
                                            categories: weeklyPullRequestCounts.map(item => format(item.orderedField, 'dd-MM-yyyy (\'week\' II)')),
                                        }
                                    }}
                                    series={[
                                        {
                                            name: 'Pull requests',
                                            data: weeklyPullRequestCounts.map(item => item.amount),
                                            type: 'bar'
                                        }
                                    ]}
                                    type="bar"
                                />
                            )}
                        </PlaceholderCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                        <PlaceholderCard title="Pull requests per month (last year)" loading={loadingMonthlyData}>
                            {!!monthlyPullRequestCounts && (
                                <ReactApexChart
                                    options={{
                                        ...chartOptions,
                                        xaxis: {
                                            ...chartOptions.xaxis,
                                            categories: monthlyPullRequestCounts.map(item => format(item.orderedField, 'MMMM yyyy')),
                                        }
                                    }}
                                    series={[{
                                        name: 'Pull requests',
                                        data: monthlyPullRequestCounts.map(item => item.amount),
                                        type: 'bar'
                                    }]}
                                    type="bar"
                                />
                            )}
                        </PlaceholderCard>
                    </Grid>
                    <Grid item xs={12} sm={12} md={12}>
                        <PlaceholderCard title="Contribution treemap (last year)" loading={loadingPerRepoData}>
                            {!!pullRequestsPerRepository && (
                                <ReactApexChart
                                    options={{
                                        ...chartOptions,
                                        chart: {
                                            ...chartOptions.chart,
                                            type: 'treemap'
                                        }
                                    }}
                                    series={[{
                                        data: pullRequestsPerRepository.map(item => ({
                                            x: item.orderedField,
                                            y: item.amount
                                        })),
                                    }]}
                                    type="treemap"
                                />
                            )}
                        </PlaceholderCard>
                    </Grid>
                </>
            )}
        </Grid>
    );

}

export default Home;
