import React from "react";
import { List, Label, Icon } from 'semantic-ui-react';
import { useSelector, useDispatch } from "react-redux";

import { removeFilter } from "../../../store/actions/FilterActions";

function DataFilters() {
    const dispatch = useDispatch()
    const filters = useSelector((state) => state.filters)

    return (
        <React.Fragment>
            {
                filters.length > 0
                    ? (
                        <div style={{ height: '100%', alignItems: 'center', display: 'flex' }}>
                            {/* Filters:&nbsp;&nbsp;&nbsp; */}
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
                                                    <List.Header style={{ textAlign: 'center' }}>{filter.key}</List.Header>
                                                    {
                                                        filter.values.map((filterValue, valueIndex) => (
                                                            <Label
                                                                className="pointer"
                                                                basic
                                                                onClick={() => { dispatch(removeFilter({ key: filter.key, value: filterValue, id: filter.id })) }}
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
                        </div>
                    )
                    : (
                        <div>
                            Unfiltered
                        </div>
                    )
            }
        </React.Fragment>
    );
}

export default DataFilters;