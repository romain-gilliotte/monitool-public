import angular from 'angular';


const module = angular.module(
	'monitool.directives.acl.projectinput',
	[]
);


const isAllowedForm = function(userCtx, scope, element, attributes) {
	var project = scope.$eval(attributes.aclProject),
		askedFormId = scope.$eval(attributes.aclHasInputForm) || scope.$eval(attributes.aclLacksInputForm);

	var internalUser = project.users.find(u => u.email == userCtx.email);
	return userCtx.role === 'admin' || project.canInputForm(internalUser, askedFormId);
};


module.directive('aclHasInputForm', function($rootScope) {
	return {
		link: function(scope, element, attributes) {
			var isAllowed = isAllowedForm($rootScope.userCtx, scope, element, attributes);
			if (!isAllowed)
				element.remove();
		}
	}
});


module.directive('aclLacksInputForm', function($rootScope) {
	return {
		link: function(scope, element, attributes) {
			var isAllowed = isAllowedForm($rootScope.userCtx, scope, element, attributes);
			if (isAllowed)
				element.remove();
		}
	}
});


export default module.name;
