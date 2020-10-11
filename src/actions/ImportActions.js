import * as actionTypes from './types';

// Import Actions
export const setImportedHeaders = headers => {
    return {
        type: actionTypes.SET_IMPORTED_HEADERS,
        payload: headers
    }
}

export const setImportedHeader = header => {
    return {
        type: actionTypes.SET_IMPORTED_HEADER,
        payload: header
    }
}
