import React, { useEffect, useState, } from "react"
import { useDispatch, useSelector, } from "react-redux"
import { Container, Grid, Header, Dimmer, Loader, Statistic, Icon, Segment, Divider, } from "semantic-ui-react"
import _ from "lodash";
import moment from 'moment';

import Spreadsheets from "../../lib/google/Spreadsheets"
import useRecharts from "../../hooks/useRecharts";
import { getIndexById, isDropdownType, parseOptions } from "../../utils"
import { loadStatisticsCharts, loadStatisticsSpreadsheet, resetStatisticsStorage } from "../../store/actions/StatisticsActions";
import useLocalStorage from "../../hooks/useLocalStorage";
import { COLOR_PALLETES, LINE_CHART_CHUNK, PIE_CHART_CHUNK_LARGER_DESKTOP, PIE_CHART_CHUNK_DESKTOP, PIE_CHART_CHUNK_MOBILE } from "../../constants/statisticsConstants";
import useWindowDimensions from "../../hooks/useWindowDimensions";

function StatisticsPage(props) {
    const [setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const dispatch = useDispatch();

    const { width: viewPortwidth } = useWindowDimensions();

    const [pieWidth, setPieWidth] = useState((viewPortwidth / PIE_CHART_CHUNK_MOBILE) - 28);

    const spreadsheetId = props.match.params.spreadsheetId;

    const googleClientReady = useSelector((state) => state.authentication.google.googleClientReady);
    const spreadsheetData = useSelector((state) => state.statistics.spreadsheetData);
    const charts = useSelector((state) => state.statistics.charts);

    const [spreadsheetDataStorage, setSpreadsheetDataStorage] = useLocalStorage("statisticsSpreadsheet", null);
    const [chartsStorage, setChartsStorage] = useLocalStorage("statisticsCharts", null);

    useEffect(() => {
        if (!googleClientReady) return

        setPieWidth(
            viewPortwidth < 767
                ? (viewPortwidth) - 28
                : viewPortwidth > 1900
                    ? (viewPortwidth / PIE_CHART_CHUNK_LARGER_DESKTOP) - 28
                    : (viewPortwidth / PIE_CHART_CHUNK_DESKTOP) - 28
        )

        if (spreadsheetDataStorage && spreadsheetId && JSON.parse(spreadsheetDataStorage).id !== spreadsheetId) {
            setSpreadsheetDataStorage(null)
            dispatch(resetStatisticsStorage())
            return
        }

        if (spreadsheetId && spreadsheetDataStorage === null) {
            loadSpreadsheetData(spreadsheetId)
        }

        if (spreadsheetDataStorage && spreadsheetData === null) {
            dispatch(loadStatisticsSpreadsheet(JSON.parse(spreadsheetDataStorage)))
        }

        if (spreadsheetData && chartsStorage === null) {
            handleCharts(spreadsheetData.headers, spreadsheetData.rows)
        }

        if (chartsStorage && charts === null) {
            dispatch(loadStatisticsCharts(JSON.parse(chartsStorage)))
        }
    }, [googleClientReady, spreadsheetId, spreadsheetDataStorage, spreadsheetData, chartsStorage, viewPortwidth])

    function loadSpreadsheetData(spreadsheetId) {
        setIsLoading(true)

        Spreadsheets.GetSpreadsheet(spreadsheetId, true)
            .then(response => {
                if (!response.success) {
                    console.error("Failed to get data")
                    setHasError("Failed to get data")
                }

                handleSpreadsheetData(response.data)
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    function handleSpreadsheetData(spreadsheetData) {
        function getMetadataValueByKey(spreadsheetMetadata, key) {
            return spreadsheetMetadata.find(metadata => metadata.metadataKey === key).metadataValue
        }

        try {
            const headers = JSON.parse(getMetadataValueByKey(spreadsheetData.developerMetadata, "headers"))
            const sheetId = getMetadataValueByKey(spreadsheetData.developerMetadata, "sheetId")
            const sheetData = getSheetData(spreadsheetData.sheets, parseInt(sheetId))

            setSpreadsheetDataStorage(JSON.stringify({
                id: spreadsheetData.spreadsheetId,
                url: `${spreadsheetData.spreadsheetUrl}#gid=${sheetId}`,
                headers: headers,
                ...sheetData,
            }))
        } catch (error) {
            setHasError(error)
        }
    }

    function handleCharts(headers, rowsData) {
        // {
        //     index: 0,
        //     label: "Own"
        //     type: 'pie',
        //     data: []
        // }

        // const headersToParse = Object.keys(headers).reduce((result, headerKey) => { },[])

        function parseData(headers, headerKey, rowsData) {
            function parseDateType(dataKey) {
                const results = rowsData.reduce((result, row) => {
                    const date = row[getIndexById(headers[headerKey].id)];

                    if (moment(date).isValid()) {
                        const formattedDate = moment(date).format("YYYY-MM");
                        return {
                            ...result,
                            [formattedDate]: result[formattedDate] ? result[formattedDate] + 1 : 1
                        };
                    } else {
                        return result;
                    }
                }, {});

                return _.zip(Object.keys(results), Object.values(results))
                    .reduce((result, item) => {
                        return [
                            ...result,
                            {
                                "name": item[0],
                                [dataKey]: item[1] ? item[1] : 0
                            }
                        ];
                    }, [])
                    .sort((a, b) => moment(a.name, "YYYY-MM").isBefore(moment(b.name, "YYYY-MM")) ? -1 : 1);
            }

            function parseDropdownType() {
                const options = parseOptions(headers[headerKey].options);

                const startingOptions = options.reduce((result, option) => ({
                    ...result,
                    [option.text]: 0
                }), {});

                const results = rowsData.reduce((result, row) => {
                    const option = row[getIndexById(headers[headerKey].id)];

                    return option
                        ? {
                            ...result,
                            [option]: result[option] + 1
                        }
                        : result; // data unfilled
                }, startingOptions);

                return Object.keys(results)
                    .sort((a, b) => results[a] > results[b] ? -1 : 1)
                    .filter(key => results[key])
                    .reduce((result, key, index) => {
                        return index > 12
                            ? [
                                ...result.slice(0, 11),
                                {
                                    name: "Other...",
                                    value: result[11].value + results[key]
                                }
                            ]
                            : [
                                ...result,
                                {
                                    name: key,
                                    value: results[key]
                                }
                            ]
                    }, [])
            }

            if (isDropdownType(headers[headerKey].type)) {
                return {
                    chart: "pie",
                    data: parseDropdownType()
                }
            } else if (headers[headerKey].type === "created_on") {
                return {
                    chart: "line",
                    data: parseDateType("Keys Added")
                }
            } else {
                return null
            }
        }

        const charts = Object.keys(headers).reduce((result, key) => {
            const data = parseData(headers, key, rowsData)

            return data
                ? [
                    ...result,
                    {
                        label: headers[key].label,
                        data: data
                    }
                ]
                : result
        }, [])

        const parsedCharts = charts.reduce((result, chart) => ({
            ...result,
            [chart.data.chart]: [
                ...result[chart.data.chart],
                {
                    index: result[chart.data.chart].length,
                    label: chart.label,
                    data: chart.data.data
                }
            ]
        }), {
            "line": [],
            "pie": [],
        })

        setChartsStorage(JSON.stringify(parsedCharts))
    }

    function getSheetData(sheets, sheetId) {
        function parseRows(rows) {
            return _.drop(rows.rowData, 2).reduce((result, row) => [
                ...result,
                row.values.map(value => value.formattedValue)
            ], [])
        }

        const sheet = sheets.find(sheet => sheet.properties.sheetId === sheetId)

        return {
            properties: sheet.properties,
            rows: parseRows(sheet.data[0]),
        }
    }

    function renderCharts(charts, chartType, chunks, options, renderFunction) {
        return _.chunk(charts[chartType], chunks).map((chartChunk, chunkIndex) => (
            <Grid.Row columns={chartChunk.length} key={chunkIndex}>
                {chartChunk.map((chart) => (
                    <Grid.Column key={chart.index}>
                        <Header as='h3' textAlign='center'>{chart.label}</Header>
                        <Container textAlign='center' fluid>
                            {
                                renderFunction({
                                    ...options,
                                    data: chart.data,
                                    colors: COLOR_PALLETES[chart.index % COLOR_PALLETES.length],
                                })
                            }
                        </Container>
                    </Grid.Column>
                ))}
            </Grid.Row>
        ));
    }

    const { renderPieChart, renderLineChart } = useRecharts()

    return (
        <>
            {
                !googleClientReady || !spreadsheetId || isLoading
                    ? (
                        <Dimmer inverted active>
                            <Loader indeterminate />
                        </Dimmer>
                    )
                    : spreadsheetData && (
                        <Segment.Group>
                            <Segment basic vertical textAlign='center'>
                                <Header as='h1'>{`${spreadsheetData.properties.title} Statistics`}</Header>
                            </Segment>

                            <Segment basic vertical>
                                <Container textAlign='center'>
                                    <Statistic.Group widths='2'>
                                        <Statistic>
                                            <Statistic.Value>{
                                                spreadsheetData.properties.gridProperties.rowCount - 2 > 0
                                                    ? spreadsheetData.properties.gridProperties.rowCount - 2
                                                    : 0
                                            }</Statistic.Value>
                                            <Statistic.Label>Total Keys</Statistic.Label>
                                        </Statistic>
                                        <Statistic>
                                            <Statistic.Value>
                                                <a
                                                    title={spreadsheetData.url}
                                                    as='a'
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                    href={spreadsheetData.url}
                                                >
                                                    <Icon name='google drive' />
                                                </a>
                                            </Statistic.Value>
                                            <Statistic.Label>Url</Statistic.Label>
                                        </Statistic>
                                    </Statistic.Group>
                                </Container>
                            </Segment>

                            <Divider />

                            <Segment basic vertical>
                                <Grid>
                                    {
                                        charts && Object.keys(charts).map((chartType => {
                                            switch (chartType) {
                                                case "pie":
                                                    return renderCharts(charts,
                                                        chartType,
                                                        viewPortwidth < 750 ? PIE_CHART_CHUNK_MOBILE : viewPortwidth > 1900 ? PIE_CHART_CHUNK_LARGER_DESKTOP : PIE_CHART_CHUNK_DESKTOP,
                                                        {
                                                            isDonut: 0,
                                                            width: pieWidth
                                                        },
                                                        renderPieChart);
                                                case "line":
                                                    return renderCharts(charts,
                                                        chartType,
                                                        LINE_CHART_CHUNK,
                                                        {
                                                            dataKey: "Keys Added",
                                                            width: viewPortwidth
                                                        },
                                                        renderLineChart);
                                                default:
                                                    return <></>
                                            }
                                        }))
                                    }
                                </Grid>
                            </Segment>
                        </Segment.Group>
                    )
            }
        </>
    )
}

export default StatisticsPage;