import { useEffect, useState, } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { googleLoggedIn, googleLoggedOut, googleClientReady } from '../actions';
import { useHistory } from 'react-router-dom';
import { gapi } from 'gapi-script';

// Custom hook to initialize and use the Google API
function useGapi(options,) {
    const google = useSelector((state) => state.authentication.google);

    // const [gapi, setGapi] = useState(undefined);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const dispatch = useDispatch();
    const history = useHistory();

    const {
        apiKey,
        clientId,
        discoveryDocs,
        scope,
        ux_mode,
        // redirect_uri,
        onLoaded,
    } = options;

    useEffect(() => {
        gapi.load("client:auth2", initClient);

        // This code section isn't using the gapi-script, it uses DOM to get the gapi from the API
        // if (gapi) {
        //     // Listen for sign-in state changes.
        //     gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        //     // Handle the initial sign-in state.
        //     updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());

        //     // Initialize and make the API request.
        //     !google.googleClientReady && dispatch(googleClientReady(true))
        //     onLoaded && onLoaded()
        //     setIsLoading(false)
        // } else {
        //     const hasScript = document.getElementById('gapi-script')

        //     // Create script tag, initialize gapi, append script to document
        //     const script = document.getElementById('gapi-script') || document.createElement('script');
        //     script.setAttribute("id", "gapi-script");
        //     script.src = 'https://apis.google.com/js/api.js';
        //     script.addEventListener('onload', window.gapi.load('client:auth2', async () => {
        //         try {
        //             await window.gapi.client.init({
        //                 apiKey,
        //                 discoveryDocs,
        //                 clientId,
        //                 scope,
        //                 ux_mode,
        //                 // redirect_uri
        //             });

        //             setGapi(window.gapi);
        //         } catch (error) {
        //             // console.log('Cookies error')
        //             console.log(error.details);
        //         }
        //     }))

        //     !hasScript && document.body.appendChild(script);
        // }
        // }, [gapi,]);
    }, []);

    function initClient() {
        // 2. Initialize the JavaScript client library.
        gapi.client
            .init({
                apiKey,
                discoveryDocs,
                clientId,
                scope,
                ux_mode,
                // redirect_uri
            })
            .then(() => {
                // Listen for sign-in state changes.
                gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

                // Handle the initial sign-in state.
                updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());

                // Initialize and make the API request.
                !google.googleClientReady && dispatch(googleClientReady(true))
                onLoaded && onLoaded()
                setIsLoading(false)
            });
    };

    function updateSigninStatus(isSignedIn) {
        if (!isSignedIn) {
            // gapi.auth2.getAuthInstance().signIn();
        } else {
            localStorage.setItem('gTokenId', gapi.client.getToken().access_token)

            const userInfo = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
            const basicProfile = {
                id: userInfo && userInfo.getId(),
                fullName: userInfo && userInfo.getName(),
                givenName: userInfo && userInfo.getGivenName(),
                familyName: userInfo && userInfo.getFamilyName(),
                imageUrl: userInfo && userInfo.getImageUrl(),
                email: userInfo && userInfo.getEmail(),
            };

            setIsAuthenticated(true);
            setCurrentUser(basicProfile);
            google.profile === null && dispatch(googleLoggedIn(basicProfile))
        }
    };

    async function handleSignIn() {
        try {
            await gapi.auth2.getAuthInstance().signIn();
        } catch (error) {
            console.log(error);
            throw new Error('Google API not loaded', error);
        }
    };

    async function handleSignOut() {
        try {
            await gapi.auth2.getAuthInstance().signOut();
            localStorage.removeItem('gTokenId');
            setIsAuthenticated(false);
            dispatch(googleLoggedOut());
            history.push('/');
        } catch (error) {
            console.log(error);
            throw new Error('Google API not loaded', error);
        }
    };

    return {
        isLoading,
        currentUser,
        isAuthenticated,
        handleSignIn,
        handleSignOut
    };
}

export default useGapi;