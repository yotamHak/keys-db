import { combineReducers } from 'redux';
import authentication_reducer from './AuthenticationReducer';
import filters_reducer from './FilterReducer';
import import_reducer from './ImportReducer';
import table_reducer from './TableReducer';
import theme_reducer from './ThemeReducer';

const rootReducer = combineReducers({
    filters: filters_reducer,
    table: table_reducer,
    theme: theme_reducer,
    authentication: authentication_reducer,
    import: import_reducer,
});

export default rootReducer;