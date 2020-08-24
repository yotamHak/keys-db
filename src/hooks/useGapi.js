import { useEffect, useState, } from 'react';

// Custom hook to initialize and use the Google API
function useGapi(opts) {
    const [gapi, setGapi] = useState(undefined);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const {
            apiKey,
            clientId,
            discoveryDocs,
            scope,
            ux_mode,
            redirect_uri,
            onLoaded
        } = opts;

        // Create script tag, initialize gapi, append script to document
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = () => {
            window.gapi.load('client:auth2', async () => {
                try {
                    await window.gapi.client.init({
                        apiKey,
                        discoveryDocs,
                        clientId,
                        scope,
                        ux_mode,
                        redirect_uri
                    });
                    const auth = window.gapi.auth2.getAuthInstance();
                    auth.isSignedIn.listen(() => {
                        setIsAuthenticated(auth.currentUser.get().hasGrantedScopes(scope));
                    });
                    // Load an API (ex. Calendar API) when client is loaded to the DOM
                    onLoaded(window.gapi.client);
                    setIsAuthenticated(auth.currentUser.get().hasGrantedScopes(scope));
                    const userInfo = auth.currentUser.get().getBasicProfile();
                    const profile = {
                        name: userInfo && userInfo.getName(),
                        email: userInfo && userInfo.getEmail(),
                        photoUrl: userInfo && userInfo.getImageUrl(),
                        googleId: userInfo && userInfo.getId()
                    };
                    setCurrentUser(profile);
                    // setCurrentUser(auth.currentUser.get().getBasicProfile());
                    setGapi(window.gapi);
                    setIsLoading(false);
                } catch (error) {
                    console.log(error);
                }
            });
        };

        document.body.appendChild(script);
    }, [gapi]);

    const handleSignIn = async () => {
        try {
            await gapi.auth2.getAuthInstance().signIn();
        } catch (error) {
            console.log(error);
            throw new Error('Google API not loaded', error);
        }
    };

    const handleSignOut = async () => {
        try {
            await gapi.auth2.getAuthInstance().signOut();
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