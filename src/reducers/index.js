import { combineReducers } from 'redux';
import * as actionTypes from '../actions/types';
import _ from 'lodash';

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
    orderBy: { sort: 'Date Added', asc: false },
    reload: false,
    pageSize: 24,
}

const table_reducer = (state = initialTableState, action) => {
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
        case actionTypes.INIT_OPTIONS_CHANGE:
            return {
                ...state,
                changes: {
                    ...state.changes,
                    headers: {
                        ...state.changes.headers,
                        [action.payload]: {
                            ...state.changes.headers[action.payload],
                            type: 'dropdown',
                            options: {
                                allowEdit: true,
                                values: []
                            }
                        }
                    }
                },
            }
        case actionTypes.RESET_OPTIONS_CHANGE:
            let newHeader = {
                ...state.changes.headers[action.payload.id],
                type: action.payload.type
            }

            _.unset(newHeader, 'options')

            return {
                ...state,
                changes: {
                    ...state.changes,
                    headers: {
                        ...state.changes.headers,
                        [action.payload.id]: newHeader
                    }
                }
            }
        case actionTypes.SET_NEW_OPTIONS_CHANGE:
            return {
                ...state,
                changes: {
                    ...state.changes,
                    headers: {
                        ...state.changes.headers,
                        [action.payload.header]: {
                            ...state.changes.headers[action.payload.header],
                            options: {
                                ...state.changes.headers[action.payload.header].options,
                                values: _.concat(state.changes.headers[action.payload.header].options.values, action.payload.newOption)
                            }
                        }
                    }
                },
            }
        case actionTypes.REMOVE_NEW_OPTIONS_CHANGE:
            return {
                ...state,
                changes: {
                    ...state.changes,
                    headers: {
                        ...state.changes.headers,
                        [action.payload.header]: {
                            ...state.changes.headers[action.payload.header],
                            options: {
                                ...state.changes.headers[action.payload.header].options,
                                values: state.changes.headers[action.payload.header].options.values.filter(option => option.value !== action.payload.option.value)
                            }
                        }
                    }
                },
            }
        case actionTypes.SET_NEW_ROW_CHANGE:
            return {
                ...state,
                changes: {
                    ...state.changes,
                    [action.payload.id]: action.payload.row
                }
            }
        default:
            return state;
    }
}

const initialFiltersState = []

const filters_reducer = (state = initialFiltersState, action) => {
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
                            values: filter.values.filter(filterValue => { return filterValue !== action.payload.value })
                        }])
                    : result.concat(filter)
            }, [])
        default:
            return state;
    }
}

const initialThemeState = {
    selected: "light",
    light: {
        name: "light",
        foreground: "#000000",
        background: "#eeeeee"
    },
    dark: {
        name: "dark",
        foreground: "#ffffff",
        background: "#222222"
    }
}

const theme_reducer = (state = initialThemeState, action) => {
    switch (action.type) {
        case actionTypes.CHANGE_THEME:
            return {
                ...state,
                selected: state.selected === "light" ? "dark" : "light"
            }
        default:
            return state;
    }
}

const initialAuthenticationState = {
    steam: {
        loggedIn: null,
        id: null,
        apiKey: null,
        profile: null,
    },
    google: {
        loggedIn: null,
        googleClientReady: false,
        profile: null,
    },
    setupComplete: false,
    spreadsheetId: null,
}

const authentication_reducer = (state = initialAuthenticationState, action) => {
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
        case actionTypes.STEAM_LOGGED_IN:
            newState = {
                ...state,
                steam: {
                    ...state.steam,
                    loggedIn: true
                }
            }

            localStorage.setItem('steam', JSON.stringify(newState.steam))
            return newState
        case actionTypes.STEAM_LOAD:
            return {
                ...state,
                steam: action.payload
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

        case actionTypes.SET_UP_COMPLETE:
            return {
                ...state,
                setupComplete: true
            }
        default:
            return state;
    }
}

const rootReducer = combineReducers({
    filters: filters_reducer,
    table: table_reducer,
    theme: theme_reducer,
    authentication: authentication_reducer,
});

export default rootReducer;