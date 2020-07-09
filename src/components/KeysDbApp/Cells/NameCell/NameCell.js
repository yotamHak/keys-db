import React from "react";
import { Table } from "semantic-ui-react";
import NewModal from "../../Modals/NewModal/NewModal";
import { useSelector, useDispatch } from "react-redux";
import { reloadTable } from "../../../../actions";
import { parseSpreadsheetDate, getValueByLabel } from "../../../../utils";

function NameCell({ name, rowIndex }) {
    const headers = useSelector((state) => state.table.headers)
    const gameData = useSelector((state) => state.table.rows[rowIndex])

    const dispatch = useDispatch();

    return (
        <NewModal
            onComplete={() => dispatch(reloadTable(true))}
            isEdit={true}
            initialValue={Object.keys(headers).reduce((acc, header) => ({
                ...acc,
                [header]: headers[header].type === "date"
                    ? parseSpreadsheetDate(getValueByLabel(header, headers, gameData))
                    : getValueByLabel(header, headers, gameData)
            }), {})}
        >
            <Table.Cell className={'pointer'}>{name}</Table.Cell>
        </NewModal>
    );
}

export default NameCell;
