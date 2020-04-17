import angular from 'angular';
import { TimeDimension } from 'olap-in-memory';

const module = angular.module(__moduleName, []);

module.component(__componentName, {

	bindings: {
		project: '<',
		onUpdate: '&'
	},
	template: require(__templatePath),

	controller: class GeneralGroupBy {

		constructor($rootScope) {
			this.$rootScope = $rootScope;
		}

		$onChanges(changes) {
			const dimension = new TimeDimension('time', 'day', this.project.start, this.project.end);

			this.periodicities = dimension.attributes.filter(attr => attr !== 'all');
			this.groupBy = this._chooseDefaultGroupBy();
			this.onValueChange();
		}

		onValueChange() {
			// Tell parent
			this.onUpdate({
				aggregate: {
					id: this.groupBy === 'entity' ? 'location' : 'time',
					attribute: this.groupBy
				}
			})

			// Update download link
			const projectId = this.project._id;
			const serviceUrl = this.$rootScope.serviceUrl;
			const token = this.$rootScope.accessToken;
			const periodicity = this.groupBy === 'entity' ? 'month' : this.groupBy;
			this.downloadUrl = `${serviceUrl}/project/${projectId}/export/${periodicity}.xlsx?token=${token}`;
		}

		_chooseDefaultGroupBy() {
			const now = new Date().toISOString().substring(0, 10)
			const start = this.project.start;
			const end = this.project.end < now ? this.project.end : now;

			const dimension = new TimeDimension('time', 'day', start, end);
			return this.periodicities.find(periodicity => {
				return dimension.getItems(periodicity).length < 15;
			}) || this.periodicities[this.periodicities.length - 1];
		}

	}
});

export default module.name;