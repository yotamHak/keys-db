import React from "react";
import { Header, Dropdown, } from "semantic-ui-react";
import { useSelector, useDispatch } from "react-redux";
import { addFilter, resetTableParams } from "../../../actions";

function FilterDropdown() {
    const headers = useSelector((state) => state.table.headers)
    const filters = useSelector((state) => state.filters)

    const dispatch = useDispatch()

    function filter(header, text) {
        const filter = filters.filter(filter => filter.key === header);
        const newFilter = filter.length > 0
            ? filter[0]
            : { key: header, values: [] }

        dispatch(resetTableParams(['offset']))
        dispatch(addFilter({
            key: header,
            values: newFilter.values.concat(text),
            id: headers[header].id
        }))
    }

    return (
        <Header as='h5'>
            <Header.Content>
                <Dropdown text={`Filter`}>
                    <Dropdown.Menu>
                        {
                            Object.keys(headers)
                                .filter(header => header !== "ID" && headers[header].isFilter)
                                .map((key, index) => (
                                    <Dropdown.Item className={"cursor-auto"} key={index}>
                                        <Dropdown text={headers[key].label} style={{ width: '100%' }}>
                                            <Dropdown.Menu>
                                                {
                                                    headers[key].options && headers[key].options.values && headers[key].options.values
                                                        .filter(value => {
                                                            const filter = filters.filter(filter => filter.key === key);
                                                            return filter.length === 0 || filter[0].values.indexOf(value.value) === -1
                                                        })
                                                        .map((value, index) => <Dropdown.Item onClick={() => filter(key, value.value)} key={index}>{value.value}</Dropdown.Item>)
                                                }
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </Dropdown.Item>
                                ))
                        }
                    </Dropdown.Menu>
                </Dropdown>
            </Header.Content>
        </Header>
    );
}

export default FilterDropdown;
