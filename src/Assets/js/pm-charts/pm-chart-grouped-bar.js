"use strict";
define(["jquery", "helper",  "d3v3", "dc"], function (jq, helper, d3v3, dc) {
    function ChartGroupedBar() {
        console.log("ChartGroupedBar");
        var self = this;
        self.jq = jq;
        self.helper = new helper();
        self.dc = dc;
		self.d3v3 = d3v3;


		// ***********************************
		// Grouped Bar chart
		// ***********************************
		self.createGroupedBarChart = function(ndx, elementId, options){
			// options = options || defaultOptions;
			//options = defaultOptions;

			var dimQueue = ndx.dimension(options.dimensionFunction)

			var reduce = self.helper.reduceGroup(options);
			var sumQueue = dimQueue.group().reduce(reduce.add, reduce.remove, reduce.init);

			// function sel_stack(i) {
			// 	return function(d) {
			// 		return d.value[i];
			// 	};
			// }

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

			   	var measure = null;
			   	if(groupedBarMeasure && typeof groupedBarMeasure.measure === "string"){
				   measure = groupedBarMeasure.measure;
			  	}

			   return measure;
			}

			var chart = self.dc.barChart("#" + elementId);
			chart
				.width(options.chartWidth)
				.height(options.chartHeight)
				.x(self.d3v3.scale.ordinal())
				.xUnits(self.dc.units.ordinal)
				.margins({ top: 10, right: 10, bottom: 60, left: 60 })
				.brushOn(false)
				.clipPadding(100)
				._rangeBandPadding(0.3)
				.title(function(d) {
					// return  this.layer + " - " + d.key + ": " + d.value[this.layer];
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
				// .groupGap(10)
				.centerBar(true)
				.dimension(dimQueue)
				.renderHorizontalGridLines(true)
				.controlsUseVisibility(false)
				.elasticY(true)
				.legend(self.dc.legend().x(options.chartWidth - 230).y(10).itemHeight(13).gap(5))
				.ordinalColors(self.helper.defaultColors)
				.group(sumQueue, options.groupedBars[0].label, selStack(options.groupedBars[0].measure));

				for(var i = 1; i < options.groupedBars.length; i++){
					chart.stack(sumQueue, options.groupedBars[i].label, selStack(options.groupedBars[i].measure));
				}
			
			// Add reset filter event
			chart.selectAll('.reset-filter').on('click', function() {
				chart.filterAll();
				self.dc.redrawAll();
			});
			// Rotate X-axis?
			if(options.rotateXAxis){
				chart.on('pretransition', self.helper.dcXaxisRotate);
			}

			return(chart);
		}
        
    }

    return ChartGroupedBar;
});


