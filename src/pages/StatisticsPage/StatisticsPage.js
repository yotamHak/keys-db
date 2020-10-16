import React, { useEffect, useState, } from "react"
import { useDispatch, useSelector, } from "react-redux"
import { Container, Grid, Header, Dimmer, Loader, Statistic, Icon, Segment, } from "semantic-ui-react"
import _ from "lodash";
import moment from 'moment';

import Spreadsheets from "../../lib/google/Spreadsheets"
import useRecharts from "../../hooks/useRecharts";
import { getIndexById, isDropdownType, parseOptions } from "../../utils"
import { loadStatisticsCharts, loadStatisticsSpreadsheet } from "../../store/actions/StatisticsActions";
import useLocalStorage from "../../hooks/useLocalStorage";

function StatisticsPage(props) {
    const COLOR_PALLETES = [
        //https://learnui.design/tools/data-color-picker.html#divergent
        //https://color.adobe.com/explore
        [
            "#020540",
            "#3b2a62",
            "#6b5187",
            "#9c7cad",
            "#cdaad5",
            "#ffdbff",
            "#ffb7e8",
            "#ff90c3",
            "#ff6591",
            "#ff3855",
            "#f20505",
        ],
        [
            "#52188c",
            "#902888",
            "#bb4986",
            "#d9708a",
            "#ef9997",
            "#ffc2b0",
            "#ffbb93",
            "#f5b875",
            "#e2b957",
            "#c6bb3b",
            "#9ebf26",
        ],
        [
            "#8bc3d9",
            "#a4cae7",
            "#bdd1f1",
            "#d6d9f8",
            "#ece1fc",
            "#ffeaff",
            "#fcc6e8",
            "#fd9fc5",
            '#fa7798',
            "#ef4e62",
            "#d92525",
        ],
        [
            "#0ed2e9",
            "#26dbdb",
            "#50e2c8",
            "#77e8b4",
            "#9eeba0",
            "#c4ed8f",
            "#cbce60",
            "#d2ae37",
            "#d8891a",
            "#db6016",
            "#d92525",
        ],

    ]

    const [setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const dispatch = useDispatch()

    const spreadsheetId = props.match.params.spreadsheetId;

    const google = useSelector((state) => state.authentication.google)

    const spreadsheetData = useSelector((state) => state.statistics.spreadsheetData)
    const charts = useSelector((state) => state.statistics.charts)

    const [spreadsheetDataStorage, setSpreadsheetDataStorage] = useLocalStorage("statisticsSpreadsheet", null)
    const [chartsStorage, setChartsStorage] = useLocalStorage("statisticsCharts", null)

    useEffect(() => {
        if (spreadsheetDataStorage === null && google.googleClientReady && spreadsheetId) {
            loadSpreadsheetData(spreadsheetId);
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
    }, [google.googleClientReady, spreadsheetDataStorage, spreadsheetData, chartsStorage])

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

    function handleCharts(headers, rowsData) {
        // {
        //     index: 0,
        //     label: "Own"
        //     type: 'pie',
        //     data: []
        // }

        // const headersToParse = Object.keys(headers).reduce((result, headerKey) => { },[])

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
                    label: chart.label,
                    data: chart.data.data
                }
            ]
        }), {
            "pie": [],
            "line": []
        })

        setChartsStorage(JSON.stringify(parsedCharts))
    }

    function handleSpreadsheetData(spreadsheetData) {
        try {
            const headers = JSON.parse(getMetadataValueByKey(spreadsheetData.developerMetadata, "headers"))
            const sheetId = getMetadataValueByKey(spreadsheetData.developerMetadata, "sheetId")
            const sheetData = getSheetData(spreadsheetData.sheets, parseInt(sheetId))

            setSpreadsheetDataStorage(JSON.stringify({
                url: `${spreadsheetData.spreadsheetUrl}#gid=${sheetId}`,
                headers: headers,
                ...sheetData,
            }))
        } catch (error) {
            setHasError(error)
        }
    }

    function getMetadataValueByKey(spreadsheetMetadata, key) {
        return spreadsheetMetadata.find(metadata => metadata.metadataKey === key).metadataValue
    }

    function parseRows(rows) {
        return _.drop(rows.rowData, 2).reduce((result, row) => [
            ...result,
            row.values.map(value => value.formattedValue)
        ], [])
    }

    function parseData(headers, headerKey, rowsData) {
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

            return _.zip(Object.keys(results), Object.values(results))
                .reduce((result, item) => {
                    return [
                        ...result,
                        {
                            "name": item[0],
                            "value": item[1] ? item[1] : 0
                        }
                    ];
                }, []);
        }
    }

    function getSheetData(sheets, sheetId) {
        const sheet = sheets.find(sheet => sheet.properties.sheetId === sheetId)

        return {
            properties: sheet.properties,
            rows: parseRows(sheet.data[0]),
        }
    }

    const { renderPieChart, renderLineChart } = useRecharts()

    return (
        <>
            {
                !google.googleClientReady || !spreadsheetId || isLoading
                    ? (
                        <Dimmer inverted active>
                            <Loader indeterminate />
                        </Dimmer>
                    )
                    : spreadsheetData && (
                        <Segment.Group>
                            <Segment vertical textAlign='center'>
                                <Header as='h2'>{`${spreadsheetData.properties.title} Statistics`}</Header>
                            </Segment>
                            <Segment vertical>
                                <Container textAlign='center'>
                                    <Statistic.Group widths='2'>
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
                                        <Statistic>
                                            <Statistic.Value>{
                                                spreadsheetData.properties.gridProperties.rowCount - 2 > 0
                                                    ? spreadsheetData.properties.gridProperties.rowCount - 2
                                                    : 0
                                            }</Statistic.Value>
                                            <Statistic.Label>Total Keys</Statistic.Label>
                                        </Statistic>
                                    </Statistic.Group>
                                </Container>
                            </Segment>

                            <Segment vertical>
                                <Grid>
                                    {
                                        charts && Object.keys(charts).map((chartType => {
                                            switch (chartType) {
                                                case "pie":
                                                    return _.chunk(charts[chartType], 3)
                                                        .map((chartChunk, index) => (
                                                            <Grid.Row columns={chartChunk.length} key={index}>
                                                                {
                                                                    chartChunk.map((chart, index) => (
                                                                        <Grid.Column key={index}>
                                                                            <Header as='h2' textAlign='center'>{chart.label}</Header>
                                                                            <Container textAlign='center'>
                                                                                {
                                                                                    renderPieChart(chart.data, false, COLOR_PALLETES[index % COLOR_PALLETES.length])
                                                                                }
                                                                            </Container>
                                                                        </Grid.Column>
                                                                    ))
                                                                }
                                                            </Grid.Row>
                                                        ))
                                                case "line":
                                                    return _.chunk(charts[chartType], 1)
                                                        .map((chartChunk, index) => (
                                                            <Grid.Row columns={chartChunk.length} key={index}>
                                                                {
                                                                    chartChunk.map((chart, index) => (
                                                                        <Grid.Column key={index}>
                                                                            <Header as='h2' textAlign='center'>{chart.label}</Header>
                                                                            {
                                                                                renderLineChart(chart.data, "Keys Added")
                                                                            }
                                                                        </Grid.Column>
                                                                    ))
                                                                }
                                                            </Grid.Row>
                                                        ))

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