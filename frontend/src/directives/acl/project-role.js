
import angular from 'angular';


const module = angular.module(
	'monitool.directives.acl.projectrole',
	[]
);


const isAllowedProject = function (userEmail, scope, attributes) {
	// FIXME: shouldn't this be the other way around? $eval(attr) || defaultValue
	var project = scope.$eval(attributes.aclProject),
		askedRole = attributes.aclHasProjectRole || attributes.aclLacksProjectRole;

	if (askedRole !== 'owner' && askedRole !== 'input')
		throw new Error("acl-has-project-role must be called with either 'owner' or 'input'");

	let internalUser = project.users.find(u => u.email == userEmail);

	if (askedRole === 'owner')
		return (internalUser && internalUser.role === 'owner');
	else if (askedRole === 'input')
		return internalUser && ['owner', 'input'].includes(internalUser.role);
	else
		throw new Error('Invalid asked role');
};


module.directive('aclHasProjectRole', function ($rootScope) {
	return {
		link: function (scope, element, attributes) {
			var isAllowed = isAllowedProject($rootScope.userEmail, scope, attributes);
			if (!isAllowed)
				element.remove();
		}
	}
});


module.directive('aclLacksProjectRole', function ($rootScope) {
	return {
		link: function (scope, element, attributes) {
			var isAllowed = isAllowedProject($rootScope.userEmail, scope, attributes);
			if (isAllowed)
				element.remove();
		}
	}
});


export default module.name;
