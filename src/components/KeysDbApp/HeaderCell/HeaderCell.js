import React from "react";
import { Table, Dropdown, Icon, } from "semantic-ui-react";

function HeaderCell({ filterCallback, header, values }) {
    const [options, setOptions] = React.useState(null);
    const [filters, setFilters] = React.useState({ key: header, values: [] });

    React.useEffect(() => {
        if (values && !options) {
            console.log("run")
            const options = values.reduce((result, option) => {
                return result.concat({
                    "key": option,
                    "text": option,
                    "value": option,
                    // "label": {},
                })
            }, [])

            setOptions(options)
        }
    }, [])

    function filter(e, { value }) {
        console.log(value)
        setFilters({
            key: header,
            values: filters.values.concat(value)
        })
        // setSelectedFilters(setSelectedFilters.concat[value])
        filterCallback({ "key": header, "values": [value] })
    }

    return (
        options
            ? (
                <Table.HeaderCell>
                    <Icon name="filter" />
                    <Dropdown text={header}>
                        <Dropdown.Menu>
                            <Dropdown.Menu scrolling>
                                {
                                    options
                                        .filter(option => !filters.values.includes(option.text))
                                        .map((option) => (
                                            <Dropdown.Item onClick={filter} key={option.value} {...option} />
                                        ))
                                }
                            </Dropdown.Menu>
                        </Dropdown.Menu>
                    </Dropdown>
                </Table.HeaderCell>
            )
            : <Table.HeaderCell>{header}</Table.HeaderCell>
    );
}

export default HeaderCell;
