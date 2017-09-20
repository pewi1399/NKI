"use strict";
define(["charts/pm-chart-grouped-bar", "charts/pm-chart-composite-grouped-bar", "charts/pm-chart-table"], function (ChartGroupedBar, ChartCompositeGroupedBar, ChartTable) {
    function PmCharts() {
		//console.log("PmCharts");
        var self = this;

        var chartCompositeGroupedBar = new ChartCompositeGroupedBar();
		self.createCompositeGroupedBarChart = chartCompositeGroupedBar.createCompositeGroupedBarChart;
		
        var chartGroupedBar = new ChartGroupedBar();
		self.createGroupedBarChart = chartGroupedBar.createGroupedBarChart;

		var chartTable = new ChartTable()
		self.createTableChart = chartTable.createTableChart;

        
    }

    return PmCharts;
});


