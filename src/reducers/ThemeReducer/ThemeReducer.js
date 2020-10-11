import * as actionTypes from '../../actions/types';

// Theme Reducer
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

export const theme_reducer = (state = initialThemeState, action) => {
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