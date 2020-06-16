import React from "react";
import { Table, Dropdown } from "semantic-ui-react";

function StatusCell({ status }) {
    const options = [
        { key: 1, text: 'Used', value: 1 },
        { key: 2, text: 'Unused', value: 2 },
        { key: 3, text: 'Traded', value: 3 },
        { key: 4, text: 'Given', value: 4 },
    ]

    const [currentlySelected, setCurrentlySelected] = React.useState(options.filter(option => { return status === option.text })[0]);

    function handleChange(e, selected) {
        status = options.filter(option => option.value === selected.value)[0].text;
        setCurrentlySelected(options.filter(option => option.value === selected.value)[0]);
    }

    return (
        <Table.Cell
            positive={currentlySelected.value === 2}
            negative={currentlySelected.value === 1}
            warning={currentlySelected.value !== 1 && currentlySelected.value !== 2}
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
