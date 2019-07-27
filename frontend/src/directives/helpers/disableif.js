import angular from 'angular';


const module = angular.module(
	'monitool.directives.helpers.disableif',
	[]
);


module.directive('disableIf', function() {

	var inhibitHandler = function(event) {
		event.stopImmediatePropagation();
		event.preventDefault();
		return false;
	};

	return {
		retrict: 'A',
		priority: 100,
		scope: {
			disableIf: "="
		},
		link: function($scope, element, attributes) {
			$scope.$watch('disableIf', function(disable) {
				if (disable) {
					element.addClass('disabled')
					element.on('click', inhibitHandler);

					if (element.hasClass('clickable')) {
						element.removeClass('clickable');
						element.addClass('nonclickable');
					}
				}
				else {
					element.removeClass('disabled')
					element.off('click', inhibitHandler);

					if (element.hasClass('nonclickable')) {
						element.addClass('clickable');
						element.removeClass('nonclickable');
					}
				}
			});
		}
	}
});

export default module.name;
