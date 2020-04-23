
import queryAggregate from './query-aggregate';
import queryDiceLocation from './query-dice-location';
import queryDiceTime from './query-dice-time';

const module = angular.module(__moduleName, [queryAggregate, queryDiceLocation, queryDiceTime]);

module.component(__componentName, {
	bindings: {
		project: '<',
		onUpdate: '&'
	},

	template: require(__templatePath),

	controller: class {

		$onInit() {
			this.panelOpen = false;
			this.dice = [];
			this.aggregate = null;
		}

		onPanelHeaderClick() {
			this.panelOpen = !this.panelOpen;
		}

		onChildUpdate(dice, aggregate) {
			if (dice) {
				this.dice = [
					...this.dice.filter(e => e.id !== dice.id),
					dice
				];
			}

			if (aggregate) {
				this.aggregate = aggregate;
			}

			if (this.aggregate && this.dice.length == 2) {
				this.onUpdate({
					query: {
						aggregate: [this.aggregate],
						dice: this.dice,
					}
				});
			}
		}
	}
});


export default module.name;
