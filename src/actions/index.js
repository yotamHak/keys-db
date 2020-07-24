import * as actionTypes from './types';

// Authentication Action
export const steamSetApiKey = apiKey => {
    return {
        type: actionTypes.STEAM_SET_API_KEY,
        payload: apiKey
    }
}
export const steamSetId = key => {
    return {
        type: actionTypes.STEAM_SET_ID,
        payload: key
    }
}
export const steamSetProfile = profile => {
    return {
        type: actionTypes.STEAM_SET_PROFILE,
        payload: profile
    }
}
export const steamLoggedIn = () => {
    return {
        type: actionTypes.STEAM_LOGGED_IN
    }
}
export const steamLoad = steam => {
    return {
        type: actionTypes.STEAM_LOAD,
        payload: steam
    }
}

export const setupComplete = () => {
    return {
        type: actionTypes.SET_UP_COMPLETE
    }
}
export const spreadsheetSetId = id => {
    return {
        type: actionTypes.SPREADSHEET_SET_ID,
        payload: id
    }
}
export const spreadsheetSetPermission = permission => {
    return {
        type: actionTypes.SET_SPREADSHEET_PERMISSION,
        payload: permission
    }
}

export const googleLoggedIn = profile => {
    return {
        type: actionTypes.GOOGLE_LOGGED_IN,
        payload: profile
    }
}
export const googleClientReady = state => {
    return {
        type: actionTypes.GOOGLE_CLIENT_READY,
        payload: state
    }
}

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
export const initOptionsChange = id => {
    return {
        type: actionTypes.INIT_OPTIONS_CHANGE,
        payload: id
    }
}
export const resetOptionsChange = (id, type) => {
    return {
        type: actionTypes.RESET_OPTIONS_CHANGE,
        payload: {
            id: id,
            type: type || "string"
        }
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
export const setNewOptionsChange = (header, newOption) => {
    return {
        type: actionTypes.SET_NEW_OPTIONS_CHANGE,
        payload: {
            header: header,
            newOption: newOption
        }
    }
}
export const removeNewOptionsChange = (header, option) => {
    return {
        type: actionTypes.REMOVE_NEW_OPTIONS_CHANGE,
        payload: {
            header: header,
            option: option
        }
    }
}

// Filters Actions
export const addFilter = filter => {
    return {
        type: actionTypes.ADD_FILTER,
        payload: {
            key: filter.key,
            values: filter.values,
            id: filter.id
        }
    }
}

export const removeFilter = filter => {
    return {
        type: actionTypes.REMOVE_FILTER,
        payload: {
            key: filter.key,
            value: filter.value,
            id: filter.id
        }
    }
}

// Theme Actions
export const changeTheme = () => {
    return {
        type: actionTypes.CHANGE_THEME
    }
}