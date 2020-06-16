import React from "react";
import { BrowserRouter } from 'react-router-dom';
// import firebase from "firebase";

import MainApp from "./KeysDbApp/Main";

function App() {
    return (
        <BrowserRouter>
            <MainApp />
        </BrowserRouter>
    );
}

export default App;