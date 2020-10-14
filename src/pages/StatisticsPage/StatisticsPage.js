import React, { useEffect, useState, } from "react"
import { useSelector, } from "react-redux"
import { Container, Grid, Header, Dimmer, Loader, Statistic, Icon, Segment, } from "semantic-ui-react"
import _ from "lodash";

import Spreadsheets from "../../lib/google/Spreadsheets"

function StatisticsPage(props) {
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [spreadsheetData, setSpreadsheetData] = useState(null);

    const spreadsheetId = props.match.params.spreadsheetId;

    const google = useSelector((state) => state.authentication.google)

    useEffect(() => {
        (spreadsheetData === null && google.googleClientReady && spreadsheetId) && loadSpreadsheetData(spreadsheetId)
    }, [google.googleClientReady])

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

    function getSheetData(sheets, sheetId) {
        const sheet = sheets.find(sheet => sheet.properties.sheetId === sheetId)

        return {
            properties: sheet.properties,
            rows: parseRows(sheet.data[0]),
        }
    }

    function handleSpreadsheetData(spreadsheetData) {
        try {
            const sheetId = getMetadataValueByKey(spreadsheetData.developerMetadata, "sheetId")
            const sheetData = getSheetData(spreadsheetData.sheets, parseInt(sheetId))
            console.log(sheetData)
            setSpreadsheetData({
                url: `${spreadsheetData.spreadsheetUrl}#gid=${sheetId}`,
                ...sheetData
            })
        } catch (error) {
            setHasError(error)
        }
    }

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
                                            <Statistic.Value>{spreadsheetData.properties.gridProperties.rowCount - 2}</Statistic.Value>
                                            <Statistic.Label>Total Keys</Statistic.Label>
                                        </Statistic>
                                    </Statistic.Group>
                                </Container>
                            </Segment>

                            <Segment vertical>
                                <Grid>
                                    <Grid.Row>
                                        <Grid.Column>
                                        </Grid.Column>
                                    </Grid.Row>
                                    <Grid.Row>
                                        <Grid.Column>
                                        </Grid.Column>
                                    </Grid.Row>
                                </Grid>
                            </Segment>
                        </Segment.Group>
                        // <Container textAlign='center'>

                        //     <Grid>
                        //         <Grid.Row>
                        //             <Grid.Column>
                        //                 {
                        //                     <Header as='h2'>{`${spreadsheetData.properties.title} Statistics`}</Header>
                        //                 }
                        //             </Grid.Column>
                        //         </Grid.Row>
                        //         <Grid.Row>
                        //             <Grid.Column>
                        //                 <Statistic.Group widths='2'>
                        //                     <a
                        //                         title={spreadsheetData.url}
                        //                         as='a'
                        //                         target='_blank'
                        //                         rel='noopener noreferrer'
                        //                         href={spreadsheetData.url}
                        //                     >
                        //                         <Statistic>
                        //                             <Statistic.Value>
                        //                                 <Icon name='google drive' />
                        //                             </Statistic.Value>
                        //                             <Statistic.Label>Url</Statistic.Label>
                        //                         </Statistic>
                        //                     </a>

                        //                     <Statistic>
                        //                         <Statistic.Value>{spreadsheetData.properties.gridProperties.rowCount - 2}</Statistic.Value>
                        //                         <Statistic.Label>Total Keys</Statistic.Label>
                        //                     </Statistic>
                        //                 </Statistic.Group>
                        //             </Grid.Column>
                        //         </Grid.Row>
                        //     </Grid>
                        // </Container>
                    )
            }
        </>
    )
}

export default StatisticsPage;