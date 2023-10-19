import { Grid, useTheme } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import useQueryFilter, { QueryFilter } from '../../hooks/useQueryFilter.ts';

import { ApexOptions } from 'apexcharts';
import DiscreteSlider from '../../components/Slider.tsx';
import { OrderedCounter } from '../../types/global.ts';
import PlaceholderCard from '../../components/PlaceHolderCard.tsx';
import ReactApexChart from 'react-apexcharts';
import SelectBox from '../../components/SelectBox.tsx';
import useQuery from '../../hooks/useQuery.ts';

function Trends() {
    const theme = useTheme();
    
    const [allDataLoaded, setAllDataLoaded] = useState(false);
    const [authorFilter, setAuthorFilter] = useState<QueryFilter>();
    const [starFilter, setStarFilter] = useState<QueryFilter>();
    const [dateFilter, setDateFilter] = useState<QueryFilter>();
    
    const filters = [
        authorFilter,
        starFilter,
        dateFilter
    ];
    const authorQuery = 'SELECT distinct author FROM main_consumers_xebia.consm_xebia_pull_requests';
    const hotRepositoriesQuery = `
        SELECT r.name AS orderedField,
            COUNT(DISTINCT title) AS amount
        FROM main_marts.fct_repositories r
        JOIN main_consumers_xebia.consm_xebia_pull_requests p ON r.name = p.repository
        ${useQueryFilter([...filters])}
        GROUP BY r.name
        ORDER BY amount DESC
        LIMIT 5;
    `;
    
    const { data: authors } = useQuery<{ author: string }>(authorQuery);
    const { data: hotRepositories, loading: loadingPerRepoData } = useQuery<OrderedCounter<string>>(hotRepositoriesQuery);

    const preparedAuthors = useMemo<string[]>(() => {
        if (authors) {
            const prepData = authors.map(item => item.author);
            prepData.unshift('All');
            return prepData;
        }
        return ['All'];
    }, [authors]);

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

    const onChangeStarSlider = (value: number) => {
        setStarFilter({
            column: 'stargazers_count',
            operator: '>=',
            target: `'${value}'`,
        });
    };
    
    const onChangeRecensySlider = (value: number) => {
        setDateFilter({
            column: 'CAST(p.created_at AS DATE)',
            operator: '>=',
            target: `date_add(CURRENT_DATE(), INTERVAL '-${ value } month')`
        });
    };

    const chartOptions: ApexOptions = {
        chart: {
            type: 'bar',
        },
        colors: [theme.palette.primary.main],
        plotOptions: {
            bar: {
                horizontal: true,
                borderRadius: 4,
                dataLabels: {
                    position: 'top',
                },
            }
        },
        dataLabels: {
            enabled: true,
            offsetX: 20,
            style: {
                fontSize: '10px',
                colors: [theme.palette.text.primary]
            }
        },
        xaxis: {
            position: 'bottom',
            axisTicks: {
                show: false
            },
            tooltip: {
                enabled: true,
            },
            labels: {
                show: true
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
            hotRepositories &&
            authors
        ) {
            setAllDataLoaded(true); // so the UI triggers only one rerender
        }
    }, [
        hotRepositories,
        authors,
    ]);

    return (
        <Grid container spacing={2}>
            {allDataLoaded && (
                <>  
                    <Grid item xs={12} sm={12} md={6}>
                        <Grid item xs={12} sm={12} md={12}>
                            <SelectBox
                                label="Author"
                                initialSelection="All"
                                items={preparedAuthors}
                                onChangeValue={(value) => onChangeSelectBox(value, setAuthorFilter, 'author')}
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} md={12}>
                            <DiscreteSlider
                                label="Stars"
                                title="Number of Stars"
                                defaultValue={5}
                                step={5}
                                min={0}
                                max={100}
                                onChangeValue={(value) => onChangeStarSlider(value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} md={12}>
                            <DiscreteSlider
                                label="Recensy"
                                title="Recensy in Months"
                                defaultValue={1}
                                step={1}
                                min={0}
                                max={12}
                                onChangeValue={(value) => onChangeRecensySlider(value)}
                            />
                        </Grid>
                    </Grid>
                    
                    <Grid item xs={12} sm={12} md={6}>
                        <PlaceholderCard title="Pull Requests per Project" loading={loadingPerRepoData}>
                            <ReactApexChart
                                options={{
                                    ...chartOptions,
                                    xaxis: {
                                        ...chartOptions.xaxis,
                                        categories: hotRepositories?.map(item => item.orderedField),
                                    }
                                }}
                                series={[{
                                    name: 'Pull requests',
                                    data: hotRepositories?.map(item => item.amount) ?? [],
                                    type: 'bar'
                                }]}
                                type="bar"
                            />
                        </PlaceholderCard>
                    </Grid>
                </>
            )}
        </Grid>
    );

}

export default Trends;
