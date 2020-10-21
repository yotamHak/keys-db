import * as actionTypes from '../../actionTypes/StatisticsActionsTypes';

// Statistics Reducer
const initialStatisticsState = {
    spreadsheetData: null,
    charts: null,
};

export const statistics_reducer = (state = initialStatisticsState, action) => {
    switch (action.type) {
        case actionTypes.LOAD_STATISTICS_SPREADSHEET:
            return {
                ...state,
                spreadsheetData: action.payload,
            };
        case actionTypes.CLEAR_STATISTICS_SPREADSHEET:
            localStorage.removeItem('statisticsSpreadsheet');

            return {
                ...state,
                spreadsheetData: null,
            };
        case actionTypes.LOAD_STATISTICS_CHARTS:
            return {
                ...state,
                charts: action.payload,
            };
        case actionTypes.CLEAR_STATISTICS_CHARTS:
            localStorage.removeItem('statisticsCharts');

            return {
                ...state,
                charts: null,
            };
        case actionTypes.RESET_STATISTICS_STORAGE:
            localStorage.removeItem('statisticsSpreadsheet');
            localStorage.removeItem('statisticsCharts');

            return {
                ...state,
                spreadsheetData: null,
                charts: null,
            };
        default:
            return state;
    }
};
