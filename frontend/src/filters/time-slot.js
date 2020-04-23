import angular from 'angular';
import TimeSlot from 'timeslot-dag';

const module = angular.module(__moduleName, []);

module.filter('formatSlot', function ($rootScope) {
    return function (slotValue) {
        try {
            return new TimeSlot(slotValue).humanizeValue($rootScope.language);
        } catch (e) {
            return slotValue;
        }
    };
});

module.filter('formatSlotRange', function ($filter) {
    function getStart(slot, start) {
        const projectStart = new Date(start + 'T00:00:00Z');
        const slotStart = slot.firstDate;

        return slotStart < projectStart ? projectStart : slotStart;
    }

    function getEnd(slot, end) {
        const projectEnd = new Date(end + 'T00:00:00Z');
        const slotEnd = slot.lastDate;

        return projectEnd < slotEnd ? projectEnd : slotEnd;
    }

    return function (slotValue, start, end) {
        try {
            const slot = new TimeSlot(slotValue);
            const startDate = getStart(slot, start);
            const endDate = getEnd(slot, end);

            return (
                $filter('date')(startDate, 'fullDate', 'utc') +
                ' - ' +
                $filter('date')(endDate, 'fullDate', 'utc')
            );
        } catch (e) {
            return slotValue;
        }
    };
});

module.filter('formatSlotLong', function ($filter) {
    return function (slotValue, start, end) {
        try {
            return (
                $filter('formatSlot')(slotValue) +
                ' (' +
                $filter('formatSlotRange')(slotValue, start, end) +
                ')'
            );
        } catch (e) {
            return slotValue;
        }
    };
});

export default module.name;
