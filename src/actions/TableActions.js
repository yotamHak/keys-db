import * as actionTypes from './types';

// Table Actions
export const setCurrentRows = rows => {
    return {
        type: actionTypes.SET_CURRENT_ROWS,
        payload: rows
    }
}
export const changePageSize = size => {
    return {
        type: actionTypes.CHANGE_PAGE_SIZE,
        payload: size
    }
}
export const changeOrderby = orderBy => {
    return {
        type: actionTypes.CHANGE_ORDER_BY,
        payload: orderBy
    }
}
export const resetTableParams = paramsToReset => {
    return {
        type: actionTypes.RESET_TABLE_PARAMS,
        payload: paramsToReset
    }
}
export const reloadTable = state => {
    return {
        type: actionTypes.RELOAD_TABLE,
        payload: state
    }
}
export const addHeaders = headers => {
    return {
        type: actionTypes.ADD_HEADERS,
        payload: headers
    }
}
export const removeHeaders = () => {
    return {
        type: actionTypes.REMOVE_HEADERS
    }
}

export const setNewRowChange = (id, row) => {
    return {
        type: actionTypes.SET_NEW_ROW_CHANGE,
        payload: {
            id: id,
            row: row
        }
    }
}

export const removeNewRowChange = (id) => {
    return {
        type: actionTypes.REMOVE_NEW_ROW_CHANGE,
        payload: id
    }
}

export const setIsTableEmpty = state => {
    return {
        type: actionTypes.SET_IS_TABLE_EMPTY,
        payload: state
    }
}
export const showShareModal = state => {
    return {
        type: actionTypes.SHOW_SHARE_MODAL,
        payload: state
    }
}