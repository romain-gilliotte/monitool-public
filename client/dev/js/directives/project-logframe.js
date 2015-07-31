"use strict";

angular.module('monitool.directives.projectLogframe', [])
	
	.directive('logFrameXls', function($rootScope) {
		return {
			restrict: "AE",
			scope: false,
			link: function($scope, element) {
				var name = function(indicatorId) {
					return $scope.indicatorsById[indicatorId].name;
				};

				var source = function(indicatorId) {
					return $scope.project.indicators[indicatorId].source;
				};

				element.on('click', function() {

				// $scope.$watch('project.logicalFrame', function(logFrame) {
					var logFrame = $scope.project.logicalFrame;
					var tableRows;

					tableRows = [[
						{content: ""},
						{content: "Intervention logic"},
						{content: "Assumptions"},
						{content: "Objectively verifiable indicators of achievement"},
						{content: "Sources and means of verification"},
					]];

					if (logFrame.indicators.length) {
						tableRows.push([
							{content: "Overall objectives", rowspan: logFrame.indicators.length},
							{content: logFrame.goal, rowspan: logFrame.indicators.length},
							{content: "", rowspan: logFrame.indicators.length},
							{content: name(logFrame.indicators[0])},
							{content: source(logFrame.indicators[0])},
						]);

						logFrame.indicators.slice(1).forEach(function(indicatorId) {
							tableRows.push([
								{content: name(indicatorId)},
								{content: source(indicatorId)},
							]);
						});
					}
					else
						tableRows.push([
							{content: "Overall objectives"},
							{content: logFrame.goal},
							{content: ""},
							{content: ""},
							{content: ""}
						]);

					var rowspan = 0, isFirst = true;
					logFrame.purposes.forEach(function(purpose) {
						rowspan += purpose.indicators.length || 1;
					});

					logFrame.purposes.forEach(function(purpose) {
						if (purpose.indicators.length) {
							var firstLine = [
								{content: purpose.description, rowspan: purpose.indicators.length},
								{content: purpose.assumptions, rowspan: purpose.indicators.length},
								{content: name(purpose.indicators[0])},
								{content: source(purpose.indicators[0])},
							];

							if (isFirst) {
								isFirst = false;
								firstLine.unshift({content: "Specific objectives", rowspan: rowspan});
							}

							tableRows.push(firstLine);

							purpose.indicators.slice(1).forEach(function(indicatorId) {
								tableRows.push([
									{content: name(indicatorId)},
									{content: source(indicatorId)}
								]);
							});
						}
						else {
							var firstLine = [
								{content: purpose.description},
								{content: purpose.assumptions},
								{content: ""},
								{content: ""},
							];

							if (isFirst) {
								isFirst = false;
								firstLine.unshift({content: "Specific objectives", rowspan: rowspan});
							}

							tableRows.push(firstLine);
						}
					});
					
					rowspan = 0;
					isFirst = true;
					logFrame.purposes.forEach(function(purpose) {
						purpose.outputs.forEach(function(output) {
							rowspan += output.indicators.length || 1;
						});
					});

					logFrame.purposes.forEach(function(purpose) {
						purpose.outputs.forEach(function(output) {
							if (output.indicators.length) {
								var firstLine = [
									{content: output.description, rowspan: output.indicators.length},
									{content: output.assumptions, rowspan: output.indicators.length},
									{content: name(output.indicators[0])},
									{content: source(output.indicators[0])},
								];

								if (isFirst) {
									isFirst = false;
									firstLine.unshift({content: "Results", rowspan: rowspan});
								}

								tableRows.push(firstLine);

								output.indicators.slice(1).forEach(function(indicatorId) {
									tableRows.push([
										{content: name(indicatorId)},
										{content: source(indicatorId)}
									]);
								});
							}
							else {
								var firstLine = [
									{content: output.description},
									{content: output.assumptions},
									{content: ""},
									{content: ""},
								];

								if (isFirst) {
									isFirst = false;
									firstLine.unshift({content: "Results", rowspan: rowspan});
								}

								tableRows.push(firstLine);
							}
						});
					});

					
					rowspan = 0;
					isFirst = true;
					logFrame.purposes.forEach(function(purpose) {
						purpose.outputs.forEach(function(output) {
							rowspan += output.activities.length;
						});
					});
					
					logFrame.purposes.forEach(function(purpose) {
						purpose.outputs.forEach(function(output) {
							output.activities.forEach(function(activity) {
								var firstLine = [
									{content: activity.description, colspan: 4}
								];

								if (isFirst) {
									isFirst = false;
									firstLine.unshift({content: "Activities", rowspan: rowspan});
								}

								tableRows.push(firstLine);
							});
						});
					});


					var html = ''
					tableRows.forEach(function(row) {
						html += '<tr>';
						row.forEach(function(col) {
							html += '<td colspan="' + (col.colspan || 1) + '" rowspan="' + (col.rowspan || 1) + '">';
							html += col.content[$rootScope.language] || col.content;
							html += '</td>';
						});

						html += '</tr>';
					})

					var template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>', 
						format = function(s, c) { return s.replace(/{(\w+)}/g, function(m, p) { return c[p]; }) };

					var ctx = {worksheet: 'logframe' || 'Worksheet', table: html};
					var blob = new Blob([format(template, ctx)], {type: "application/vnd.ms-excel"});
					saveAs(blob, 'export.xls');
					// console.log(html)
				});
			}
		}
	});



