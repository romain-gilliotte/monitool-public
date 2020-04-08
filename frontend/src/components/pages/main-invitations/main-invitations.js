import uiRouter from '@uirouter/angularjs';
import angular from 'angular';
import axios from 'axios';

require(__cssPath);

const module = angular.module(__moduleName, [uiRouter]);

module.config($stateProvider => {
    $stateProvider.state('main.invitations', {
        url: '/invitations',
        component: __componentName,
        resolve: {
            invitations: async () => {
                const response = await axios.get(`/resources/invitation`);
                return response.data;
            }
        }
    });

});

module.component(__componentName, {
    bindings: {
        invitations: '<'
    },
    template: require(__templatePath),
    controller: class {

        constructor($state) {
            this.$state = $state;
        }

        async acceptInvitation(ivt) {
            const { project, _id, ...newIvt } = ivt;
            newIvt.accepted = true;

            await axios.put(`/resources/invitation/${_id}`, newIvt);
            this.$state.go('main.projects');
        }

        async refuseInvitation(ivt) {
            this.invitations = this.invitations.filter(i => i !== ivt);
            await axios.delete(`/resources/invitation/${ivt._id}`);
        }
    }
});

export default module.name;
