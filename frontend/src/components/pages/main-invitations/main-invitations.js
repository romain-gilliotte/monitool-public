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
            "ngInject";

            this.$state = $state;
        }

        async acceptInvitation(ivt) {
            const { project, _id, ...newIvt } = ivt;
            newIvt.accepted = true;
            await axios.put(`/invitation/${_id}`, newIvt);

            this.$state.go('main.projects', {}, { reload: true });
        }

        async refuseInvitation(ivt) {
            this.invitations = this.invitations.filter(i => i !== ivt);
            await axios.delete(`/invitation/${ivt._id}`);

            this.$state.reload();
        }
    }
});

export default module.name;
