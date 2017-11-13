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
var customerChart = dc.pieChart('#customer-chart');
var yearChart = dc.pieChart('#year-chart');
var segmentChart = dc.pieChart('#segment-chart');
var questionSelect = dc.selectMenu('#question-select');
var nkiCount = dc.dataCount('.dc-data-count');


//### Load your data
//d3.csv('ndx.csv', function (data) {
    // Since its a csv file we need to format the data a bit.
    var dateFormat = d3.time.format('%m/%d/%Y');
    var numberFormat = d3.format('.2f');

    data.forEach(function (d) {
        d.type = d.measure + ' ' + d.myndighet + ' ' + d.customer + ' ' + d.group + ' ' + d.Ar
    });

    //### Create Crossfilter Dimensions and Groups

    //See the [crossfilter API](https://github.com/square/crossfilter/wiki/API-Reference) for reference.
    var ndx = crossfilter(data);

    // group for myndighet select 
    var myndighetDimension = ndx.dimension(function (d) { return d["myndighet"]; })
    var myndighetGroup = myndighetDimension.group().reduceSum(function (d) { return d["value"]; })

    // group for question select 
    var questionDimension = ndx.dimension(function (d) { return d["measure"]; })
    var questionGroup = questionDimension.group().reduceSum(function (d) { return d["value"]; })

    // group for year pie 
    var yearDimension = ndx.dimension(function (d) { return d["Ar"]; })
    var yearGroup = yearDimension.group().reduceSum(function (d) { return d["value"]; })

    // group for segment pie 
    var segmentDimension = ndx.dimension(function (d) { return d["group"]; })
    var segmentGroup = segmentDimension.group().reduceSum(function (d) { return d["value"]; })

    // grouping for caputring all bars including fakedim for redrawing x-scale
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

    var customerGroup = customerDimension.group()/*.reduce(        
        function (p, v) {
            p.grp = v.myndighet;
            return p;
        },
        // callback for when data is removed from the current filter results 
        function (p, v) {
            p.grp = v.myndighet
            return p;
        },
        // initialize p 
        function () {
            return {
                grp: 0
            };
        }
    );
*/

//    customerDimension.filterExact("Sparare")

    // Produce counts records in the dimension
    //var customerGroup = customerDimension.group();

    // set default filters
    customerDimension.filterExact("Sparare")
    myndighetDimension.filterExact("Pensionsmyndigheten")
    yearDimension.filterExact(2015)
    questionDimension.filterExact("Förtroende för")
    //segmentDimension.filterExact("Total")

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
        .attr("dy", "-0.0em")
        .attr("transform", function (d) {
            var coord = this.getBBox();
            var x = coord.x + (coord.width / 2),
            y = coord.y + (coord.height / 2);

            //console.log("coord.width = " + coord.width + ", coord.width * Math.sin(Math.PI/4) = " + coord.width * Math.sin(Math.PI/4) );
            xAxisMaxHeight = Math.max(xAxisMaxHeight, coord.width * Math.sin(Math.PI / 4))
            return "rotate(45)"
        });

        if(chart.data()[0].values.length > 80){
        chart.selectAll("g.axis.x text")
        .attr("fill", "white")
        } else {
        chart.selectAll("g.axis.x text")
        .attr("fill", "black")  
        }
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
    .width(1200)
    .height(650)
    .margins({top: 10, right: 190, bottom: 240, left: 40})    
    .dimension(bardim)
    .group(fakegroup)
    .y(d3.scale.linear().domain([0, 100]))
    //.elasticY(true)
    .elasticX(true)
    // (_optional_) whether bar should be center to its x value. Not needed for ordinal chart, `default=false`
    .centerBar(false)
    // (_optional_) set gap between bars manually in px, `default=2`
    .gap(6)
    // (_optional_) set filter brush rounding
    .round(dc.round.floor)
    .alwaysUseRounding(true)
    .x(d3.scale.ordinal())
    .colors(d3.scale.ordinal().domain(["one","two", "three", "four", "five"])
                                .range(["#a3192d ","#cc4202", "#f18700", "#f9c142", "#afa500"]))
    .colorAccessor(function(d) {

            if(d.value < 20){
                return "one";
            } else if (d.value < 40){
                return "two";
            } else if (d.value < 60){
                return "three";
            } else if (d.value < 80){
                return "four";
            } else  {
                return "five";
            }
        })
    .xUnits(dc.units.ordinal)
    .renderHorizontalGridLines(true)
    .on('pretransition', dcXaxisRotate);

    // ordna bars utefter 
    smallChart.ordering(function(d) { return -d.value; });

    // #### select list
    select1
    .dimension(myndighetDimension)
    .group(myndighetGroup)
    .multiple(true)
    .numberVisible(10)
    .controlsUseVisibility(true);

    // #### question select
    questionSelect
    .dimension(questionDimension)
    .group(questionGroup)
    .multiple(true)
    .numberVisible(10)
    .controlsUseVisibility(true);


function controlChart(chart, dimension, group){

    // diagram of sexes
    chart /* dc.pieChart('#gain-loss-chart', 'chartGroup') */
    // (_optional_) define chart width, `default = 200`
        .width(180)
    // (optional) define chart height, `default = 200`
        .height(180)
    // Define pie radius
        .radius(80)
    // Set dimension
        .dimension(dimension)
    // Set group
        .group(group)
        .colors(d3.scale.ordinal().domain(["one"])
                                .range(["#cc4202"]))
        .colorAccessor(function() {
                    return "one";
            })
        /*.keyAccessor(function (p) {
            return p.key;
        })
        .valueAccessor(function (p) {
            return p.value;
        })
*/
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

}

controlChart(customerChart, customerDimension, customerGroup)
controlChart(yearChart, yearDimension, yearGroup)
controlChart(segmentChart, segmentDimension, segmentGroup)


nkiCount /* dc.dataCount('.dc-data-count', 'chartGroup'); */
    .dimension(ndx)
    .group(all)
    // (_optional_) `.html` sets different html when some records or all records are selected.
    // `.html` replaces everything in the anchor with the html given using the following function.
    // `%filter-count` and `%total-count` are replaced with the values obtained.
    .html({
        some: 'Klicka på figurerna nedan för att applicera filter. För närvarande är <strong>%filter-count</strong> av totalt <strong>%total-count</strong> mått valda' +
            ' | <a href=\'javascript:dc.filterAll(); dc.renderAll();\'>Återställ alla filter</a>',
        all: 'Alla tillgängliga mätvärden valda. Klicka på någon av figurerna för att filtrera.'
    });



    //#### Rendering

        // set default filters
    customerDimension.filterExact("Sparare")
    myndighetDimension.filterExact("Pensionsmyndigheten")
    yearDimension.filterExact(2015)
    questionDimension.filterExact("Förtroende för")

    // change rendering to only key not total
    select1.title(function (d){

        return d.key;
    })

    questionSelect.title(function (d){

        return d.key;
    })

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

// önskelista

// om  smallChart.data()[0].values.length > 70 skriv inte ut någon underskrift på x axeln
// markera de defaultfilter som sätts från start
// Gör färg beroende på isntitution snarare än 