import React, { useState } from "react";
import { Table, Dropdown, Header, Modal, Button, Icon } from "semantic-ui-react";

function ActionsCell({ index, gameData }) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    function handleEditModalClose() {
        console.log("handleEditModalClose")
        console.log(gameData)
        setIsEditModalOpen(false)
    }

    return (
        <Table.Cell singleLine>
            <Dropdown
                icon='ellipsis vertical'
                compact
            >
                <Dropdown.Menu>
                    <Dropdown.Item>
                        Info
                    </Dropdown.Item>
                    <Dropdown.Item>
                        Refresh
                    </Dropdown.Item>
                    <Dropdown.Item>
                        Save
                    </Dropdown.Item>

                    <Modal
                        trigger={<Dropdown.Item onClick={() => { setIsEditModalOpen(true) }}>Edit</Dropdown.Item>}
                        open={isEditModalOpen}
                        onClose={handleEditModalClose}
                        basic
                        size='small'
                    >
                        <Header icon='browser' content='Cookies policy' />
                        <Modal.Content>
                            <h3>This website uses cookies to ensure the best user experience.</h3>
                        </Modal.Content>
                        <Modal.Actions>
                            <Button color='green' onClick={handleEditModalClose} inverted>
                                <Icon name='checkmark' /> Got it
                            </Button>
                        </Modal.Actions>
                    </Modal>



                </Dropdown.Menu>
            </Dropdown>
        </Table.Cell>
    )
}

export default ActionsCell;
