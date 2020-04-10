import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import Input from '../../../models/input';

const module = angular.module(__moduleName, [uiRouter]);

module.config($stateProvider => {
	$stateProvider.state('project.usage.home', {
		url: '/input-home',
		component: __componentName,
	});
});

module.component(__componentName, {
	bindings: {
		project: '<',
		invitations: '<'
	},
	template: require(__templatePath),
	controller: class ProjectInputHomeController {

		constructor($scope) {
			this.$scope = $scope;
		}

		async $onChanges(changes) {
			this.users = [
				{
					fullname: 'Romain Gilliotte',
					email: 'rgilliotte@gmail.com',
					avatar: 'https://lh3.googleusercontent.com/a-/AOh14GgY2GNGIEUwXqL9_5eJcwNWX-LNW6acp8_75NGD',
					lastSeen: new Date()
				}, {
					fullname: 'Romain Gilliotte',
					email: 'eloims@gmail.com',
					avatar: 'https://lh4.googleusercontent.com/-01ULdD2txAU/AAAAAAAAAAI/AAAAAAAAAAA/AAKWJJMBmuYnK1aEDdp6Ymj5BOOwQPUiLA/photo.jpg',
					lastSeen: new Date()
				}, {
					fullname: 'Romain Gilliotte',
					email: 'rgilliotte2@gmail.com',
					avatar: 'https://lh3.googleusercontent.com/a-/AOh14GgY2GNGIEUwXqL9_5eJcwNWX-LNW6acp8_75NGD',
					lastSeen: new Date()
				}, {
					fullname: 'Romain Gilliotte',
					email: 'eloims2@gmail.com',
					avatar: 'https://lh4.googleusercontent.com/-01ULdD2txAU/AAAAAAAAAAI/AAAAAAAAAAA/AAKWJJMBmuYnK1aEDdp6Ymj5BOOwQPUiLA/photo.jpg',
					lastSeen: new Date()
				}, {
					fullname: 'Romain Gilliotte',
					email: 'rgilliotte3@gmail.com',
					avatar: 'https://lh3.googleusercontent.com/a-/AOh14GgY2GNGIEUwXqL9_5eJcwNWX-LNW6acp8_75NGD',
					lastSeen: new Date()
				}, {
					fullname: 'Romain Gilliotte',
					email: 'eloims4@gmail.com',
					avatar: 'https://lh4.googleusercontent.com/-01ULdD2txAU/AAAAAAAAAAI/AAAAAAAAAAA/AAKWJJMBmuYnK1aEDdp6Ymj5BOOwQPUiLA/photo.jpg',
					lastSeen: new Date()
				},
			];

			this.status = {};
			this.project.forms.forEach(async form => {
				this.status[form.id] = await Input.fetchFormShortStatus(this.project, form.id);
				this.$scope.$apply();
			});
		}
	}
});

export default module.name;

