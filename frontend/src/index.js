import createAuth0Client from '@auth0/auth0-spa-js';
import axios from 'axios';
import Cookies from 'js-cookie';

async function authenticate() {
    // E2E test mode: bypass Auth0 entirely and bootstrap the app with a fixed
    // test profile. Gated behind the AUTH_DISABLED build constant, which is only
    // defined by webpack.config.e2e.js (never in dev/prod). `typeof` guard keeps
    // this a dead, tree-shakeable branch when the constant is undefined.
    if (typeof AUTH_DISABLED !== 'undefined' && AUTH_DISABLED) {
        // The identity is selectable per browser context: the Playwright fixture
        // injects window.__E2E_USER__ via addInitScript before this runs. It is
        // encoded into the token as `e2e:<email>` so the API derives the same
        // identity from the request. Defaults to the legacy single-user profile.
        const e2eUser = (typeof window !== 'undefined' && window.__E2E_USER__) || {};
        const email = e2eUser.email || 'e2e@monitool.test';
        const name = e2eUser.name || 'E2E';
        const token = `e2e:${email}`;
        window.accessToken = token;
        window.profile = { email, name, email_verified: true };

        axios.defaults.baseURL = SERVICE_URL;
        Cookies.set('monitool_access_token', token, {
            path: SERVICE_URL,
            sameSite: 'strict',
            secure: IS_PRODUCTION,
        });

        const startApp = await import('./app');
        startApp.default();
        return;
    }

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
