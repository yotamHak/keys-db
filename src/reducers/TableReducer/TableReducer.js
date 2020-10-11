import * as actionTypes from '../../actions/types';

// Table Reducer
const initialTableState = {
    headers: {},
    rows: [],
    changes: {},
    reset: {
        limit: false,
        offset: false,
        filters: false,
        orderBy: false,
    },
    orderBy: { sort: 'ID', asc: false },
    reload: false,
    pageSize: 24,
    isEmpty: true,
    showShareModal: false,
}

export const table_reducer = (state = initialTableState, action) => {
    switch (action.type) {
        case actionTypes.SET_CURRENT_ROWS:
            return {
                ...state,
                rows: action.payload
            }
        case actionTypes.CHANGE_PAGE_SIZE:
            return {
                ...state,
                orderBy: action.payload
            }
        case actionTypes.CHANGE_ORDER_BY:
            return {
                ...state,
                orderBy: action.payload
            }
        case actionTypes.RELOAD_TABLE:
            return {
                ...state,
                reload: action.payload
            }
        case actionTypes.RESET_TABLE_PARAMS:
            return {
                ...state,
                reset: action.payload.reduce((result, paramToReset) => (
                    {
                        ...result,
                        [paramToReset]: !result[paramToReset]
                    }
                ), state.reset)
            }
        case actionTypes.ADD_HEADERS:
            return {
                ...state,
                headers: action.payload
            }
        case actionTypes.REMOVE_HEADERS:
            return {
                ...state,
                headers: {}
            }
        case actionTypes.SET_NEW_ROW_CHANGE:
            return {
                ...state,
                changes: {
                    ...state.changes,
                    [action.payload.id]: action.payload.row
                }
            }
        case actionTypes.SET_IS_TABLE_EMPTY:
            return {
                ...state,
                isEmpty: action.payload
            }
        case actionTypes.SHOW_SHARE_MODAL:
            return {
                ...state,
                showShareModal: action.payload
            }
        default:
            return state;
    }
}