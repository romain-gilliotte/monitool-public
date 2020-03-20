import angular from 'angular';
import TimeSlot from 'timeslot-dag';

const module = angular.module(
	'monitool.filters.timeslot',
	[]
);

module.filter('formatSlot', function ($rootScope) {

	return function (slotValue) {
		if (slotValue === '_total' || slotValue == 'total')
			return 'Total';

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
		var slot = new TimeSlot(slotValue);
		return $filter('date')(slot.firstDate, 'fullDate', 'utc') + ' - ' + $filter('date')(slot.lastDate, 'fullDate', 'utc');
	};
});

module.filter('formatSlotLong', function ($filter) {
	return function (slotValue) {
		if (slotValue === '_total' || slotValue === 'total')
			return 'Total';
		else
			return $filter('formatSlot')(slotValue) + ' (' + $filter('formatSlotRange')(slotValue) + ')';
	}
});


export default module.name;
