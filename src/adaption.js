//# dc.js Getting Started and How-To Guide
'use strict';

/* jshint globalstrict: true */
/* global dc,d3,crossfilter,colorbrewer */

// ### Create Chart Objects
// ## exempel på hur man sparar data från exempel https://dc-js.github.io/dc.js/examples/download-table.html
// Create chart objects associated with the container elements identified by the css selector.
// Note: It is often a good idea to have these objects accessible at the global scope so that they can be modified or
// filtered by other page controls.
//var yearlyBubbleChart = dc.bubbleChart('#yearly-bubble-chart');
var smallChart = dc.barChart('#small-chart');
var gainOrLossChart = dc.pieChart('#gain-loss-chart');
var quarterChart = dc.pieChart('#quarter-chart');
var dayOfWeekChart = dc.rowChart('#day-of-week-chart');
//var fluctuationChart = dc.barChart('#fluctuation-chart');
var select1 = dc.selectMenu('#select1');


//### Load your data
//d3.csv('ndx.csv', function (data) {
    // Since its a csv file we need to format the data a bit.
    var dateFormat = d3.time.format('%m/%d/%Y');
    var numberFormat = d3.format('.2f');

    data.forEach(function (d) {
        d.dd = dateFormat.parse(d.date);
        d.month = d3.time.month(d.dd); // pre-calculate month for better performance
        d.close = +d.close; // coerce to number
        d.open = +d.open;
    });

    //### Create Crossfilter Dimensions and Groups

    //See the [crossfilter API](https://github.com/square/crossfilter/wiki/API-Reference) for reference.
    var ndx = crossfilter(data);
    var all = ndx.groupAll();

    // Dimension by year
    var yearlyDimension = ndx.dimension(function (d) {
        return d3.time.year(d.dd).getFullYear();
    });
    // Maintain running tallies by year as filters are applied or removed
    var yearlyPerformanceGroup = yearlyDimension.group().reduce(
        /* callback for when data is added to the current filter results */
        function (p, v) {
            ++p.count;
            p.absGain += v.close - v.open;
            p.fluctuation += Math.abs(v.close - v.open);
            p.sumIndex += (v.open + v.close) / 2;
            p.avgIndex = p.sumIndex / p.count;
            p.percentageGain = p.avgIndex ? (p.absGain / p.avgIndex) * 100 : 0;
            p.fluctuationPercentage = p.avgIndex ? (p.fluctuation / p.avgIndex) * 100 : 0;
            return p;
        },
        /* callback for when data is removed from the current filter results */
        function (p, v) {
            --p.count;
            p.absGain -= v.close - v.open;
            p.fluctuation -= Math.abs(v.close - v.open);
            p.sumIndex -= (v.open + v.close) / 2;
            p.avgIndex = p.count ? p.sumIndex / p.count : 0;
            p.percentageGain = p.avgIndex ? (p.absGain / p.avgIndex) * 100 : 0;
            p.fluctuationPercentage = p.avgIndex ? (p.fluctuation / p.avgIndex) * 100 : 0;
            return p;
        },
        /* initialize p */
        function () {
            return {
                count: 0,
                absGain: 0,
                fluctuation: 0,
                fluctuationPercentage: 0,
                sumIndex: 0,
                avgIndex: 0,
                percentageGain: 0
            };
        }
    );

    // Dimension by full date
    var dateDimension = ndx.dimension(function (d) {
        return d.dd;
    });

    // Dimension by month
    var moveMonths = ndx.dimension(function (d) {
        return d.month;
    });
    // Group by total movement within month
    var monthlyMoveGroup = moveMonths.group().reduceSum(function (d) {
        return Math.abs(d.close - d.open);
    });
    // Group by total volume within move, and scale down result
    var volumeByMonthGroup = moveMonths.group().reduceSum(function (d) {
        return d.volume / 500000;
    });
    var indexAvgByMonthGroup = moveMonths.group().reduce(
        function (p, v) {
            ++p.days;
            p.total += (v.open + v.close) / 2;
            p.avg = Math.round(p.total / p.days);
            return p;
        },
        function (p, v) {
            --p.days;
            p.total -= (v.open + v.close) / 2;
            p.avg = p.days ? Math.round(p.total / p.days) : 0;
            return p;
        },
        function () {
            return {days: 0, total: 0, avg: 0};
        }
    );

    // Create categorical dimension
    var gainOrLoss = ndx.dimension(function (d) {
        return d.open > d.close ? 'Män' : 'Kvinnor';
    });
    // Produce counts records in the dimension
    var gainOrLossGroup = gainOrLoss.group();

    // Determine a histogram of percent changes
    var fluctuation = ndx.dimension(function (d) {
        return Math.round((d.close - d.open+100) / d.open * 100);
    });
    var fluctuationGroup = fluctuation.group();

    // Summarize volume by quarter
    var quarter = ndx.dimension(function (d) {
        var month = d.dd.getMonth();
        if (month <= 2) {
            return 'Q1';
        } else if (month > 2 && month <= 5) {
            return 'Q2';
        } else if (month > 5 && month <= 8) {
            return 'Q3';
        } else {
            return 'Q4';
        }
    });
    var quarterGroup = quarter.group().reduceSum(function (d) {
        return d.volume;
    });

    // Counts per weekday
    var dayOfWeek = ndx.dimension(function (d) {
        var day = d.dd.getDay();
        var name = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return day + '.' + name[day];
    });
    var dayOfWeekGroup = dayOfWeek.group();

    // -------------------------------- charts ------------------------------

    //### Define Chart Attributes
    // Define chart attributes using fluent methods. See the
    // [dc.js API Reference](https://github.com/dc-js/dc.js/blob/master/web/docs/api-latest.md) for more information
    //

    // #### Pie/Donut Charts

    // Create a pie chart and use the given css selector as anchor. You can also specify
    // an optional chart group for this chart to be scoped within. When a chart belongs
    // to a specific group then any interaction with such chart will only trigger redraw
    // on other charts within the same chart group.
    // <br>API: [Pie Chart](https://github.com/dc-js/dc.js/blob/master/web/docs/api-latest.md#pie-chart)

    gainOrLossChart /* dc.pieChart('#gain-loss-chart', 'chartGroup') */
    // (_optional_) define chart width, `default = 200`
        .width(180)
    // (optional) define chart height, `default = 200`
        .height(180)
    // Define pie radius
        .radius(80)
    // Set dimension
        .dimension(gainOrLoss)
    // Set group
        .group(gainOrLossGroup)
    // (_optional_) by default pie chart will use `group.key` as its label but you can overwrite it with a closure.
        .label(function (d) {
            if (gainOrLossChart.hasFilter() && !gainOrLossChart.hasFilter(d.key)) {
                return d.key + '(0%)';
            }
            var label = d.key;
            if (all.value()) {
                label += '(' + Math.floor(d.value / all.value() * 100) + '%)';
            }
            return label;
        })
    /*
        // (_optional_) whether chart should render labels, `default = true`
        .renderLabel(true)
        // (_optional_) if inner radius is used then a donut chart will be generated instead of pie chart
        .innerRadius(40)
        // (_optional_) define chart transition duration, `default = 350`
        .transitionDuration(500)
        // (_optional_) define color array for slices
        .colors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
        // (_optional_) define color domain to match your data domain if you want to bind data or color
        .colorDomain([-1750, 1644])
        // (_optional_) define color value accessor
        .colorAccessor(function(d, i){return d.value;})
        */;

    quarterChart /* dc.pieChart('#quarter-chart', 'chartGroup') */
        .width(180)
        .height(180)
        .radius(80)
        .innerRadius(30)
        .dimension(quarter)
        .group(quarterGroup);

    //#### Row Chart

    // Create a row chart and use the given css selector as anchor. You can also specify
    // an optional chart group for this chart to be scoped within. When a chart belongs
    // to a specific group then any interaction with such chart will only trigger redraw
    // on other charts within the same chart group.
    // <br>API: [Row Chart](https://github.com/dc-js/dc.js/blob/master/web/docs/api-latest.md#row-chart)
    dayOfWeekChart /* dc.rowChart('#day-of-week-chart', 'chartGroup') */
        .width(180)
        .height(180)
        .margins({top: 20, left: 10, right: 10, bottom: 20})
        .group(dayOfWeekGroup)
        .dimension(dayOfWeek)
        // Assign colors to each value in the x scale domain
        .ordinalColors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
        .label(function (d) {
            return d.key.split('.')[1];
        })
        // Title sets the row text
        .title(function (d) {
            return d.value;
        })
        .elasticX(true)
        .xAxis().ticks(4);

    //####  create selectmenu
    //yearDimension = ndx.dimension(function(d) { return d.letter; });
    //quarter.group()
    select1
        .dimension(quarter)
        .group(quarter.group())
        .multiple(true)
        .numberVisible(10)
        .controlsUseVisibility(true);

    // #### some fidgeting with a barchart
    // life saver many thanks https://github.com/dc-js/dc.js/wiki/FAQ#remove-empty-bins
    var smalldata = data.slice(6700)

    function remove_empty_bins(source_group) {
        return {
            all:function () {
                return source_group.all().filter(function(d) {
                    //return Math.abs(d.value) > 0.00001; // if using floating-point numbers
                    return d.value !== 0; // if integers only
                });
            }
        };
    }
    
    var fakeGroup = remove_empty_bins(fluctuationGroup);

    smallChart /* dc.barChart('#volume-month-chart', 'chartGroup') */
    .width(990)
    .height(180)
    .margins({top: 10, right: 50, bottom: 30, left: 40})
    .dimension(fluctuation)
    .group(fakeGroup)
    .elasticY(true)
    .elasticX(true)
    // (_optional_) whether bar should be center to its x value. Not needed for ordinal chart, `default=false`
    .centerBar(false)
    // (_optional_) set gap between bars manually in px, `default=2`
    .gap(6)
    // (_optional_) set filter brush rounding
    .round(dc.round.floor)
    .alwaysUseRounding(true)
    .x(d3.scale.ordinal())
    .colors(d3.scale.ordinal().domain(["positive","negative"])
                                .range(["#00FF00","#FF0000"]))
    .colorAccessor(function(d) { 
            if(d.key <0) 
                return "positive"
            return "negative";})
    .xUnits(dc.units.ordinal)
    .renderHorizontalGridLines(true)
    // Customize the filter displayed in the control span
    .filterPrinter(function (filters) {
        var filter = filters[0], s = '';
        s += numberFormat(filter[0]) + '% -> ' + numberFormat(filter[1]) + '%';
        return s;
    });

    //#### Rendering

    //simply call `.renderAll()` to render all charts on the page
    dc.renderAll();
    /*
    // Or you can render charts belonging to a specific chart group
    dc.renderAll('group');
    // Once rendered you can call `.redrawAll()` to update charts incrementally when the data
    // changes, without re-rendering everything
    dc.redrawAll();
    // Or you can choose to redraw only those charts associated with a specific chart group
    dc.redrawAll('group');
    */

//});





//#### Versions

//Determine the current version of dc with `dc.version`
d3.selectAll('#version').text(dc.version);

// Determine latest stable version in the repo via Github API
d3.json('https://api.github.com/repos/dc-js/dc.js/releases/latest', function (error, latestRelease) {
    /*jshint camelcase: false */
    /* jscs:disable */
    d3.selectAll('#latest').text(latestRelease.tag_name);
});
