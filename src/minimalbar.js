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
var select1 = dc.selectMenu('#select1');
var customerChart = dc.pieChart('#sex-chart');


//### Load your data
//d3.csv('ndx.csv', function (data) {
    // Since its a csv file we need to format the data a bit.
    var dateFormat = d3.time.format('%m/%d/%Y');
    var numberFormat = d3.format('.2f');

    data.forEach(function (d) {
        d.type = d.myndighet + ' ' + d.customer + d.measure + d.Ar + d.group
    });

    //### Create Crossfilter Dimensions and Groups

    //See the [crossfilter API](https://github.com/square/crossfilter/wiki/API-Reference) for reference.
    var ndx = crossfilter(data);

    // create two identical group one is "fake" for filtering twice on same dimension
    var dim1 = ndx.dimension(function (d) { return d["myndighet"]; })
    var grp1 = dim1.group().reduceSum(function (d) { return d["value"]; })
    var dim2 = ndx.dimension(function (d) { return d["myndighet"]; })
    var grp2 = dim2.group().reduceSum(function (d) { return d["value"]; })

    // grouping for caputring all bars
    var bardim = ndx.dimension(function (d) { return d["type"]; })
    var bargrp = bardim.group().reduceSum(function (d) { return d["value"]; })
    var bardim2 = ndx.dimension(function (d) { return d["type"]; })
    var bargrp2 = bardim2.group().reduceSum(function (d) { return d["value"]; })
    var all = ndx.groupAll();

    // Dimension by year
    //var myndighetDimension = ndx.dimension(function (d) {
    //});

    // Dimension by full date
    var customerDimension = ndx.dimension(function (d) {
        return d.customer;
    });

    // Produce counts records in the dimension
    var customerGroup = customerDimension.group();


    // Dimension by month
    //var moveMonths = ndx.dimension(function (d) {
    //    return d.month;
    //});
    // Group by total movement within month
    //var monthlyMoveGroup = moveMonths.group().reduceSum(function (d) {
    //    return Math.abs(d.close - d.value);
    //});
   

    // ---------------------------------- helpers --------------------------
     function dcXaxisRotate(chart){
        var xAxisMaxHeight = 0;
        chart.selectAll("g.axis.x text")
        //.style("text-anchor", "end")
        .style("text-anchor", "start")
        .attr("dx", "0.5em")
        // .attr("dy", ".15em")
        .attr("dy", "-0.5em")
        .attr("transform", function (d) {
            var coord = this.getBBox();
            var x = coord.x + (coord.width / 2),
            y = coord.y + (coord.height / 2);

            //console.log("coord.width = " + coord.width + ", coord.width * Math.sin(Math.PI/4) = " + coord.width * Math.sin(Math.PI/4) );
            xAxisMaxHeight = Math.max(xAxisMaxHeight, coord.width * Math.sin(Math.PI / 4))
            return "rotate(45)"
        });
    }
    // -------------------------------- charts -----------------------------

    // #### some fidgeting with a barchart
    // life saver many thanks https://github.com/dc-js/dc.js/wiki/FAQ#remove-empty-bins
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
    
    var fakegroup = remove_empty_bins(bargrp2);

    smallChart /* dc.barChart('#volume-month-chart', 'chartGroup') */
    .width(1500)
    .height(650)
    .margins({top: 10, right: 50, bottom: 240, left: 40})    
    .dimension(bardim)
    .group(fakegroup)
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
    .on('pretransition', dcXaxisRotate);
    // Customize the filter displayed in the control span

    // #### select list
    select1
    .dimension(dim2)
    .group(grp2)
    .multiple(true)
    .numberVisible(10)
    .controlsUseVisibility(true)
    .on('pretransition', dcXaxisRotate);


    // diagram of sexes
    customerChart /* dc.pieChart('#gain-loss-chart', 'chartGroup') */
    // (_optional_) define chart width, `default = 200`
        .width(180)
    // (optional) define chart height, `default = 200`
        .height(180)
    // Define pie radius
        .radius(80)
    // Set dimension
        .dimension(customerDimension)
    // Set group
        .group(customerGroup)
    // (_optional_) by default pie chart will use `group.key` as its label but you can overwrite it with a closure.
       /* .label(function (d) {
            if (gainOrLossChart.hasFilter() && !gainOrLossChart.hasFilter(d.key)) {
                return d.key + '(0%)';
            }
            var label = d.key;
            if (all.value()) {
                label += '(' + Math.floor(d.value / all.value() * 100) + '%)';
            }
            return label;
        })
*/
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
