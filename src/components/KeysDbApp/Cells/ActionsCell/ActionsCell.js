import React from "react";
import { Table, Dropdown } from "semantic-ui-react";

function ActionsCell() {
    return (
        <Table.Cell singleLine>
            <Dropdown
                icon='ellipsis vertical'
                compact
            >
                <Dropdown.Menu>
                    <Dropdown.Item>
                        Refresh
                    </Dropdown.Item>
                    <Dropdown.Item>
                        Save
                    </Dropdown.Item>
                    <Dropdown.Item>
                        Edit
                    </Dropdown.Item>

                </Dropdown.Menu>
            </Dropdown>

            {/* <Button.Group basic size='mini'
                buttons={[
                    { key: 'refresh', icon: 'refresh', onClick: refresh, loading: isRefreshing, size: 'tiny' },
                    { key: 'save', icon: 'save', onClick: save, loading: isSaving, size: 'tiny' },
                    { key: 'edit', icon: 'pencil', onClick: edit, size: 'tiny' },
                ]}
            /> */}
        </Table.Cell>
    )
}

export default ActionsCell;
