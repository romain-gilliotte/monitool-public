import angular from 'angular';
import TimeSlot from 'timeslot-dag';

const module = angular.module(__moduleName, []);

module.filter('formatSlot', function ($rootScope) {
	return function (slotValue) {
		try {
			return new TimeSlot(slotValue).humanizeValue($rootScope.language);
		}
		catch (e) {
			return slotValue;
		}
	};
})

module.filter('formatSlotRange', function ($filter) {
	return function (slotValue) {
		try {
			var slot = new TimeSlot(slotValue);
			return $filter('date')(slot.firstDate, 'fullDate', 'utc') + ' - ' + $filter('date')(slot.lastDate, 'fullDate', 'utc');
		}
		catch (e) {
			return slotValue;
		}
	};
});

module.filter('formatSlotLong', function ($filter) {
	return function (slotValue) {
		try {
			return $filter('formatSlot')(slotValue) + ' (' + $filter('formatSlotRange')(slotValue) + ')';
		}
		catch (e) {
			return slotValue;
		}
	}
});


export default module.name;
