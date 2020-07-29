import React, { useState, } from "react";
import { Modal, Button, Confirm, Container, Message, } from "semantic-ui-react";
import { useSelector, useDispatch } from "react-redux";

import { showShareModal } from "../../../../actions";
import Spreadsheets from "../../../../google/Spreadsheets";
import { getPrivateColumns } from "../../../../utils";

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

    return (
        <Confirm
            size={'large'}
            open={showModal}
            header={"Export"}
            content={
                <Modal.Content>
                    <Modal.Description>
                        <Container>
                            <div>Exporting will create a new spreadsheet without Private Columns*,</div>
                            <div>After exporting you will get a link to your new spreadsheet so you can share with whomever you want</div>
                        </Container>
                        <Message info>
                            <Message.Header>Info</Message.Header>
                            <Message.List>
                                <Message.Item>Private Columns: You can set private columns in Settings (Keys are private by default)</Message.Item>
                            </Message.List>
                        </Message>
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
            }
            onCancel={handleCloseModal}
            onConfirm={exportSpreadsheet}
            confirmButton={<Button positive loading={isExportingSpreadsheet}>Export</Button>}
            trigger={triggerElement}
        />
    )
}

export default ShareModal;