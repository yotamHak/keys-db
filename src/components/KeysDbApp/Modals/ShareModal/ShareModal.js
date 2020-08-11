import React, { useState, } from "react";
import { Modal, Button, Confirm, Container, Message, Segment, Label, List, Grid, Icon, } from "semantic-ui-react";
import { useSelector, useDispatch } from "react-redux";

import { showShareModal } from "../../../../actions";
import Spreadsheets from "../../../../google/Spreadsheets";
import { getPrivateColumns } from "../../../../utils";
import DataFilters from "../../KeysTable/DataFilters/DataFilters";

function ShareModal({ triggerElement }) {
    const dispatch = useDispatch()
    const showModal = useSelector((state) => state.table.showShareModal)
    const spreadsheetId = useSelector((state) => state.authentication.currentSpreadsheetId)
    const steamProfile = useSelector((state) => state.authentication.steam.profile)
    const headers = useSelector((state) => state.table.headers)
    const filters = useSelector((state) => state.filters)

    const [isExportingSpreadsheet, setIsExportingSpreadsheet] = useState(false);
    const [exportedSheetUrl, setExportedSheetUrl] = useState(null);

    const handleCloseModal = () => dispatch(showShareModal(false))

    function exportSpreadsheet() {
        setIsExportingSpreadsheet(true)

        Spreadsheets.ExportSpreadsheet(spreadsheetId, getPrivateColumns(headers), filters, steamProfile.personaname, headers)
            .then(response => {
                if (response.success) {
                    console.log(response.data)
                    setExportedSheetUrl(response.data)
                } else { }
            })
            .finally(response => {
                setIsExportingSpreadsheet(false)
            })
    }

    const shareVideoTutorialModal = (
        <Modal
            basic
            size='large'
            trigger={<Icon
                title={'Show tutorial video'}
                color={'red'}
                link
                size={'large'}
                name='video play'
            />}
            closeIcon={true}
        >
            <Modal.Content>
                <Grid columns='equal'>
                    <Grid.Column textAlign='center'>
                        <video id="background-video" loop autoPlay width='90%'>
                            <source src={require('../../../../assets/vids/share-tutorial.mp4')} type="video/mp4" />
                            <source src={require('../../../../assets/vids/share-tutorial.mp4')} type="video/ogg" />
                                                    Your browser does not support the video tag.
                                        </video>
                    </Grid.Column>
                </Grid>
            </Modal.Content>
        </Modal>
    )

    const modalContent = (
        <Modal.Content>
            <Modal.Description>
                <Container>
                    <p>
                        <span>Exporting will create a new spreadsheet according to the filters you've applied to your spreadsheet,</span> <br />
                        <span>After exporting you will get a link to your new spreadsheet so you can share with whomever you want</span><br />
                    </p>
                    <Segment.Group stacked>
                        <Segment>
                            <Label attached='top'>Applied Filters</Label>
                            <DataFilters />
                        </Segment>
                        <Segment>
                            <Label attached='top'>Private Fields</Label>
                            <List horizontal>
                                {
                                    Object.keys(headers)
                                        .filter(headerKey => headers[headerKey].isPrivate === true)
                                        .map((headerKey, index) => (
                                            <List.Item key={index}>
                                                <List.Content>
                                                    <List.Header>{headers[headerKey].label}</List.Header>
                                                </List.Content>
                                            </List.Item>
                                        ))
                                }
                            </List>
                            <Message info>
                                <Message.Header>Info</Message.Header>
                                <Message.List>
                                    <Message.Item>You need to change the Spreadsheet's permission before sharing the link {shareVideoTutorialModal}</Message.Item>
                                    <Message.Item>Private Fields: You can set private columns in Settings and they will be removed from the new spreadsheet</Message.Item>
                                </Message.List>
                            </Message>
                        </Segment>
                    </Segment.Group>
                </Container>

                {
                    exportedSheetUrl && (
                        <Message attached positive>
                            <Message.Header>Exported</Message.Header>
                            {
                                <div>
                                    <div>
                                        Spreadsheet created: <a target='_blank' rel='noopener noreferrer' href={exportedSheetUrl.spreadsheetUrl}>Spreadsheet URL</a>
                                    </div>
                                    <div>
                                        Keys-DB Url: <a target='_blank' rel='noopener noreferrer' href={`https://keys-db.web.app/id/${exportedSheetUrl.spreadsheetId}`}>Keys-DB URL</a>
                                    </div>
                                </div>
                            }
                        </Message>
                    )
                }
            </Modal.Description>
        </Modal.Content>
    )

    return (
        <Confirm
            size={'small'}
            open={showModal}
            header={"Export"}
            content={modalContent}
            onCancel={handleCloseModal}
            onConfirm={exportSpreadsheet}
            confirmButton={<Button positive loading={isExportingSpreadsheet}>Export</Button>}
            trigger={triggerElement}
        />
    )
}

export default ShareModal;