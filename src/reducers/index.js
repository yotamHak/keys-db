import { combineReducers } from 'redux';
import * as actionTypes from '../actions/types';
import _ from 'lodash';

const initialTableState = {
    headers: {},
    rows: [],
    reset: {
        limit: false,
        offset: false,
        filters: false,
        orderBy: false,
    },
    reload: false,
    orderBy: { sort: 'Date Added', asc: false },
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
    steam: false,
    google: false,
    googleClientReady: false,
    setupComplete: false,
    steamApiKey: {
        key: null,
        isSet: false,
    },
    spreadsheetId: {
        id: null,
        isSet: false,
    },
}

const authentication_reducer = (state = initialAuthenticationState, action) => {
    switch (action.type) {
        case actionTypes.SET_UP_COMPLETE:
            return {
                ...state,
                setupComplete: true
            }
        case actionTypes.SPREADSHEET_ID_SET:
            return {
                ...state,
                spreadsheetId: {
                    isSet: true,
                    id: action.payload
                }
            }
        case actionTypes.STEAM_API_KEY_SET:
            return {
                ...state,
                steamApiKey: {
                    isSet: true,
                    key: action.payload
                }
            }
        case actionTypes.STEAM_LOGGED_IN:
            return {
                ...state,
                steam: true
            }
        case actionTypes.GOOGLE_LOGGED_IN:
            return {
                ...state,
                google: true
            }
        case actionTypes.GOOGLE_CLIENT_READY:
            return {
                ...state,
                googleClientReady: action.payload
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