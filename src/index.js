import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import * as serviceWorker from "./serviceWorker";

import 'semantic-ui-css/semantic.min.css';

// import { createStore } from 'redux';
// import { Provider, connect } from 'react-redux';
// import { composeWithDevTools } from 'redux-devtools-extension';
// import rootReducer from './reducers';
// import { setUser, clearUser } from './actions';


import MainApp from "./components/KeysDbApp/Main";

// const store = createStore(rootReducer, composeWithDevTools());


ReactDOM.render(
    <MainApp />
    , document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
