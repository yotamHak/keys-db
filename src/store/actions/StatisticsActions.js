import * as actionTypes from '../actionTypes/StatisticsActionsTypes';

// Statistics Actions

export const loadStatisticsSpreadsheet = spreadsheetData => {
    return {
        type: actionTypes.LOAD_STATISTICS_SPREADSHEET,
        payload: spreadsheetData
    }
}

export const clearStatisticsSpreadsheet = () => {
    return {
        type: actionTypes.CLEAR_STATISTICS_SPREADSHEET
    }
}

export const loadStatisticsCharts = charts => {
    return {
        type: actionTypes.LOAD_STATISTICS_CHARTS,
        payload: charts
    }
}

export const clearStatisticsCharts = () => {
    return {
        type: actionTypes.CLEAR_STATISTICS_CHARTS
    }
}

export const resetStatisticsStorage = () => {
    return {
        type: actionTypes.RESET_STATISTICS_STORAGE
    }
}