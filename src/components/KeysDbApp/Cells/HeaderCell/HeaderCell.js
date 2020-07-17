import React from "react";
import { Table, Dropdown, Grid, } from "semantic-ui-react";
import { useDispatch, useSelector } from "react-redux";
import { addFilter, resetTableParams } from "../../../../actions";
import { parseOptions, usePrevious } from "../../../../utils";

function HeaderCell({ title }) {
    const dispatch = useDispatch()
    const filters = useSelector((state) => {
        const filter = state.filters.filter(filter => filter.key === title);

        return filter.length > 0
            ? filter[0]
            : { key: title, values: [] }
    })
    const headers = useSelector((state) => state.table.headers)

    const [options, setOptions] = React.useState(headers[title] ? initOptions(headers[title].options) : false);

    const prevFilters = usePrevious(filters);
    const prevHeaders = usePrevious(headers);

    React.useEffect(() => {
        if (prevFilters && (prevFilters.values.length !== filters.values.length)) {
            setOptions(initOptions(headers[title].options))
        }

        if (prevHeaders && prevHeaders !== headers) {
            if (headers[title] && headers[title].type) {
                if (headers[title].type === 'dropdown') {
                    setOptions(initOptions(headers[title].options))
                }
            }
        }

    }, [filters, headers])

    function initOptions(options) {
        if (!options) return

        return parseOptions(options)
    }

    function filter(e, { text }) {
        dispatch(resetTableParams(['offset']))
        dispatch(addFilter({
            key: title,
            values: filters.values.concat(text)
        }))
    }

    return (
        <Table.HeaderCell singleLine>
            <Grid>
                <Grid.Row>
                    <Grid.Column floated='left' width="8">
                        {(headers[title] && headers[title].label) || title}
                    </Grid.Column>
                    <Grid.Column floated='right' width="8" textAlign="right" verticalAlign="middle">
                        {
                            headers[title] && headers[title].isFilter && headers[title].options && (
                                <Dropdown icon='filter' compact>
                                    <Dropdown.Menu>
                                        <Dropdown.Menu scrolling>
                                            {
                                                options.map((option) => (
                                                    <Dropdown.Item
                                                        onClick={filter}
                                                        key={option.value}
                                                        {...option}
                                                    />
                                                ))
                                            }
                                        </Dropdown.Menu>
                                    </Dropdown.Menu>
                                </Dropdown>
                            )
                        }
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Table.HeaderCell>
    );
}

export default HeaderCell;
