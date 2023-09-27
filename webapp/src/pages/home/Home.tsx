import { Counter, OrderedCounter } from '../../types/global.ts';
import { Grid, Typography, useTheme } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import useQueryFilter, { QueryFilter } from '../../hooks/useQueryFilter.ts';
import { ApexOptions } from 'apexcharts';
import { format } from 'date-fns';

import PlaceholderCard from '../../components/PlaceHolderCard.tsx';
import ReactApexChart from 'react-apexcharts';
import SelectBox from '../../components/SelectBox.tsx';
import useQuery from '../../hooks/useQuery.ts';


function Home() {
    const theme = useTheme();
    const [allDataLoaded, setAllDataLoaded] = useState(false);
    const [authorFilter, setAuthorFilter] = useState<QueryFilter>();
    const [repositoryFilter, setRepositoryFilter] = useState<QueryFilter>();
    const filters = [authorFilter, repositoryFilter];
    const { data: authors } = useQuery<{ author: string }>(
        'SELECT distinct author FROM main_marts.fct_pull_requests;'
    );
    const { data: repositories } = useQuery<{ repository: string }>(
        'SELECT distinct repository FROM main_marts.fct_pull_requests;'
    );
    const { data: pullRequestCount, loading: loadingPullRequests } = useQuery<Counter>(
        `SELECT count(*) as amount FROM main_marts.fct_pull_requests ${useQueryFilter(filters)};`
    );
    const { data: repositoryCount, loading: loadingRepositories } = useQuery<Counter>(
        `SELECT count(distinct repository) as amount FROM main_marts.fct_pull_requests ${useQueryFilter(filters)};`
    );
    const { data: contributorCount, loading: loadingConbributors } = useQuery<Counter>(
        `SELECT count(distinct author) as amount FROM main_marts.fct_pull_requests ${useQueryFilter(filters)};`
    );
    const { data: weeklyPullRequestCounts, loading: loadingWeeklyData } = useQuery<OrderedCounter<Date>>(
        `
            SELECT DATE_TRUNC('week', CAST(created_at AS DATE)) AS orderedField,
                   COUNT(DISTINCT title) AS amount
            FROM main_marts.fct_pull_requests
            ${useQueryFilter([...filters, { column: 'CAST(created_at AS DATE)', operator: '>=', target: 'date_add(CURRENT_DATE(), INTERVAL \'-1 year\')' }])}
            GROUP BY DATE_TRUNC('week', CAST(created_at AS DATE))
            ORDER BY orderedField;
        `
    );
    const { data: monthlyPullRequestCounts, loading: loadingMonthlyData } = useQuery<OrderedCounter<Date>>(
        `
            SELECT DATE_TRUNC('month', CAST(created_at AS DATE)) AS orderedField,
                   COUNT(DISTINCT title) AS amount
            FROM main_marts.fct_pull_requests
             ${useQueryFilter([...filters, { column: 'CAST(created_at AS DATE)', operator: '>=', target: 'DATE_TRUNC(\'month\', CURRENT_DATE() - INTERVAL \'1 year\') + INTERVAL \'1 month\'' }])}
            GROUP BY DATE_TRUNC('month', CAST(created_at AS DATE))
            ORDER BY orderedField;
        `
    );

    const { data: pullRequestsPerRepository, loading: loadingPerRepoData } = useQuery<OrderedCounter<string>>(
        `
            SELECT repository AS orderedField,
                   COUNT(DISTINCT title) AS amount
            FROM main_marts.fct_pull_requests
             ${useQueryFilter([...filters, { column: 'CAST(created_at AS DATE)', operator: '>=', target: 'date_add(CURRENT_DATE(), INTERVAL \'-1 year\')' }])}
            GROUP BY repository
            ORDER BY amount DESC;
        `
    );
    const preparedAuthors = useMemo<string[]>(() => {
        if (authors) {
            const prepData = authors.map(item => item.author);
            prepData.push('All');
            return prepData;
        }
        return ['All'];
    }, [authors]);
    const preparedRepositories = useMemo<string[]>(() => {
        if (repositories) {
            const prepData = repositories.map(item => item.repository);
            prepData.push('All');
            return prepData;
        }
        return ['All'];
    }, [repositories]);

    const onChangeAuthorSelectBox = (value: string) => {
        if (value == 'All') {
            setAuthorFilter(undefined);
        } else {
            setAuthorFilter({
                column: 'author',
                operator: '=',
                target: `'${value}'`
            });
        }
    };

    const onChangeRepositorySelectBox = (value: string) => {
        if (value == 'All') {
            setRepositoryFilter(undefined);
        } else {
            setRepositoryFilter({
                column: 'repository',
                operator: '=',
                target: `'${value}'`
            });
        }
    };

    const chartOptions: ApexOptions = {
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
    };

    useEffect(() => {
        if (
            pullRequestCount &&
            repositoryCount &&
            contributorCount &&
            weeklyPullRequestCounts &&
            monthlyPullRequestCounts &&
            pullRequestsPerRepository &&
            authors &&
            repositories
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
        authors,
        repositories
    ]);

    return (
        <Grid container spacing={2}>
            {allDataLoaded && (
                <>
                    <Grid item xs={12} sm={12} md={6}>
                        {!!preparedAuthors && (<SelectBox
                            label="Author"
                            items={preparedAuthors}
                            onChangeValue={onChangeAuthorSelectBox}
                        />)}
                    </Grid>
                    <Grid item xs={12} sm={12} md={6}>
                        {!!repositories && (<SelectBox
                            label="Repository"
                            items={preparedRepositories}
                            onChangeValue={onChangeRepositorySelectBox}
                        />)}
                    </Grid>
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
                        <PlaceholderCard title="Pull requests per week (past year)" loading={loadingWeeklyData}>
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
                        <PlaceholderCard title="Pull requests per month (past year)" loading={loadingMonthlyData}>
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
                        <PlaceholderCard title="Contribution treemap (past year)" loading={loadingPerRepoData}>
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
