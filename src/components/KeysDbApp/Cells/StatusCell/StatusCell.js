import React from "react";
import { Table, Dropdown } from "semantic-ui-react";
import { parseOptions } from "../../../../utils";

function StatusCell({ status, header, onChange }) {
    const options = parseOptions(header.options);
    const [currentlySelected, setCurrentlySelected] = React.useState(options.filter(option => option.text === status)[0] || 0);

    function handleChange(e, selected) {
        status = options.filter(option => option.value === selected.value)[0].text;
        setCurrentlySelected(options.filter(option => option.value === selected.value)[0]);
    }

    return (
        <Table.Cell
            positive={currentlySelected.value === 2}
            negative={currentlySelected.value === 3}
            warning={currentlySelected.value !== 2 && currentlySelected.value !== 3}
        >
            <Dropdown
                onChange={handleChange}
                options={options}
                selection
                value={currentlySelected.value}
            ></Dropdown>
        </Table.Cell>
    );
}

export default StatusCell;
