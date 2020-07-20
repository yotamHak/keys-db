import React from "react";
import { Table } from "semantic-ui-react";

function NoteCell({ note, rowIndex }) {
    return (
        <Table.Cell>{note}</Table.Cell>
    );
}

export default NoteCell;
