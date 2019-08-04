import { CognitoAuth } from 'amazon-cognito-auth-js';

const auth = new CognitoAuth({
    ClientId: '7nijpq4pen2j4h2ev0j96hv620', // Your client id here
    AppWebDomain: 'auth.monitool.org',
    TokenScopesArray: ['email', 'openid', 'profile', 'aws.cognito.signin.user.admin'],
    RedirectUriSignIn: 'http://localhost:8080/callback.html',
    RedirectUriSignOut: 'http://localhost:8080',
    UserPoolId: 'monitool-userpool',
    AdvancedSecurityDataCollectionFlag: false,
});

export default auth;
