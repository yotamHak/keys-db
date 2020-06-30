import React from "react";
import { Table } from "semantic-ui-react";
import { getFormattedDate } from "../../../../utils";

function DateCell({ dateAdded }) {
    const capturedValue = RegExp("([0-9]{1,},[0-9]{1,},[0-9]{1,})").exec(dateAdded);
    const date = capturedValue ? getFormattedDate(capturedValue[0]) : ''

    return (
        <Table.Cell>{date}</Table.Cell>
    );
}

export default DateCell;
