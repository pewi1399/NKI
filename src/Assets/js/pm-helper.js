"use strict";
define(["jquery", "d3v3"], function (jq, d3v3) {
    function PmHelper() {
        var self = this;
        self.d3v3 = d3v3;
        //console.log("KvalitHelper");

        self.getUrlParameterByName = function (name) {
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"), results = regex.exec(location.search);
            return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        };

        self.replaceAll = function (str, find, replace) {
            var reg;
            if (Array.isArray(find)) {
                find.forEach(function (v) {
                    str = str.split(v).join(replace);
                });
            }
            else {
                str = str.split(find).join(replace);
            }

            return str;
        };

        self.pollyFillGlobalDefaults = function(){

            // Console-polyfill. MIT license.
            // https://github.com/paulmillr/console-polyfill
            // Make it safe to do console.log() always.
            (function(global) {
            'use strict';
            if (!global.console) {
                global.console = {};
            }
            var con = global.console;
            var prop, method;
            var dummy = function() {};
            var properties = ['memory'];
            var methods = ('assert,clear,count,debug,dir,dirxml,error,exception,group,' +
                'groupCollapsed,groupEnd,info,log,markTimeline,profile,profiles,profileEnd,' +
                'show,table,time,timeEnd,timeline,timelineEnd,timeStamp,trace,warn').split(',');
            while (prop = properties.pop()) if (!con[prop]) con[prop] = {};
            while (method = methods.pop()) if (!con[method]) con[method] = dummy;
            // Using `this` for web workers & supports Browserify / Webpack.
			})(typeof window === 'undefined' ? this : window); 
			
			
			self.pollyFillArrays();

//             console.log("pollyFillGlobalDefaults - done");
		}
		
        self.pollyFillArrays = function(){


			if (!Array.prototype.find) {
				Object.defineProperty(Array.prototype, 'find', {
				  value: function(predicate) {
				   // 1. Let O be ? ToObject(this value).
					if (this == null) {
					  throw new TypeError('"this" is null or not defined');
					}
			  
					var o = Object(this);
			  
					// 2. Let len be ? ToLength(? Get(O, "length")).
					var len = o.length >>> 0;
			  
					// 3. If IsCallable(predicate) is false, throw a TypeError exception.
					if (typeof predicate !== 'function') {
					  throw new TypeError('predicate must be a function');
					}
			  
					// 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
					var thisArg = arguments[1];
			  
					// 5. Let k be 0.
					var k = 0;
			  
					// 6. Repeat, while k < len
					while (k < len) {
					  // a. Let Pk be ! ToString(k).
					  // b. Let kValue be ? Get(O, Pk).
					  // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
					  // d. If testResult is true, return kValue.
					  var kValue = o[k];
					  if (predicate.call(thisArg, kValue, k, o)) {
						return kValue;
					  }
					  // e. Increase k by 1.
					  k++;
					}
			  
					// 7. Return undefined.
					return undefined;
				  }
				});
			  }			

		}		

        // Returns the sum of the attributes of the object that is specified in the provided array.
        self.sumObjAttr = function(obj, arr){
            var sum = arr.reduce(function(sum, v, arg3, arr){
                if(v.indexOf('-') === 0){
                    return sum - obj[v.replace('-','')];
                }
                else{
                    return sum + obj[v];
                }
            }, 0);
            return sum;
        }

        self.getBrowserInfo = function() {
            var ua = navigator.userAgent, tem, M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
            if (/trident/i.test(M[1])) {
                tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
                //return { name: 'IE ', version: (tem[1] || '') };
                return { name: 'IE', version: (tem[1] || '') };
            }
            if (M[1] === 'Chrome') {
                tem = ua.match(/\bOPR\/(\d+)/)
                if (tem != null) { return { name: 'Opera', version: tem[1] }; }
            }
            M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
            if ((tem = ua.match(/version\/(\d+)/i)) != null) { M.splice(1, 1, tem[1]); }
            return {
                name: M[0],
                version: M[1]
            };
        }


		// Function to reduce a group with variable number of measures. 
		// basicMeasures are only straight forward summations and ratioMeasures are ratios of the basicMeasures.
		self.reduceGroup = function(options){
            //console.log("reduce");
			options = options || {
				basicMeasures: ["incomingCalls", "answeredCallsWithin3Min", "answeredCallsWithin5Min", "lostCalls3Min", "lostCalls5Min", "answeredCallsInclCallback3Min", "answeredCallsInclCallback5Min"],
				ratioMeasures:[
					{
						name: "serviceLevel3Min",
						label: "Servicenivå 3min",
						numerators: ["answeredCallsWithin3Min", "lostCalls3Min"],
						denominators: ["answeredCallsInclCallback3Min"]
					},
					{
						name: "serviceLevel5Min",
						label: "Servicenivå 5min",
						numerators: ["answeredCallsWithin5Min", "lostCalls5Min"],
						denominators: ["answeredCallsInclCallback5Min"]
					}
				]
			}
			var reduce = {
				// Add values to the sum
				add: function(p, v) {
					++p.count;
					// Add values to basicMeasures
					for(var i = 0; i < options.basicMeasures.length; i++){
						p[options.basicMeasures[i]] += v[options.basicMeasures[i]];
					}
					// Add values to ratioMeasures
					for(var i = 0; i < options.ratioMeasures.length; i++){
					    var nums = options.ratioMeasures[i].numerators;
					    var denoms = options.ratioMeasures[i].denominators;

						var num = self.sumObjAttr(p, nums);
						var denom = typeof denoms !== "undefined" ? self.sumObjAttr(p, denoms) : 1;
						var ratio = denom != 0 ? num/denom : 0;
						p[options.ratioMeasures[i].name] = ratio;
					}
					return p;
				},
				// Remove values from the sum
				remove: function(p, v) {
					--p.count;
					//  Remove values for basicMeasures
					for(var i = 0; i < options.basicMeasures.length; i++){
						p[options.basicMeasures[i]] -= v[options.basicMeasures[i]];
					}
					// Remove values for ratioMeasures
					for(var i = 0; i < options.ratioMeasures.length; i++){
					    var nums = options.ratioMeasures[i].numerators;
					    var denoms = options.ratioMeasures[i].denominators;

						var num = self.sumObjAttr(p, nums);
						var denom = typeof denoms !== "undefined" ? self.sumObjAttr(p, denoms) : 1;
						var ratio = denom != 0 ? num/denom : 0;
						p[options.ratioMeasures[i].name] = ratio;
					}					
					return p;
				},
				// Initialize the sum
				init: function() {
					// Initialize empty object with a row count
					var ret = {};
					ret.count = 0;
					// Initialize basicMeasures
					for(var i = 0; i < options.basicMeasures.length; i++){
						ret[options.basicMeasures[i]] = 0;
					}
					// Initialize ratioMeasures
					for(var i = 0; i < options.ratioMeasures.length; i++){
						ret[options.ratioMeasures[i].name] = 0;
					}					
					return ret;
				}
			};

			return reduce;
		}

        self.d3SweFormater = self.d3v3.locale({
            "decimal": ",",
            "thousands": " ",
            "grouping": [3],
            "currency": ["", "SEK"],
            "dateTime": "%a %b %e %X %Y",
            "date": "%Y-%m-%d",
            "time": "%H:%M:%S",
            "periods": ["AM", "PM"],
            "days": ["Söndag", "Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag"],
            "shortDays": ["Sön", "Mån", "Tis", "Ons", "Tor", "Fre", "Lö"],
            "months": ["Januari", "Februari", "Mars", "April", "Mai", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"],
            "shortMonths": ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"]
		});
		
		self.defaultColors = ["#ffb70f", "#e34912", "#c42695", "#5eb0e6", "#afa500", "#000000", "#ac1a2f", "#ef8200", "#d53044"];


		self.dcXaxisRotate = function(chart){
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
					return "rotate(90)"
				});

				chart.selectAll("svg")
				//.attr("height", function (d) {
				//    var height = self.chartHeight + xAxisMaxHeight;
				//    return height;
				//});
				// .style("padding-bottom", function (d) {
				// 	var height = xAxisMaxHeight;
				// 	return height + "px";
				// });			
		}        


    }

    return PmHelper;
});