/*!
 * This file is part of Monitool.
 *
 * Monitool is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Monitool is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Monitool. If not, see <http://www.gnu.org/licenses/>.
 */


import angular from 'angular';


const module = angular.module(
	'monitool.directives.acl.projectrole',
	[]
);


const isAllowedProject = function(userCtx, scope, element, attributes) {
	// FIXME: shouldn't this be the other way around? $eval(attr) || defaultValue
	var project = scope.$eval(attributes.aclProject),
		askedRole = attributes.aclHasProjectRole || attributes.aclLacksProjectRole;

	if (askedRole !== 'owner' && askedRole !== 'input')
		throw new Error("acl-has-project-role must be called with either 'owner' or 'input'");

	let internalUser = project.users.find(u => u.email == userCtx.email);

	if (askedRole === 'owner')
		return (internalUser && internalUser.role === 'owner');
	else if (askedRole === 'input')
		return internalUser && ['owner', 'input'].includes(internalUser.role);
	else
		throw new Error('Invalid asked role');
};


module.directive('aclHasProjectRole', function($rootScope) {
	return {
		link: function(scope, element, attributes) {
			var isAllowed = isAllowedProject($rootScope.userCtx, scope, element, attributes);
			if (!isAllowed)
				element.remove();
		}
	}
});


module.directive('aclLacksProjectRole', function($rootScope) {
	return {
		link: function(scope, element, attributes) {
			var isAllowed = isAllowedProject($rootScope.userCtx, scope, element, attributes);
			if (isAllowed)
				element.remove();
		}
	}
});


export default module.name;
