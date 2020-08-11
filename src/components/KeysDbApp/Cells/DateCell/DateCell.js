import React from "react";
import { Table, } from "semantic-ui-react";
import { parseSpreadsheetDate } from "../../../../utils";


function DateCell({ dateAdded, rowIndex }) {
    // function handleChange() {

    // }

    return (
        <Table.Cell>
            {parseSpreadsheetDate(dateAdded, true)}
        </Table.Cell>
    )

    // return (
    //     <Table.Cell>
    //         <Input
    //             name={'date'}
    //             onChange={handleChange}
    //             value={parseSpreadsheetDate(dateAdded, true)}
    //             type='date'
    //         />
    //     </Table.Cell>
    // )
}


export default DateCell;
