"use strict";
define(["jquery", "helper",  "d3v3", "dc"], function (jq, helper, d3v3, dc) {
    function ChartCompositeGroupedBar() {
        console.log("ChartCompositeGroupedBar");
        var self = this;
        self.jq = jq;
        self.helper = new helper();
        self.dc = dc;
		self.d3v3 = d3v3;


		// ***********************************
		// Composite Grouped Bar chart
		// ***********************************
		self.createCompositeGroupedBarChart = function(ndx, elementId, options){
			//options = options || defaultOptions;
			//options = defaultOptions;

			var dim = ndx.dimension(options.dimensionFunction)

			var reduce = self.helper.reduceGroup(options);
			var group = dim.group().reduce(reduce.add, reduce.remove, reduce.init);

			function selStack(i) {
				return function(d) {
					return d.value[i];
				};
			}

			function getMeasure(measureLabel) {
			    var a = options;
			    var groupedBarMeasure = options.groupedBars.find(function(v,i){
			         return  v.label === measureLabel;   
			    });
			    var lineSeriesMeasure = options.lineSeries.find(function(v,i){
					return  v.label === measureLabel;   
			   	});

			   	var measure = null;
			   	if(groupedBarMeasure && typeof groupedBarMeasure.measure === "string"){
				   measure = groupedBarMeasure.measure;
			  	}
				else if(lineSeriesMeasure && typeof lineSeriesMeasure.measure === "string"){
					measure = lineSeriesMeasure.measure;
				}

			   return measure;
			}			


			var xScale =  d3.scale.ordinal()
				.domain(['201611', '201612', '201701', '201702', '201703', '201704'])
				.rangePoints([100, 200]);

			var xScale = self.d3v3.scale.ordinal();

			// Composite chart
			var chart = self.dc.compositeChart("#" + elementId);
			chart
				.width(options.chartWidth)
				.height(options.chartHeight)
				.margins({ top: 20, right: 60, bottom: 60, left: 60 })
				.shareColors(true)
				.ordinalColors(self.helper.defaultColors)
				.controlsUseVisibility(false)
				.x(xScale)
				.xUnits(self.dc.units.ordinal)
				.elasticY(true)
				.brushOn(false)
				.legend(self.dc.legend().x(options.chartWidth - 230).y(10).itemHeight(13).gap(5))
				.renderHorizontalGridLines(true)
				.dimension(dim)
				.group(group, 'Dummy group to make ordinal composite charts work')
				.yAxisPadding(0.1)
				._rangeBandPadding(0.3)
				._outerRangeBandPadding(0)
				

				.shareTitle(false)
				.yAxisPadding(options.yAxisPadding | 0.1)

			// Bar chart
			var barChart = self.dc.barChart(chart);
			var i = 0
			barChart
				.width(options.chartWidth)
				.height(options.chartHeight)
				// .x(self.d3v3.scale.ordinal())
				.x(xScale)
				.xUnits(self.dc.units.ordinal)
				.brushOn(false)
				//.clipPadding(10)
				.title(function(d, arg2, arg3, arg4) {
					var measure = getMeasure(this.layer);
					var val = d.value[measure];
					var format = options.groupedBars.find(function(v){
					    return v.measure === measure;
					}).format;
					if(typeof format === "function"){
					    val = format(val);
					}
					return  this.layer + " - " + d.key + ": " + val;
				})
				.groupBars(true)
				.groupGap(10)
				.centerBar(true)
				.dimension(dim)
				.renderHorizontalGridLines(true)
				.controlsUseVisibility(false)
				.elasticY(true)
				.group(group, options.groupedBars[0].label, selStack(options.groupedBars[i].measure))

				options.groupedBars.forEach(function(v, i){
					// First chart stacked already
					if(i >= 1){
						barChart.stack(group, options.groupedBars[i].label, selStack(options.groupedBars[i].measure));
					}
				});

			var compositeCharts = [];
			compositeCharts.push(barChart);
			
			// Line charts
			if(options.lineSeries.length >= 1 ){
				var noBarCharts = options.groupedBars.length;
				options.lineSeries.forEach(function(v, j){
					var lineChart = self.dc.lineChart(chart)
						.useRightYAxis(true)
						.interpolate('cardinal')
						.xUnits(self.dc.units.ordinal)
						.x(xScale)
						.group(group, options.lineSeries[j].label)
						.valueAccessor(function (p, arg2) {
							return p.value[options.lineSeries[j].measure];
						})
						.title(function(d){
							var measure = getMeasure(this.layer);
							var val = d.value[measure];
							var format = options.lineSeries.find(function(v){
								return v.measure === measure;
							}).format;
							if(typeof format === "function"){
								val = format(val);
							}
							return  this.layer + " - " + d.key + ": " + val;

						})
					// Offset the line series so they align with the bars
					lineChart.on('pretransition', function(chart){
						// console.log("linechart - pretransition, j = " + j);
						var tickOffset = chart.x().rangeBand()/2;
						chart.g().attr("transform", "translate(" + tickOffset + ")");

					});

					compositeCharts.push(lineChart);
				});
			}


			chart.compose(compositeCharts);
			
			// Set the format functions on the y-axis
			if(typeof options.yAxisTickFormat === "function"){
				chart.yAxis().tickFormat(options.yAxisTickFormat)
			}
			if(typeof options.rightYAxisTickFormat === "function"){
				chart.rightYAxis().tickFormat(options.rightYAxisTickFormat)
				
			}
			// chart.rightYAxis().tickFormat(self.d3v3.format(".0%"));
			// chart.rightYAxis().tickFormat(self.d3v3.format(".0%"));
				
			// // Add reset filter event
			// chart.selectAll('.reset-filter').on('click', function() {
			// 	chart.filterAll();
			// 	self.dc.redrawAll();
			// });
			// // Rotate X-axis?
			// if(options.rotateXAxis){
			// 	chart.on('pretransition', self.helper.dcXaxisRotate);
			// }

			return(chart);
		}
        
    }

    return ChartCompositeGroupedBar;
});


