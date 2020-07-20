import React from "react";
import { Table } from "semantic-ui-react";
import { parseSpreadsheetDate } from "../../../../utils";

const DateCell = ({ dateAdded, rowIndex }) => (
    <Table.Cell>
        {parseSpreadsheetDate(dateAdded)}
    </Table.Cell>
)

export default DateCell;
