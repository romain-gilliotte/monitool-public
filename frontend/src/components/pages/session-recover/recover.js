/*!
 * This file is part of Monitool.
 *
 * Monitool is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Monitool is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Monitool. If not, see <http://www.gnu.org/licenses/>.
 */

import angular from 'angular';
import axios from 'axios';
import uiRouter from '@uirouter/angularjs';

const module = angular.module(
    'monitool.components.pages.recover',
    [
        uiRouter, // for $stateProvider
    ]
);

module.config($stateProvider => {

    $stateProvider.state('init.recover', {
        acceptedUsers: ['loggedOut'],
        url: '/recover',
        component: 'recover'
    });
});


module.component('recover', {
    bindings: {
    },
    template: require('./recover.html'),
    controller: class RecoverController {

        constructor($scope, $rootScope, $state) {
            this.$scope = $scope;
            this.$rootScope = $rootScope;
            this.$state = $state;
        }

        async onQueryRecoveryEmailClicked() {
            try {
                this.errorMessage = null;

                await axios.post('/api/authentication/request-reset-password', {email: this.email});
                this.isWaitingToken = true
            }
            catch (e) {
                if (e.response.data.error == 'already_sent') {
                    this.isWaitingToken = true
                }
                else {
                    this.errorMessage = e.response.data.error;
                }
            }
            finally {
                this.$scope.$apply();
            }
        }

        async onChangePasswordClicked() {
            if (this.password != this.password2) {
                this.errorMessage = 'password_dont_match';
                return;
            }

            try {
                await axios.post('/api/authentication/reset-password', {
                    email: this.email,
                    password: this.password,
                    token: this.token
                })

                await this.logUserIn(this.email, this.password);
            }
            catch (e) {
                this.errorMessage = e.response.data.error;
            }
            finally {
                this.$scope.$apply();
            }
        }

        async logUserIn(email, password) {
            // Log the user in.
            const response = await axios.post('/api/authentication/login', {
                email: email,
                password: password
            });

            window.localStorage.token = response.data.token;

            // Setup default axios header.
            axios.defaults.headers.common['Authorization'] = window.localStorage.token;

            // Put user in $rootScope
            const payload = atob(window.localStorage.token.split('.')[1]);

            this.$rootScope.userCtx = JSON.parse(payload);
            this.$state.go('main.home')
        }
    }
});


export default module.name;
