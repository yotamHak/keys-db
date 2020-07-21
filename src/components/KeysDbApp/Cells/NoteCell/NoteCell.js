import React from "react";
import { Table, Popup, Icon } from "semantic-ui-react";

function NoteCell({ note, rowIndex }) {
    return (
        <Table.Cell textAlign='center'>
            {
                note && (
                    <Popup
                        trigger={<Icon name='sticky note outline' size='large' />}
                        content={note}
                        position='bottom center'
                    />
                )
            }
        </Table.Cell>
    );
}

export default NoteCell;
