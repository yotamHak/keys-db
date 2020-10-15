import React, { useEffect, useState, } from "react"
import { useSelector, } from "react-redux"
import { Container, Grid, Header, Dimmer, Loader, Statistic, Icon, Segment, } from "semantic-ui-react"
import _ from "lodash";
import moment from 'moment';

import Spreadsheets from "../../lib/google/Spreadsheets"
import useRecharts from "../../hooks/useRecharts";
import { getIndexById, isDropdownType, parseOptions } from "../../utils"

function StatisticsPage(props) {
    const [setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [spreadsheetData, setSpreadsheetData] = useState(null);

    const spreadsheetId = props.match.params.spreadsheetId;

    const google = useSelector((state) => state.authentication.google)

    useEffect(() => {
        (spreadsheetData === null && google.googleClientReady && spreadsheetId) && loadSpreadsheetData(spreadsheetId)
    }, [google.googleClientReady, spreadsheetData])

    function loadSpreadsheetData(spreadsheetId) {
        setIsLoading(true)

        Spreadsheets.GetSpreadsheet(spreadsheetId, true)
            .then(response => {
                if (!response.success) {
                    console.error("Failed to get data")
                    setHasError("Failed to get data")
                }

                console.log(response.data)
                handleSpreadsheetData(response.data)
            })
            .finally(() => {
                setIsLoading(false)
            })
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
                }, []);
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

    function handleSpreadsheetData(spreadsheetData) {
        try {
            const headers = JSON.parse(getMetadataValueByKey(spreadsheetData.developerMetadata, "headers"))
            const sheetId = getMetadataValueByKey(spreadsheetData.developerMetadata, "sheetId")
            const sheetData = getSheetData(spreadsheetData.sheets, parseInt(sheetId))

            const charts = Object.keys(headers).reduce((result, key) => {
                const data = parseData(headers, key, sheetData.rows)

                return data
                    ? [
                        ...result,
                        {
                            label: headers[key].label,
                            data: parseData(headers, key, sheetData.rows)
                        }
                    ]
                    : result
            }, [])

            const newSpreadsheetData = {
                url: `${spreadsheetData.spreadsheetUrl}#gid=${sheetId}`,
                ...sheetData,
                charts: charts.reduce((result, chart) => ({
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
            }

            console.log(newSpreadsheetData)

            setSpreadsheetData(newSpreadsheetData)
        } catch (error) {
            setHasError(error)
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
                                        Object.keys(spreadsheetData.charts).map((chartType => {
                                            switch (chartType) {
                                                case "pie":
                                                    return _.chunk(spreadsheetData.charts[chartType], 3)
                                                        .map((chartChunk, index) => (
                                                            <Grid.Row columns={chartChunk.length} key={index}>
                                                                {
                                                                    chartChunk.map((chart, index) => (
                                                                        <Grid.Column key={index}>
                                                                            <Header as='h2' textAlign='center'>{chart.label}</Header>
                                                                            <Container textAlign='center'>
                                                                                {
                                                                                    renderPieChart(chart.data)
                                                                                }
                                                                            </Container>
                                                                        </Grid.Column>
                                                                    ))
                                                                }
                                                            </Grid.Row>
                                                        ))
                                                case "line":
                                                    return _.chunk(spreadsheetData.charts[chartType], 1)
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