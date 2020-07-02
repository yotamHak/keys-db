import React from "react";
import { Table, Dropdown, Icon, Grid, } from "semantic-ui-react";
import { usePrevious } from "../../../../utils";

function HeaderCell({ header, headerOptions, filterCallback, orderByCallback }) {
    const [options, setOptions] = React.useState(null);
    const [filters, setFilters] = React.useState({ key: header, values: [] });

    const prevFilters = usePrevious(filters)
    const prevHeaderOptions = usePrevious(headerOptions)

    React.useEffect(() => {
        if ((!prevHeaderOptions && headerOptions) || (prevHeaderOptions !== headerOptions)) {
            setOptions(initOptions(headerOptions))
        }

        if (prevFilters && (prevFilters !== filters)) {
            filterCallback(filters)
        }
    }, [filters, headerOptions])

    function initOptions(options) {
        return options.reduce((result, option) => {
            return result.concat({
                "key": option,
                "text": option,
                "value": option,
                // "label": {},
            })
        }, [])
    }

    function filter(e, { value }) {
        setFilters({
            key: header,
            values: filters.values.concat(value)
        })
    }

    return (
        <Table.HeaderCell singleLine>
            <Grid>
                <Grid.Row>
                    <Grid.Column floated='left' width="8">
                        {header}
                    </Grid.Column>
                    <Grid.Column floated='right' width="8" textAlign="right" verticalAlign="middle">
                        {
                            options && (
                                <Dropdown icon='filter'>
                                    <Dropdown.Menu>
                                        <Dropdown.Menu scrolling>
                                            {
                                                options.map((option) => (
                                                    <Dropdown.Item onClick={filter} key={option.value} {...option} />
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
