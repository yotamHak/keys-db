import React, { useState, useEffect } from "react";

import GoogleLogin from "react-google-login";
import { GoogleLogout } from "react-google-login";

import googleConfig from "../../../google/config";

import { useHistory } from "react-router-dom";
import { Image, Segment } from "semantic-ui-react";

import { gapi } from 'gapi-script';

export function GoogleLoginComponent({ onLogin, onLogout }) {
    const [loggedIn, setLoggedIn] = useState(false);
    const [profile, setProfile] = useState(null);

    const history = useHistory();

    useEffect(() => {
        if (loggedIn) {
            loadGoogle()
            onLogin()
            // history.push("/settings");
        } else {
            onLogout()
            // history.push("/");
        }
    }, [loggedIn])

    async function loadGoogle() {
        gapi.load("client:auth2", initClient);
    }

    function initClient() {
        gapi.client
            .init({
                apiKey: googleConfig.apiKey,
                clientId: googleConfig.clientId,
                // Your API key will be automatically added to the Discovery Document URLs.
                discoveryDocs: googleConfig.discoveryDocs,
                scope: "https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets"
            })
            .then(() => {

                // Listen for sign-in state changes.
                gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

                // Handle the initial sign-in state.
                updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());

                // 3. Initialize and make the API request.
                // load(onLoad);
            });
    };

    function updateSigninStatus(isSignedIn) {
        console.log(isSignedIn)
        // var authorizeButton = document.getElementById('authorize_button');
        // var signoutButton = document.getElementById('signout_button');

        if (isSignedIn) {
            // authorizeButton.style.display = 'none';
            // signoutButton.style.display = 'block';
            // load(onLoad);
            // callbackOnSignIn()
            // listMajors();
        } else {
            gapi.auth2.getAuthInstance().signIn();
            // authorizeButton.style.display = 'block';
            // signoutButton.style.display = 'none';
        }
    }

    const responseGoogle = response => {
        console.error(response);
    };

    const onLoginSuccess = response => {
        console.log(response)
        localStorage.setItem('userProfile', JSON.stringify(response.profileObj))
        localStorage.setItem('gTokenId', response.tokenId)
        setProfile(response.profileObj)
        setLoggedIn(true);
    }
    const onLogoutSuccess = response => {
        setLoggedIn(false);
    }

    return (
        <Segment placeholder>
            {loggedIn
                ? (
                    <React.Fragment>
                        <Image avatar src={
                            JSON.parse(localStorage.getItem('userProfile')).imageUrl.replace('=s96-c', '')
                        } />
                        <GoogleLogout
                            clientId={googleConfig.clientId}
                            buttonText="Logout"
                            onLogoutSuccess={onLogoutSuccess}
                        // render={renderProps => (
                        //     <button onClick={renderProps.onClick} disabled={renderProps.disabled}>This is my custom Google button</button>
                        // )}
                        />
                    </React.Fragment>
                )
                : (
                    <GoogleLogin
                        clientId={googleConfig.clientId}
                        buttonText="Login"
                        onSuccess={onLoginSuccess}
                        onFailure={responseGoogle}
                        cookiePolicy={"single_host_origin"}
                        discoveryDocs={googleConfig.discoveryDocs}
                        scope="https://www.googleapis.com/auth/spreadsheets"
                        isSignedIn={true}
                    // render={renderProps => (
                    //     <button onClick={renderProps.onClick} disabled={renderProps.disabled}>This is my custom Google button</button>
                    //   )}
                    />
                )

            }
        </Segment>
    )
}

// https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file 