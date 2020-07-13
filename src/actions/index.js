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


export const spreadsheetSetId = id => {
    return {
        type: actionTypes.SPREADSHEET_SET_ID,
        payload: id
    }
}
export const setupComplete = () => {
    return {
        type: actionTypes.SET_UP_COMPLETE
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

// Filters Actions
export const addFilter = filter => {
    return {
        type: actionTypes.ADD_FILTER,
        payload: {
            key: filter.key,
            values: filter.values
        }
    }
}

export const removeFilter = filter => {
    return {
        type: actionTypes.REMOVE_FILTER,
        payload: {
            key: filter.key,
            value: filter.value
        }
    }
}

// Theme Actions
export const changeTheme = () => {
    return {
        type: actionTypes.CHANGE_THEME
    }
}