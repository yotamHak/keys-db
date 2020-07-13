import React from "react";
import googleConfig from "./config";
import { gapi } from 'gapi-script';
import { useDispatch } from "react-redux";
import { googleClientReady, googleLoggedIn } from "../actions";

function GoogleAuthentication({ dontLogin }) {
    React.useEffect(() => {
        // window.gapi.load("client", this.initClient);
        // let auth2 = await loadAuth2(googleConfig.clientId, scopes);
        loadGoogle()
    }, []);

    const dispatch = useDispatch()

    async function loadGoogle() { gapi.load("client:auth2", initClient); }

    function initClient() {
        // 2. Initialize the JavaScript client library.
        gapi.client
            .init({
                apiKey: googleConfig.apiKey,
                clientId: googleConfig.clientId,
                // Your API key will be automatically added to the Discovery Document URLs.
                discoveryDocs: googleConfig.discoveryDocs,
                scope: "https://www.googleapis.com/auth/spreadsheets",
            })
            .then(() => {
                // Listen for sign-in state changes.
                gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

                // Handle the initial sign-in state.
                updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());

                // 3. Initialize and make the API request.
                // load(onLoad);

                dispatch(googleClientReady(true))
            });
    };

    function updateSigninStatus(isSignedIn) {
        // var authorizeButton = document.getElementById('authorize_button');
        // var signoutButton = document.getElementById('signout_button');

        if (isSignedIn) {
            localStorage.setItem('gTokenId', gapi.client.getToken().access_token)

            const basicProfile = {
                id: gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getId(),
                fullName: gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getName(),
                givenName: gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getGivenName(),
                familyName: gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getFamilyName(),
                imageUrl: gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getImageUrl(),
                email: gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getEmail(),
            }

            dispatch(googleLoggedIn(basicProfile))

            // callbackOnSignIn()
            // authorizeButton.style.display = 'none';
            // signoutButton.style.display = 'block';
            // load(onLoad);            
            // listMajors();
        } else {
            if (dontLogin) { return }
            gapi.auth2.getAuthInstance().signIn();
            // authorizeButton.style.display = 'block';
            // signoutButton.style.display = 'none';
        }
    }

    return (<></>);
}

export default GoogleAuthentication;
