import * as actionTypes from '../../actions/types';

// Import Reducer
const initialImportState = {
    headers: null
}

export const import_reducer = (state = initialImportState, action) => {
    switch (action.type) {
        case actionTypes.SET_IMPORTED_HEADERS:
            return {
                ...state,
                headers: action.payload
            }
        case actionTypes.SET_IMPORTED_HEADER:
            return {
                ...state,
                headers: {
                    ...state.headers,
                    [action.payload.label]: action.payload
                }
            }
        default:
            return state;
    }
}