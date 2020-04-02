import angular from 'angular';

const module = angular.module(__moduleName, []);

module.filter('length', function () {
	return function (obj) {
		return obj ? Object.keys(obj).length : 0;
	};
});

module.filter('join', function () {
	return function (list, token) {
		return (list || []).join(token);
	};
});

module.filter('pluck', function () {
	function pluck(objects, property) {
		if (!(objects && property && angular.isArray(objects)))
			return [];

		property = String(property);

		return objects.map(object => {
			// just in case
			object = Object(object);

			if (object.hasOwnProperty(property)) {
				return object[property];
			}

			return '';
		});
	}

	return function (objects, property) {
		return pluck(objects, property);
	}
});

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

