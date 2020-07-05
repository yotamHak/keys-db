import React, { forwardRef, useImperativeHandle } from "react";
import { Table, Dropdown, Grid, } from "semantic-ui-react";
import { usePrevious } from "../../../../utils";
import { Context } from "../../Main";
import _ from 'lodash';

const HeaderCell = forwardRef(({ title, filterCallback }, ref) => {
    const context = React.useContext(Context);

    const [filters, setFilters] = React.useState({ key: title, values: [] });
    const [options, setOptions] = React.useState(initOptions(context.headers[title].options));

    const prevFilters = usePrevious(filters);

    React.useEffect(() => {
        if (prevFilters && (prevFilters.values.length !== filters.values.length)) {
            setOptions(initOptions(context.headers[title].options))

            if (prevFilters.values.length < filters.values.length) {
                filterCallback(filters);
            }
        }
    }, [filters])

    // https://stackoverflow.com/questions/37949981/call-child-method-from-parent
    useImperativeHandle(ref, () => ({
        handleFilterRemoval(value) {
            console.log(value)

            setFilters({
                key: title,
                values: _.without(filters.values, value)
            })
        }
    }));

    function initOptions(options) {
        return _.without(options, ...filters.values).reduce((result, option) => {
            return result.concat({
                "key": option,
                "text": option,
                "value": option,
            })
        }, [])
    }

    function filter(e, { value }) {
        setFilters({
            key: title,
            values: filters.values.concat(value)
        })
    }

    return (
        <Table.HeaderCell singleLine>
            <Grid>
                <Grid.Row>
                    <Grid.Column floated='left' width="8">
                        {title}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    </Grid.Column>
                    <Grid.Column floated='right' width="8" textAlign="right" verticalAlign="middle">
                        {
                            options.length > 0 && (
                                <Dropdown icon='filter'>
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
})

export default HeaderCell;
