import * as actionTypes from '../../actionTypes/AuthenticationActionTypes';

const initialAuthenticationState = {
    steam: {
        loggedIn: null,
        id: null,
        apiKey: null,
        profile: null,
        ownedGames: null,
    },
    google: {
        loggedIn: false,
        googleClientReady: false,
        profile: null,
    },
    itad: {
        map: null,
    },
    setupComplete: false,
    spreadsheetId: null,
    currentSpreadsheetId: null,
    permission: null,
}

export const authentication_reducer = (state = initialAuthenticationState, action) => {
    let newState = null;

    switch (action.type) {
        case actionTypes.STEAM_SET_ID:
            return {
                ...state,
                steam: {
                    ...state.steam,
                    id: action.payload,
                }
            }
        case actionTypes.STEAM_SET_API_KEY:
            return {
                ...state,
                steam: {
                    ...state.steam,
                    apiKey: action.payload,
                }
            }
        case actionTypes.STEAM_SET_PROFILE:
            return {
                ...state,
                steam: {
                    ...state.steam,
                    profile: action.payload,
                }
            }
        case actionTypes.STEAM_LOGGED:
            if (action.payload) {
                newState = {
                    ...state,
                    steam: {
                        ...state.steam,
                        loggedIn: action.payload,
                    }
                }
            } else {
                newState = {
                    ...state,
                    steam: {
                        ...initialAuthenticationState.steam,
                        loggedIn: action.payload,
                    }
                }
            }

            if (action.payload === true) {
                localStorage.setItem('steam', JSON.stringify(newState.steam))
            } else {
                localStorage.removeItem('steam')
            }

            return newState
        case actionTypes.STEAM_LOAD:
            return {
                ...state,
                steam: action.payload
            }
        case actionTypes.STEAM_SET_OWNED_GAMES:
            newState = {
                ...state,
                steam: {
                    ...state.steam,
                    ownedGames: action.payload
                }
            }

            localStorage.setItem('steam', JSON.stringify(newState.steam))

            return {
                ...state,
                steam: {
                    ...state.steam,
                    ownedGames: action.payload
                }
            }
        case actionTypes.ITAD_SET_MAP:
            newState = {
                ...state,
                itad: {
                    ...state.itad,
                    map: action.payload
                }
            }

            localStorage.setItem('itad', JSON.stringify(newState.itad))

            return {
                ...state,
                itad: {
                    ...state.itad,
                    map: action.payload
                }
            }
        case actionTypes.GOOGLE_LOGGED_OUT:
            return {
                ...state,
                google: {
                    googleClientReady: true,
                    loggedIn: false,
                    profile: null
                }
            }
        case actionTypes.GOOGLE_LOGGED_IN:
            return {
                ...state,
                google: {
                    ...state.google,
                    loggedIn: true,
                    profile: action.payload
                }
            }
        case actionTypes.GOOGLE_CLIENT_READY:
            return {
                ...state,
                google: {
                    ...state.google,
                    googleClientReady: action.payload,
                }
            }
        case actionTypes.SPREADSHEET_SET_ID:
            newState = {
                ...state,
                spreadsheetId: action.payload
            }

            localStorage.setItem('spreadsheetId', action.payload)
            return newState
        case actionTypes.SET_CURRENT_SPREADSHEET_ID:
            return {
                ...state,
                currentSpreadsheetId: action.payload
            }
        case actionTypes.SET_CURRENT_SHEET_ID:
            return {
                ...state,
                currentSheetId: action.payload
            }
        case actionTypes.SET_UP_COMPLETE:
            return {
                ...state,
                setupComplete: action.payload
            }
        case actionTypes.SET_SPREADSHEET_PERMISSION:
            return {
                ...state,
                permission: action.payload
            }
        default:
            return state;
    }
}