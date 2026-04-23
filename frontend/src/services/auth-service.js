import angular from 'angular';
import axios from 'axios';
import Cookies from 'js-cookie';

class AuthService {
  constructor($rootScope, $q) {
    this.$rootScope = $rootScope;
    this.$q = $q;
    this.isInitialized = false;
    this.accessToken = null;

    // Set up axios defaults
    axios.defaults.baseURL = SERVICE_URL;
  }

  async initialize() {
    if (this.isInitialized) {
      return;
    }

    // Check if we have a stored token
    let token = null;

    if (/^https?:\/\//i.test(SERVICE_URL)) {
      // External service, use Authorization header
      const cookieToken = Cookies.get('monitool_access_token');
      if (cookieToken) {
        token = cookieToken;
        axios.defaults.headers['Authorization'] = `Bearer ${token}`;
      }
    } else {
      // Same domain, token will be sent via cookies
      token = Cookies.get('monitool_access_token');
      if (token) {
        Cookies.set('monitool_access_token', token, {
          path: SERVICE_URL,
          sameSite: 'strict',
          secure: IS_PRODUCTION,
        });
      }
    }

    // If we have a token, try to validate it
    if (token) {
      try {
        const response = await axios.get('/me');
        // Token is valid, set token and profile
        this.accessToken = token;
        this.$rootScope.profile = response.data.user;
      } catch (error) {
        // Token is invalid, clear it
        this.clearAuthentication();
      }
    }

    this.isInitialized = true;
  }

  isAuthenticated() {
    return !!this.$rootScope.profile;
  }

  async checkAuthentication() {
    // Ensure initialization is complete
    await this.initialize();
    return this.isAuthenticated();
  }

  setAuthentication(token, user) {
    // Store token and user data
    this.accessToken = token;
    this.$rootScope.profile = user;

    // Configure axios
    if (/^https?:\/\//i.test(SERVICE_URL)) {
      axios.defaults.headers['Authorization'] = `Bearer ${token}`;
    } else {
      Cookies.set('monitool_access_token', token, {
        path: SERVICE_URL,
        sameSite: 'strict',
        secure: IS_PRODUCTION,
      });
    }
  }

  clearAuthentication() {
    // Clear stored authentication data
    this.accessToken = null;
    this.$rootScope.profile = null;

    // Clear cookies
    Cookies.remove('monitool_access_token');

    // Clear axios headers
    delete axios.defaults.headers['Authorization'];
  }

  async logout() {
    try {
      await axios.post('/logout');
    } catch (error) {
      // Ignore logout errors
    }

    this.clearAuthentication();
  }
}

const module = angular.module('authService', []);

module.service('AuthService', AuthService);

export default module.name;
