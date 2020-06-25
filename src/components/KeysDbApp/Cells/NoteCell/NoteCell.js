import React from "react";
import { Table } from "semantic-ui-react";

function NoteCell({ note }) {
    return (
        <Table.Cell>{note}</Table.Cell>
    );
}

export default NoteCell;
