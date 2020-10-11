import * as actionTypes from '../../actions/types';
import _ from 'lodash';

// Filter Reducer
const initialFiltersState = []

export const filters_reducer = (state = initialFiltersState, action) => {
    switch (action.type) {
        case actionTypes.ADD_FILTER:
            const oldFilters = state.filter(filter => { return filter.key !== action.payload.key });

            return oldFilters.length > 0
                ? _.concat(oldFilters, action.payload)
                : [action.payload];
        case actionTypes.REMOVE_FILTER:
            return state.reduce((result, filter) => {
                return filter.key === action.payload.key
                    ? filter.values.length === 1
                        ? result
                        : result.concat([{
                            key: action.payload.key,
                            values: filter.values.filter(filterValue => { return filterValue !== action.payload.value }),
                            id: action.payload.id,
                        }])
                    : result.concat(filter)
            }, [])
        default:
            return state;
    }
}