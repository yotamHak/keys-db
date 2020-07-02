import React from "react";
import { Table, Dropdown } from "semantic-ui-react";
import { parseOptions } from "../../../../utils";

function FromCell({ from, header, onChange }) {
    const options = parseOptions(header.options);
    const [currentlySelected, setCurrentlySelected] = React.useState(options.filter(option => option.text === from)[0] || 0);

    function handleChange(e, { value }) {
        from = options.filter(option => option.value === value)[0].text;
        setCurrentlySelected(options.filter(option => option.value === value)[0]);
        onChange(header, from);
    }

    return (
        <Table.Cell>
            <Dropdown
                onChange={handleChange}
                options={options}
                selection
                search
                value={currentlySelected.value}
            ></Dropdown>
        </Table.Cell>
    );
}

export default FromCell;
