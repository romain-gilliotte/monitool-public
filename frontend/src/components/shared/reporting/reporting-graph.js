import angular from 'angular';


const module = angular.module(__moduleName, []);

module.component(__componentName, {

	bindings: {
		x: '<',
		ys: '<',
		presentation: '<'
	},

	template: require(__templatePath),

	controller: class {

		constructor($element, $scope) {
			"ngInject";

			this.$scope = $scope;
			this.element = $element[0].querySelector('div>div');
			this._formattedYs = [];

			this.c3 = import('c3');
			import('c3/c3.min.css');
		}

		async $postLink() {
			const c3 = await this.c3;

			this.chart = c3.generate({
				size: {
					height: 200
				},
				bindto: this.element,
				data: {
					x: 'x',
					columns: this._formattedYs,
					type: this.presentation
				},
				axis: {
					x: {
						type: "category",
						tick: {
							// fit: true,
							// count: 10
							// culling: {
							// 	max: 10
							// }
						}
					}
				}
			});
		}

		async $onChanges(changes) {
			await this.c3;

			if (changes.x || changes.ys) {
				const formerData = this._formattedYs;
				this._formattedYs = this._format(this.x, this.ys);

				// Generate filename suggestion for the graph.
				if (this._formattedYs.length > 1)
					this.filename = 'graph - ' + Object.values(this.ys)[0].name
				else
					this.filename = null;

				// Chart may not be initialized yet.
				if (this.chart)
					this.chart.load({
						columns: this._formattedYs,
						unload:
							formerData
								.map(d => d[0])
								.filter(d => this._formattedYs.every(e => e[0] !== d))
					});
			}

			if (changes.presentation && this.chart)
				this.chart.transform(this.presentation);

			this.$scope.$apply()
		}

		async $onDestroy() {
			if (this.chart)
				this.chart.destroy();
		}

		_format(x, ys) {
			// Format series according to what c3 is expecting.
			const result = [
				['x', ...x],
				...ys.map(({ label, data }) => [label, ...data.map(d => d ? d.v : null)])
			];

			// Remove duplicate names, c3 can't handle them.
			const taken = new Set();
			result.forEach(row => {
				if (taken.has(row[0])) {
					let i = 2;
					while (taken.has(row[0] + ' (' + i + ')'))
						i++;

					row[0] = row[0] + ' (' + i + ')';
				}

				taken.add(row[0]);
			});

			return result;
		}
	}
});

export default module.name;