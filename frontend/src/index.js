import createAuth0Client from '@auth0/auth0-spa-js';
import axios from 'axios';
import Cookies from 'js-cookie';

async function authenticate() {
    const auth0 = (window.auth0 = await createAuth0Client({
        domain: 'monitool.eu.auth0.com',
        client_id: 'z31Kt6FYp8YDG4BypH4qp1ibLd1Ns4ME',
        audience: 'https://api.monitool.org',
        redirect_uri: window.location.origin + '/app.html',
    }));

    // Handle callback
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('code') && urlParams.has('state')) {
        // Process the login state
        await auth0.handleRedirectCallback();

        // Use replaceState to redirect the user away and remove the querystring parameters
        window.history.replaceState({}, document.title, '/app.html');
    }

    // If authenticated, start app
    const isAuthenticated = await auth0.isAuthenticated();
    if (isAuthenticated) {
        // Set accessToken and profile as globals.
        window.accessToken = await auth0.getTokenSilently();
        window.profile = await auth0.getUser();

        // Configure rpc (using cookies when possible avoids the pre-flight requests).
        axios.defaults.baseURL = SERVICE_URL;
        if (/^https?:\/\//i.test(SERVICE_URL)) {
            axios.defaults.headers['Authorization'] = `Bearer ${accessToken}`;
        } else {
            Cookies.set('monitool_access_token', accessToken, {
                path: SERVICE_URL,
                sameSite: 'strict',
                secure: IS_PRODUCTION,
            });
        }

        // Start angular
        const startApp = await import('./app');
        startApp.default();
    }
    // otherwise, go login
    else {
        await auth0.loginWithRedirect();
    }
}

authenticate().catch(e => void (document.body.innerHTML = e.message));
