import angular from 'angular';
import Input from '../../../models/input';
import uiRouter from '@uirouter/angularjs';
import mtFilterTimeSlot from '../../../filters/time-slot';
import mtHelpPanel from '../../shared/misc/help-panel';
require(__cssPath);

const module = angular.module(__moduleName, [uiRouter, mtFilterTimeSlot, mtHelpPanel]);

module.config($stateProvider => {

	$stateProvider.state('project.input.list', {
		url: '/input/:dataSourceId/list',
		component: __componentName,
		resolve: {
			dataSourceId: ($stateParams) => $stateParams.dataSourceId,
		}
	});
});


module.component(__componentName, {
	bindings: {
		'project': '<',
		'dataSourceId': '<',
	},
	template: require(__templatePath),

	controller: class ProjectInputListController {

		constructor($element, $rootScope, $state, $scope) {
			this.$state = $state;
			this.$scope = $scope;
			this.userEmail = $rootScope.profile.email;
			this._element = $element;
		}

		$onInit() {
			this._binded = this._onScroll.bind(this);
		}

		$onDestroy() {
			if (this._container)
				this._container.unbind('scroll', this._binded);
		}

		_onScroll() {
			this.headerStyle = {
				transform: 'translate(0, ' + this._container[0].scrollTop + 'px)'
			};

			this.firstColStyle = {
				transform: 'translate(' + this._container[0].scrollLeft + 'px)'
			};

			this.$scope.$apply();
		}

		$onChanges(changes) {
			// Define form
			this.dataSource = this.project.forms.find(ds => ds.id === this.dataSourceId);

			// Define sites (depending on user permissions)
			this.sites = this.project.entities.filter(e => this.dataSource.entities.includes(e.id));

			// This will happen regardless of unexpected entries.
			if (this.project.owner !== this.userEmail) {
				const projectUser = this.project.users.find(u => u.email == this.userEmail);
				if (projectUser.role === 'input')
					this.sites = this.sites.filter(e => projectUser.entities.includes(e.id));
			}

			this.loading = true;
			this.load();
		}

		async load() {
			this.inputsStatus = await Input.fetchFormStatus(this.project, this.dataSourceId);

			// Those list tell which rows should be displayed.
			this.visibleStatus = Object.keys(this.inputsStatus).slice(0, 10);
			this.hiddenStatus = Object.keys(this.inputsStatus).slice(10);

			this.loading = false;
			this.$scope.$apply();

			// if there are results, bind a scroll event to the div around the table.
			// this is extremely hacky and will break when the template is changed. There must be a better way
			if (this.visibleStatus.length) {
				this._container = angular.element(this._element.children()[2]);
				this._container.bind('scroll', this._binded);
			}
		}

		showMore() {
			this.visibleStatus.push(...this.hiddenStatus.splice(0, 10));
		}

		addInput(entityId) {
			this.$state.go('project.input.edit', {
				period: this.newInputDate,
				dataSourceId: this.dataSource.id,
				entityId: entityId
			});
		}
	}
});


export default module.name;
