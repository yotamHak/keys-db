import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/analytics'
import 'firebase/firestore';

import firebaseConfig from './config';

// Initialize Firebase

class Firebase {
    constructor() {
        app.initializeApp(firebaseConfig);

        const isLocalhost = Boolean(
            window.location.hostname === 'localhost' ||
            // [::1] is the IPv6 localhost address.
            window.location.hostname === '[::1]' ||
            // 127.0.0.1/8 is considered localhost for IPv4.
            window.location.hostname.match(
                /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
            )
        );

        if (!isLocalhost) {
            app.analytics();
        }
    }
}

const firebase = new Firebase();

export default firebase;