import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table, Dropdown } from "semantic-ui-react";
import _ from 'lodash';

import { parseOptions, hasWritePermission, getIndexById } from "../../../../utils";
import { setNewRowChange } from "../../../../actions/TableActions";

function OptionsCell({ rowIndex, title, header, onChange }) {
    const headers = useSelector((state) => state.table.headers)
    const gameData = useSelector((state) => state.table.rows[rowIndex])

    const dispatch = useDispatch();

    const options = parseOptions(header.options);
    const permission = useSelector((state) => state.authentication.permission)
    const [currentlySelected, setCurrentlySelected] = React.useState(options.filter(option => option.text === title)[0] || 0);

    function handleChange(e, { value }) {
        const selectedValue = options.filter(option => option.value === value)
        const isNew = selectedValue.length > 0 ? true : false

        if (!isNew) {
            // New value to add
            console.log("New value to add")
        } else {
            const changedValue = selectedValue[0].text;
            setCurrentlySelected(selectedValue[0]);
            // onChange(header, changedValue);
            debugger
            dispatch(setNewRowChange(rowIndex, {
                ...gameData,
                [getIndexById(header.id, headers)]: changedValue
            }))
        }
    }

    return (
        <Table.Cell style={{ color: `${currentlySelected.color}` }} className="__dropdown">
            <Dropdown
                search
                disabled={!hasWritePermission(permission)}
                onChange={handleChange}
                value={currentlySelected.value}
                options={options.reduce((result, option) => (
                    _.concat(
                        result,
                        option.color
                            ? [{
                                ...option,
                                label: { color: option.color, empty: true, circular: true }
                            }]
                            : [{
                                ...option
                            }]
                    )
                ), [])}
            />
        </Table.Cell>
    );
}

export default OptionsCell;
