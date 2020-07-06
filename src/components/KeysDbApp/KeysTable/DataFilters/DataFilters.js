import React from "react";
import { List, Label, Icon } from 'semantic-ui-react';

import { useSelector, useDispatch } from "react-redux";
import { removeFilter } from "../../../../actions";

function DataFilters() {
    const dispatch = useDispatch()
    const filters = useSelector((state) => state.filters)

    return (
        <List
            verticalAlign="middle"
            size="small"
            divided
            horizontal
        >
            {
                filters.map((filter, filterIndex) => {
                    return (
                        <List.Item key={filterIndex}>
                            <List.Content>
                                <List.Header>{filter.key}</List.Header>
                                {
                                    filter.values.map((filterValue, valueIndex) => (
                                        <Label
                                            className="pointer"
                                            basic
                                            onClick={() => { dispatch(removeFilter({ key: filter.key, value: filterValue })) }}
                                            key={valueIndex}>
                                            {filterValue}
                                            <Icon name='delete' />
                                        </Label>
                                    ))
                                }
                            </List.Content>
                        </List.Item>
                    )
                })
            }
        </List>
    );
}

export default DataFilters;