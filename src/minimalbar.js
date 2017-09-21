//# dc.js Getting Started and How-To Guide
'use strict';

/* jshint globalstrict: true */
/* global dc,d3,crossfilter,colorbrewer */

// ### Create Chart Objects
// ## exempel på hur man sparar data från exempel https://dc-js.github.io/dc.js/examples/download-table.html
// Create chart objects associated with the container elements identified by the css selector.
// Note: It is often a good idea to have these objects accessible at the global scope so that they can be modified or
// filtered by other page controls.
var smallChart = dc.barChart('#small-chart');


//### Load your data
//d3.csv('ndx.csv', function (data) {
    // Since its a csv file we need to format the data a bit.
    var dateFormat = d3.time.format('%m/%d/%Y');
    var numberFormat = d3.format('.2f');

    data.forEach(function (d) {
        d.type = d.actor+d.sex
    });

    //### Create Crossfilter Dimensions and Groups

    //See the [crossfilter API](https://github.com/square/crossfilter/wiki/API-Reference) for reference.
    var ndx = crossfilter(data);
    var dim = ndx.dimension(function (d) { return d["type"]; })
    var grp = dim.group().reduceSum(function (d) { return d["open"]; })
    var all = ndx.groupAll();

    // Dimension by year
    //var actorDimension = ndx.dimension(function (d) {
    //});

    // Dimension by full date
    var sexDimension = ndx.dimension(function (d) {
        return d.sex;
    });

    // Dimension by month
    //var moveMonths = ndx.dimension(function (d) {
    //    return d.month;
    //});
    // Group by total movement within month
    //var monthlyMoveGroup = moveMonths.group().reduceSum(function (d) {
    //    return Math.abs(d.close - d.open);
    //});
   

    // -------------------------------- charts -----------------------------

    // #### some fidgeting with a barchart
    // life saver many thanks https://github.com/dc-js/dc.js/wiki/FAQ#remove-empty-bins

    smallChart /* dc.barChart('#volume-month-chart', 'chartGroup') */
    .width(990)
    .height(180)
    .margins({top: 10, right: 50, bottom: 30, left: 40})
    .dimension(dim)
    .group(grp)
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
    .renderHorizontalGridLines(true);
    // Customize the filter displayed in the control span

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
