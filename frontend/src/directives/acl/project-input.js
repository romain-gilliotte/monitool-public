import angular from 'angular';

const module = angular.module(__moduleName, []);

const isAllowedForm = function (userEmail, scope, attributes) {

	var project = scope.$eval(attributes.aclProject),
		askedFormId = scope.$eval(attributes.aclHasInputForm) || scope.$eval(attributes.aclLacksInputForm);

	if (project.owner == userEmail) return true;

	var internalUser = project.users.find(u => u.email == userEmail);
	return project.canInputForm(internalUser, askedFormId);
};


module.directive('aclHasInputForm', function ($rootScope) {
	return {
		link: function (scope, element, attributes) {
			var isAllowed = isAllowedForm($rootScope.profile.email, scope, attributes);
			if (!isAllowed)
				element.remove();
		}
	}
});


module.directive('aclLacksInputForm', function ($rootScope) {
	return {
		link: function (scope, element, attributes) {
			var isAllowed = isAllowedForm($rootScope.profile.email, scope, attributes);
			if (isAllowed)
				element.remove();
		}
	}
});


export default module.name;
