import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import progressBar from '../../shared/misc/progress-bar';

const module = angular.module(__moduleName, [uiRouter, progressBar]);

module.config($stateProvider => {

	$stateProvider.state('main.project.structure.home', {
		acceptedUsers: ['loggedIn'],
		url: '/structure-home',
		component: __componentName
	});

});

module.component(__componentName, {

	bindings: {
		project: '<'
	},

	template: require(__templatePath),

	controller: class ProjectStructureHomeController {

		$onChanges(changes) {
			const lfIndicators = this.project.logicalFrames.reduce((memo, lf) => [
				...memo,
				...lf.indicators,
				...lf.purposes.reduce((memo, purpose) => [
					...memo,
					...purpose.indicators,
					...purpose.outputs.reduce((memo, output) => [
						...memo,
						...output.indicators,
						...output.activities.reduce((memo, activity) => [
							...memo,
							...activity.indicators
						], [])
					], [])
				], [])
			], []);

			this.percentages = {
				basicsDone: this.project.name && this.project.country ? 1 : 0,
				sitesDone: this.project.entities.length ? 1 : 0,
				referenceLfDone: this.project.logicalFrames.length > 0 ? 1 : 0,
				otherLfDone: this.project.logicalFrames.length > 1 ? 1 : 0,
				extraIndicatorsDone2: this.project.extraIndicators.length ? 1 : 0,
				lfIndicatorsDone: lfIndicators.filter(i => !!i.computation).length / lfIndicators.length,
				extraIndicatorsDone: this.project.extraIndicators.filter(i => !!i.computation).length / this.project.extraIndicators.length
			};
		}

	}
});


module.component('projectStructureHomeEs', {
	bindings: {
		project: '<',
		percentages: '<'
	},
	template: require('./home-es.html')
})

module.component('projectStructureHomeEn', {
	bindings: {
		project: '<',
		percentages: '<'
	},
	template: require('./home-en.html')
})

module.component('projectStructureHomeFr', {
	bindings: {
		project: '<',
		percentages: '<'
	},
	template: require('./home-fr.html')
});



export default module.name;

