import { Counter, OrderedCounter } from '../../types/global.ts';
import { Grid, Typography, useTheme } from '@mui/material';
import { QueryFilter, useQueryFilter } from '../../hooks/useQueryFilter.ts';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApexOptions } from 'apexcharts';
import { format } from 'date-fns';

import PlaceholderCard from '../../components/PlaceHolderCard.tsx';
import ReactApexChart from 'react-apexcharts';
import SelectBox from '../../components/SelectBox.tsx';
import Slider from '../../components/Slider.tsx';
import debounce from 'lodash/debounce';
import useQuery from '../../hooks/useQuery.ts';

function Home() {
    const theme = useTheme();
    const [allDataLoaded, setAllDataLoaded] = useState(false);
    const [authorFilter, setAuthorFilter] = useState<QueryFilter>();
    const [organizationFilter, setOrganizationFilter] = useState<QueryFilter>();
    const [repositoryFilter, setRepositoryFilter] = useState<QueryFilter>();
    const [ownerFilter, setOwnerFilter] = useState<QueryFilter>();
    const [starsFilter, setStarsFilter] = useState<QueryFilter>({
        column: 'rep.stargazers_count',
        operator: '>=',
        target: '2'
    });
    const filters = [authorFilter, organizationFilter, repositoryFilter, ownerFilter, starsFilter];
    const weekStartsQuery = `
        SELECT DATE_TRUNC('week', start_date) AS week_start
        FROM (
            WITH recursive weeks AS (
                SELECT CURRENT_DATE - INTERVAL '1 year' + INTERVAL '1 week' AS start_date, 
                    CURRENT_DATE AS end_date
                UNION ALL
                SELECT start_date + INTERVAL '1 week',
                    end_date
                FROM weeks
                WHERE start_date < end_date
            )
            SELECT start_date
            FROM weeks
        )
    `;
    const PullRequestCountByWeekQuery = `
        SELECT DATE_TRUNC('week', CAST(pr.created_at AS DATE)) AS orderedField,
               COUNT(DISTINCT title) AS amount
        FROM main_marts.fct_pull_requests pr
        LEFT JOIN main_marts.fct_repositories rep ON full_repository_name = rep.full_name
        ${useQueryFilter([...filters, { column: 'CAST(pr.created_at AS DATE)', operator: '>=', target: 'date_add(CURRENT_DATE(), INTERVAL \'-1 year\')' }])}
        GROUP BY DATE_TRUNC('week', CAST(pr.created_at AS DATE))
        ORDER BY orderedField
    `;

    const authorQuery = 'SELECT distinct author FROM main_marts.fct_pull_requests ORDER BY lower(author);';
    const organizationQuery = 'SELECT distinct author_organization AS organization FROM main_marts.fct_pull_requests ORDER BY lower(author_organization);';
    const repositoryQuery = 'SELECT distinct repository FROM main_marts.fct_pull_requests ORDER BY lower(repository);';
    const ownerQuery = 'SELECT distinct owner FROM main_marts.fct_pull_requests ORDER BY lower(owner);';
    const pullRequestCountQuery = `SELECT count(*) as amount FROM main_marts.fct_pull_requests pr LEFT JOIN main_marts.fct_repositories rep ON pr.full_repository_name = rep.full_name ${useQueryFilter(filters)};`;
    const repoCountQuery = `SELECT count(distinct repository) as amount FROM main_marts.fct_pull_requests pr LEFT JOIN main_marts.fct_repositories rep ON pr.full_repository_name = rep.full_name ${useQueryFilter(filters)};`;
    const contributorCountQuery = `SELECT count(distinct author) as amount FROM main_marts.fct_pull_requests pr LEFT JOIN main_marts.fct_repositories rep ON pr.full_repository_name = rep.full_name ${useQueryFilter(filters)};`;
    const weeklyPullRequestCountQuery = `
        WITH week_starts AS (${weekStartsQuery}),
            weekly_prs AS (${PullRequestCountByWeekQuery})
        SELECT week_starts.week_start as orderedField, COALESCE(weekly_prs.amount, 0) AS amount
        FROM week_starts
                 LEFT JOIN weekly_prs ON week_starts.week_start = weekly_prs.orderedField
        ORDER BY orderedField;
    `;
    const monthlyPullRequestCountQuery = `
        SELECT DATE_TRUNC('month', CAST(pr.created_at AS DATE)) AS orderedField,
               COUNT(DISTINCT pr.title) AS amount
        FROM main_marts.fct_pull_requests pr
        LEFT JOIN main_marts.fct_repositories rep ON full_repository_name = rep.full_name
         ${useQueryFilter([...filters, { column: 'CAST(pr.created_at AS DATE)', operator: '>=', target: 'DATE_TRUNC(\'month\', CURRENT_DATE() - INTERVAL \'1 year\') + INTERVAL \'1 month\'' }])}
        GROUP BY DATE_TRUNC('month', CAST(pr.created_at AS DATE))
        ORDER BY orderedField;
    `;
    const pullRequestsPerRepoQuery = `SELECT repository AS orderedField, COUNT(DISTINCT title) AS amount FROM main_marts.fct_pull_requests LEFT JOIN main_marts.fct_repositories rep ON full_repository_name = rep.full_name ${useQueryFilter([...filters])} GROUP BY repository ORDER BY amount DESC LIMIT 100;`;

    const { data: authors } = useQuery<{ author: string }>(authorQuery);
    const { data: organizations } = useQuery<{ organization: string }>(organizationQuery);
    const { data: repositories } = useQuery<{ repository: string }>(repositoryQuery);
    const { data: owners } = useQuery<{ owner: string }>(ownerQuery);
    const { data: pullRequestCount, loading: loadingPullRequests } = useQuery<Counter>(pullRequestCountQuery);
    const { data: repositoryCount, loading: loadingRepositories } = useQuery<Counter>(repoCountQuery);
    const { data: contributorCount, loading: loadingContributors } = useQuery<Counter>(contributorCountQuery);
    const { data: weeklyPullRequestCounts, loading: loadingWeeklyData } = useQuery<OrderedCounter<Date>>(weeklyPullRequestCountQuery);
    const { data: monthlyPullRequestCounts, loading: loadingMonthlyData } = useQuery<OrderedCounter<Date>>(monthlyPullRequestCountQuery);
    const { data: pullRequestsPerRepository, loading: loadingPerRepoData } = useQuery<OrderedCounter<string>>(pullRequestsPerRepoQuery);

    const preparedAuthors = useMemo<string[]>(() => {
        if (authors) {
            const prepData = authors.map(item => item.author);
            prepData.unshift('All');
            return prepData;
        }
        return ['All'];
    }, [authors]);

    const preparedOrganizations = useMemo<string[]>(() => {
        if (organizations) {
            const prepData = organizations.map(item => item.organization);
            prepData.unshift('All');
            return prepData;
        }
        return ['All'];
    }, [organizations]);

    const preparedRepositories = useMemo<string[]>(() => {
        if (repositories) {
            const prepData = repositories.map(item => item.repository);
            prepData.unshift('All');
            return prepData;
        }
        return ['All'];
    }, [repositories]);

    const preparedOwners = useMemo<string[]>(() => {
        if (owners) {
            const prepData = owners.map(item => item.owner);
            prepData.unshift('All');
            return prepData;
        }
        return ['All'];
    }, [owners]);

    const onChangeSelectBox = (value: string, filterSetter: (filter: QueryFilter | undefined) => void, column: string) => {
        if (value === 'All') {
            filterSetter(undefined);
        } else {
            filterSetter({
                column,
                operator: '=',
                target: `'${value}'`,
            });
        }
    };

    const calculateValue = (value: number) => {
        const options = [0, 10, 20, 50, 100, 250, 500, 1000, 2000, 5000, 10000];
        return options[value];
    };

    const valueLabelFormat = (value: number) => {
        return `${value} ⭐+`;
    };

    const onChangeStars = useCallback((_event: Event, newValue: number | number[]) => {
        setStarsFilter({
            ...starsFilter,
            target: calculateValue(newValue as number).toString()
        });
    }, [starsFilter]);
    const debounceFn = useCallback(() => debounce(onChangeStars, 600), [onChangeStars]);


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
            organizations &&
            repositories &&
            owners
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
        organizations,
        repositories,
        owners
    ]);

    return (
        <Grid container spacing={2}>
            {allDataLoaded && (
                <>
                    <Grid item xs={12} sm={12} md={2}>
                        <SelectBox
                            label="Author"
                            initialSelection="All"
                            items={preparedAuthors}
                            onChangeValue={(value) => onChangeSelectBox(value, setAuthorFilter, 'pr.author')}
                        />
                    </Grid>
                    <Grid item xs={12} sm={12} md={2}>
                        <SelectBox
                            label="Repository"
                            initialSelection="All"
                            items={preparedRepositories}
                            onChangeValue={(value) => onChangeSelectBox(value, setRepositoryFilter, 'pr.repository')}
                        />
                    </Grid>
                    <Grid item xs={12} sm={12} md={2}>
                        <SelectBox
                            label="Author organization"
                            initialSelection="All"
                            items={preparedOrganizations}
                            onChangeValue={(value) => onChangeSelectBox(value, setOrganizationFilter, 'pr.author_organization')}
                        />
                    </Grid>
                    <Grid item xs={12} sm={12} md={2}>
                        <SelectBox
                            label="Repository owner"
                            initialSelection="All"
                            items={preparedOwners}
                            onChangeValue={(value) => onChangeSelectBox(value, setOwnerFilter, 'pr.owner')}
                        />
                    </Grid>
                    <Grid item xs={12} sm={12} md={4}>
                        <Slider
                            label="Minimum Stars"
                            sliderProps={{
                                max: 10,
                                step: 1,
                                min: 0,
                                size: 'small',
                                valueLabelDisplay: 'auto',
                                onChange: debounceFn,
                                scale: calculateValue,
                                valueLabelFormat: valueLabelFormat,
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <PlaceholderCard title="Total PRs" loading={loadingPullRequests}>
                            <Typography variant="h4">{pullRequestCount?.[0].amount}</Typography>
                        </PlaceholderCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <PlaceholderCard title="Total Repositories" loading={loadingRepositories}>
                            <Typography variant="h4">{repositoryCount?.[0].amount}</Typography>
                        </PlaceholderCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <PlaceholderCard title="Total Contributors" loading={loadingContributors}>
                            <Typography variant="h4">{contributorCount?.[0].amount}</Typography>
                        </PlaceholderCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                        <PlaceholderCard title="Pull requests per week (past year)" loading={loadingWeeklyData}>
                            <ReactApexChart
                                options={{
                                    ...chartOptions,
                                    xaxis: {
                                        ...chartOptions.xaxis,
                                        categories: weeklyPullRequestCounts?.map(item => format(item.orderedField, 'dd-MM-yyyy (\'week\' II)')),
                                    }
                                }}
                                series={[
                                    {
                                        name: 'Pull requests',
                                        data: weeklyPullRequestCounts?.map(item => item.amount) ?? [],
                                        type: 'bar'
                                    }
                                ]}
                                type="bar"
                            />
                        </PlaceholderCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                        <PlaceholderCard title="Pull requests per month (past year)" loading={loadingMonthlyData}>
                            <ReactApexChart
                                options={{
                                    ...chartOptions,
                                    xaxis: {
                                        ...chartOptions.xaxis,
                                        categories: monthlyPullRequestCounts?.map(item => format(item.orderedField, 'MMMM yyyy')),
                                    }
                                }}
                                series={[{
                                    name: 'Pull requests',
                                    data: monthlyPullRequestCounts?.map(item => item.amount) ?? [],
                                    type: 'bar'
                                }]}
                                type="bar"
                            />
                        </PlaceholderCard>
                    </Grid>
                    <Grid item xs={12} sm={12} md={12}>
                        <PlaceholderCard title="Top 100 Contributed Repositories" loading={loadingPerRepoData}>
                            <ReactApexChart
                                options={{
                                    ...chartOptions,
                                    chart: {
                                        ...chartOptions.chart,
                                        type: 'treemap'
                                    }
                                }}
                                series={[{
                                    data: pullRequestsPerRepository?.map(item => ({
                                        x: item.orderedField,
                                        y: item.amount
                                    })) ?? [],
                                }]}
                                type="treemap"
                            />
                        </PlaceholderCard>
                    </Grid>
                </>
            )}
        </Grid>
    );

}

export default Home;
