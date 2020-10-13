import * as actionTypes from '../actionTypes/AuthenticationActionTypes';

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
export const steamLogged = state => {
    return {
        type: actionTypes.STEAM_LOGGED,
        payload: state
    }
}
export const steamLoad = steam => {
    return {
        type: actionTypes.STEAM_LOAD,
        payload: steam
    }
}
export const steamSetOwnedGames = games => {
    return {
        type: actionTypes.STEAM_SET_OWNED_GAMES,
        payload: games
    }
}
export const itadSetMap = data => {
    return {
        type: actionTypes.ITAD_SET_MAP,
        payload: data
    }
}

export const setupComplete = state => {
    return {
        type: actionTypes.SET_UP_COMPLETE,
        payload: state
    }
}
export const spreadsheetSetId = id => {
    return {
        type: actionTypes.SPREADSHEET_SET_ID,
        payload: id
    }
}
export const setCurrentSpreadsheetId = id => {
    return {
        type: actionTypes.SET_CURRENT_SPREADSHEET_ID,
        payload: id
    }
}
export const setCurrentSheetId = id => {
    return {
        type: actionTypes.SET_CURRENT_SHEET_ID,
        payload: id
    }
}
export const spreadsheetSetPermission = permission => {
    return {
        type: actionTypes.SET_SPREADSHEET_PERMISSION,
        payload: permission
    }
}

export const googleLoggedOut = () => {
    return {
        type: actionTypes.GOOGLE_LOGGED_OUT,
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