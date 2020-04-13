import angular from 'angular';

const module = angular.module(__moduleName, []);

module.filter('maxLength', function () {
	return function (string, size) {
		if (!string)
			return string;

		if (string.length > size)
			return string.slice(0, size - 3) + '...';
		else
			return string;
	};
});

export default module.name;

