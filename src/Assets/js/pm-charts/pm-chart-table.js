"use strict";
define(["jquery", "helper",  "d3v3", "dc"], function (jq, helper, d3v3, dc) {
    function ChartTable() {
        console.log("ChartTable");
        var self = this;
        self.jq = jq;
        self.helper = new helper();
        self.dc = dc;
		self.d3v3 = d3v3;


		// ***********************************
		// Table chart
		// ***********************************		
		self.createTableChart = function(elementId, ndx, options, periodLabels){
			//console.log("createTableChart");
			// Create the dimensions
			var dimQueue = ndx.dimension(function(d) {
				return d.queue;
			});
			var dimPeriod = ndx.dimension(function(d) {
				return d.periodKey;
			});
			var dimDummy = ndx.dimension(function(d) {
				return 1;
			});

			// Create the groupings
			var reduce = self.helper.reduceGroup(options);
			var sumQueue = dimQueue.group().reduce(reduce.add, reduce.remove, reduce.init);
			var sumQueueAll = dimQueue.group().reduce(reduce.add, reduce.remove, reduce.init);
			var sumPeriod = dimPeriod.group().reduce(reduce.add, reduce.remove, reduce.init);
			var sumPeriodAll = dimPeriod.group().reduce(reduce.add, reduce.remove, reduce.init);
			var sumDummy = dimDummy.group().reduce(reduce.add, reduce.remove, reduce.init);

			var periods = [];

			// ***** Rows *******
			// Create the rows, introduce level, where the measures has level 0 and the queues level 1 
			var rows = [];
			var queues = dimQueue.group().all().map(function(v){return {key: v.key}});
			options.rowGroups.forEach(function(v, i){
				// Start with a main row for the measure
				rows.push({
					measureKey: v.measure,
                    measureLabel: v.label,
					measureFormat: v.format,
					queueKey:"Samtliga",
					//value: dimQueue.groupAll().reduce(sum.add, sum.remove, sum.init).value()[v.key], 
					level: 0
				});
				// Then one detail row for each queue
				queues.forEach(function(w, j){
					rows.push({
						measureKey: v.measure,
						measureLabel: v.label,
						measureFormat: v.format,
						queueKey: w.key,
						//value: w.value[v.key],
						level: 1
					});
				});
			});

			// ***** Columns *******							
			// Create the colums, start with the first column containig measure and queue name
			var columns = [
                {
					"key": "Kö", 
				    "title": "Mätvärde/Kö",
					"className": "col-queues",
					"orderable": false,
                    "render": function(data, type, row, meta){
                        var label;
                        if(type === "sort"){
                            return 0;
                        }
                        if(row.queueKey === "Samtliga"){
                            label = row.measureLabel;
                        }
                        else{
                            label = row.queueKey;
                        }
                        return label;
                    }
			}];
			// Create four (not yet) columns for each period, current, prev, diff and diff rel.
			sumPeriod.all().forEach(function(v) {
                var a = periodLabels;
                var periodInfo = periodLabels.find(function(w){
                    return w.key === v.key;
				});
				
				var createColumnObj = function(colKey, colTitle, measureKeySuffix, visible){
					return{
						"key": colKey,
						"title": colTitle,
						"orderable": false,
						"visible": visible,
						"render": function(data, type, row, meta){
							if(row.queueKey === "Samtliga"){
								dimQueue.filterAll();
							}
							else{
								dimQueue.filterExact(row.queueKey);
							}
							dimPeriod.filterExact(v.key);
							var format = row.measureFormat;
							var measure = row.measureKey + measureKeySuffix;
							var val = sumDummy.top(1)[0].value[measure];
							if(typeof row.measureFormat === "function"){
								val = row.measureFormat(val);
							}
							return val;
						}
					}
				}

				//Current period
				columns.push(createColumnObj(v.key, periodInfo.label, "", true));
				//Previus period
				columns.push(createColumnObj(v.key, periodInfo.labelPrev, "Prev", false));
				// Diff between current and previus period
				columns.push(createColumnObj(v.key, "Förändring", "Diff", false));
			});


			// Check if a table is already initialized, then destroy it
			if ($.fn.DataTable.isDataTable("#" + elementId)) {
				self.jq("#" + elementId).DataTable().destroy();
				self.jq("#" + elementId).empty();
			}	

			// Render the table
			var table = self.jq("#" + elementId).DataTable({
				"data": rows,
				"destroy": true,
				"columns": columns,
				"paging": false,
				"searching": false,
				"createdRow": function (row, data, index){
					if(data.level == 0){
						self.jq(row).addClass("row-group");
						self.jq(row).find('td:first-child').wrapInner('<span class="row-group-text"></span>');
						self.jq(row).find('td:first-child').prepend('<span class="expand-button" aria-hidden="true"></span>');
					}
					else{
					    self.jq(row).addClass("row-detail");
					}
				}
			});
			
			// Wire upp the expand buttons
			self.jq("#" + elementId).find('tbody').on('click', '.expand-button', function(evt, arg2, arg3){
				//console.log("self.jq(\"#\" + elementId).on('click', '.row-expand'....");
				self.jq(evt.target).closest('tr').toggleClass('expanded');
				self.jq(evt.target).closest('tr').nextUntil('.row-group').toggleClass('expanded');
			});

			// Wire upp the detail button
			self.jq("#main-table-detail-toggle").off('click');
			self.jq("#main-table-detail-toggle").on('click', function(evt, arg2, arg3){
				console.log("self.jq(\"#main-table-detail-toggle\").on('click', function(evt, arg2, arg3)");
				self.jq(evt.target).closest('#main-table-detail-toggle').toggleClass('expanded');
				var hideCols = !self.jq(evt.target).closest('#main-table-detail-toggle').hasClass('expanded');
				
				self.jq('#main-table').toggleClass('show-details');
				var visCols = table.columns().visible();
                
                var visibleColumns = [];
                var hiddenColumns = [];
                for (var i = 0; i < visCols.length; i++) {
                    if (hideCols && (i !== 0) && (i % 3 != 1) ) {
                        hiddenColumns.push(i);
                    }
                    else {
                        visibleColumns.push(i);
                    }
                }
                table.columns(hiddenColumns).visible(false, false);
                table.columns(visibleColumns).visible(true, false);
                table.columns.adjust().draw(false);
                
			});			
			
			return table;
		}
        
    }

    return ChartTable;
});


