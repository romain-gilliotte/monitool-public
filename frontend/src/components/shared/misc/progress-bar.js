import angular from 'angular';

const module = angular.module(
	'monitool.components.misc.progressbar',
	[]
);


module.component('progressBar', {
	bindings: {
		done: '<',
		incomplete: '<'
	},
	template: require('./progress-bar.html'),
	controller: class ProgressBarController {

		$onChanges(changes) {
			this.done = Math.round(100 * (this.done || 0));
			this.incomplete = Math.round(100 * (this.incomplete || 0));
			this.failed = 100 - this.done - this.incomplete;
		}
	}
});


export default module.name;

