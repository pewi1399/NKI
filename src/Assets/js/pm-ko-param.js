(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(["jquery", "knockout","config", "helper",  "connector"], factory);
	} else {
		// Browser globals
		factory(jq, ko, helper, connector);
	}
}(this, function (jq, ko, config, helper, connector) {
	// console.log("pm-ko-param");
	var defaults = { 
		multiSelect: false
	};

	// *****************************************************
	// ************ START OF VIEW MODEL ********************
	
	// Constructor for pmParam, options on the form {query: "", values: [], getDataOnInit: false}.
	// query: MDX-query to get parameter values.
	// values: initial parameter values (on the form {label:"År", value: "[Kalender].[Kalender].[År]", selected: true}).
	// getDataOnInit: should the query be executed on initialization.
	ko.pmParam = function (options){
		var self = this;

		// *** public properties ***
		self.options = options || {label:"Pm param", webServiceAdress: null, ssasServer: null, ssasDatabase: null, query: "", values: [], getDataOnInit: false, dependencies: [{param: null, value: null, replaceFunc: null}]}
		self.label = options.label || "Pm param";
		self.query = self.options.query || "";
		self.selectedLabels = ko.observable(""),
		self.selectedValues = ko.observableArray(),
		self.values = ko.observableArray();
		self.dependencies = options.dependencies;
		self.state = {loading: ko.observable(true), open: ko.observable(false)};
		// **************************


		// *** private properties ***
		self._config =  new config();
		self._connector = new connector(options.webServiceAdress || self._config.webServiceAdress);
		self._helper = new helper();
		// ******************************
		
		// Add values that are proviced att init.
		if(typeof self.options.values !== "undefined" && self.options.values.length > 0){
			self.addValues(self.options.values);
		}

		// Check if the parameter has dependencies, in that case subscribe to them.
		// Otherwise and if getDataOnInit = true run get the parametervalues from the data source immediately.
		if(typeof self.dependencies !== "undefined" && self.dependencies !== null){
			// Create a computed that will return the query.
			var depQuery = ko.pureComputed(function(){
				var query = self.query;
				// Iterate over all dependent parameters.
				for(var i = 0; i < self.dependencies.length; i++){
					var depParam = self.dependencies[i].param;
					var depParamVal = ko.unwrap( self.dependencies[i].value).join(', ');
					// Check if a custom replace function was provided then run that, 
					// otherwise if replace all param placeholders with the value from the dependen parameter.
					if(typeof self.dependencies[i].replaceFunc !== "undefined"){
						query = self.dependencies[i].replaceFunc(query, depParam, depParamVal);
					}
					else{
						query = self._helper.replaceAll(query, depParam, depParamVal);
					}
				}
				return query;
			});

			// Subscribe to the computed query created earlier.
			// And when it is updated get the parameter values from the data source.
			depQuery.extend({ rateLimit: 500 }).subscribe(function(query){
				self.getData(query);
			}, self, "change");
			
		}
		else if(self.options.getDataOnInit){
			self.getData(self.query);
		}
		else{
			self.state.loading(false);
		}

		return self;
	}

	// Add values to the values array 
	// A value should be an object the form: {label:"År", value: "[Kalender].[Kalender].[År]", selected: ko.observable(true)}
	ko.pmParam.prototype.addValues = function(values){
        var newValues = [];
        values.forEach(function(v, i){
            var newValue = {};
            newValue.label = v.label || "";
			newValue.value = v.value || "";
			newValue.key = v.key || "";
			newValue.level = v.level || 0;
            if(typeof v.selected === "boolean"){
                newValue.selected = ko.observable(v.selected);
            }
            else if(typeof v.selected === "function" && typeof v.selected.name === "string" &&  v.selected.name === "observable"){
                newValue.selected = v.selected;
            }
            else{
                newValue.selected = ko.observable(false);
            }
            newValues.push(newValue);


		});
		ko.utils.arrayPushAll(this.values, newValues);
		this.values.valueHasMutated();
	};

	// Get the parameter values data from the data source,
	// parse the data and load the parameter values.
	ko.pmParam.prototype.getData = function(query){
		var self = this;
		var query = query || this.query;
		var ssasServer = this.options.ssasServer || this._config.defaultSsasServer;
		var ssasDatabase = this.options.ssasDatabase;

		self.state.loading(true);

		this._connector.runMdxQuery(ssasServer, ssasDatabase, query)
		.then(function (stringData) {
			var data = JSON.parse(stringData);
			var values = self.parseData(data);
			self.values.removeAll();
			self.addValues(values);
			self.values()[0].selected(true);

			// for debuging
			if(self.label == "Kalender"){
				self.values()[1].selected(true);
				self.values()[2].selected(true);
				self.values()[3].selected(true);
				self.values()[4].selected(true);
				self.values()[5].selected(true);
				//self.values()[3].selected(true);

			}
			self.state.loading(false);
		});

		

	}

	// Parse the data recieved from the data source.
	ko.pmParam.prototype.parseData = function(data){
			var paramValues = data.map(function(v, i){
				return{
					label: v["[Measures].[ParameterCaption]"],
					value: v["[Measures].[ParameterValue]"],
					key: v["[Measures].[ParameterKey]"],
					level: v["[Measures].[ParameterLevel]"],
					selected: false
				}
			});
			return paramValues;		
	}
	// ************ END OF VIEW MODEL ********************
	// ***************************************************

	// ***************************************************
	// ********** START OF KO BINDINGS********************

	// Use the native template engine to add the template to the dom.
    var templateEngine = new ko.nativeTemplateEngine();
    templateEngine.addTemplate = function(templateName, templateMarkup) {
    	if(typeof window === 'undefined' || window.closed){
	        document.write("<script type='text/html' id='" + templateName + "'>" + templateMarkup + "<" + "/script>");
    	}
    	else{
	        document.head.insertAdjacentHTML("beforeend", "<script type='text/html' id='" + templateName + "'>" + templateMarkup + "<" + "/script>");
    	}
	};
	
	// Template used to render the parameter
	templateEngine.addTemplate("ko_pm_param", "\
						<div class=\"\" data-bind=\"css: {loading: state.loading(), open: state.open()}\">\
							<a href=\"#\"  data-bind=\"click: clickParam\" class=\"dropdown-toggle\" data-toggle=\"dropdown_\">\
							<div class=\"pm-param-label-wrapper\">\
								<span class=\"pm-param-param-label\" data-bind=\"text: label\"></span>\
								<span class=\"pm-param-selected-labels\" data-bind=\"text: selectedLabels\"></span>\
							</div>\
							<button class=\"pm-param-expand-btn\">\
								<span class=\"pm-param-expand-btn-icon\"></span>\
								<span class=\"pm-param-expand-visibility-hidden\">Expandera submeny</span>\
							</button>\
							</a>\
							<div class=\"dropdown-menu\">\
								<ul class=\"pm-param-value-list\" data-bind=\"foreach: values\">\
									<li class=\"\" data-bind=\"click: $root.clickParamValue, css: {selected: selected(), level0: level == 0, level1: level == 1, level2: level == 2, level3: level == 3, level4: level == 4, level5: level == 5, level6: level == 6 }\">\
										<span data-bind=\"text: label\"></span>\
										<span class=\"glyphicon glyphicon-ok check-mark\"></span>\
									</li>\
								</ul>\
							</div>\
							<div class=\"param-value-overlay\"></div>\
						</div>");

	// Called when param value clicked. Sets selected true/false for each value 
	// and values for the selectedLabels and selectedValues
	function clickParam(paramModel, param, evt, arg3, arg4){
		//console.log("pm-ko-param -> clickParam()")
		paramModel.state.open(!paramModel.state.open());
	}
						
	// Called when param value clicked. Sets selected true/false for each value 
	// and values for the selectedLabels and selectedValues
	function clickParamValue(paramModel, param, evt, arg3, arg4){
		changeParamValue(paramModel, param);
	}

	// Update the selected status/value of each individual parameter value 
	function changeParamValue(paramModel, param){
		// is multiSelect
		if(paramModel.multiSelect){
			var isSelected = param.selected();
			param.selected(!isSelected);

		}
		// is not multiSelect
		else{
			paramModel.values().forEach(function(v, i, arr){
				if(v.value === param.value && !param.selected()){
					param.selected(true);
				}
				else if(v.value !== param.value && v.selected()){
					v.selected(false);
				}
			});
			
		}
		//setSelectedLabelsAndValues(paramModel);
	}
	
	// Set the values for the parameters selectedLabels and selectedValues attributes,
	// selectedLabels is a string and selectedValues an array (both observables).
	function setSelectedLabelsAndValues(paramModel){
		var	newSelectedLabels = [],
			newSelectedValues = [];
		for(var i = 0; i < paramModel.values().length; i++){
			if(paramModel.values()[i].selected()){
				newSelectedLabels.push(paramModel.values()[i].label);
				newSelectedValues.push(paramModel.values()[i].value);
			}
		}

		if(newSelectedLabels.join(", ") !== paramModel.selectedLabels()){
			paramModel.selectedLabels(newSelectedLabels.join(", "));
		}

		if(newSelectedValues.join(", ") !== paramModel.selectedValues().join(", ")){
			paramModel.selectedValues.removeAll();
			newSelectedValues.forEach(function(v, i){
				paramModel.selectedValues.push(v);
			})
			
		}
		

	}		

	// Bind the knockoutjs bindinghandler
	// http://knockoutjs.com/documentation/custom-bindings.html
	ko.bindingHandlers.pmParam = {
		init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

            var paramModel = valueAccessor(),
				unwrappedParamModel = ko.unwrap(valueAccessor());
				allBindings = allBindingsAccessor();		


			var multiSelect = allBindingsAccessor.get('multiselect') || defaults.multiSelect;
			paramModel.multiSelect = paramModel.multiSelect || multiSelect;
			
			// Add css class "pm-param" to the achor element.
			element.classList.add("pm-param")

			// Bind-call makes first parameter be "this" in the called function. 
			// So the statemend below binds paramModel to "this" and paramModel also becomes the first argument. 
			paramModel.clickParam = clickParam.bind(paramModel, paramModel);
			paramModel.clickParamValue = clickParamValue.bind(paramModel, paramModel);

			// Check if the values has an selected observable
			// paramModel.values().forEach(function(v, i){
			// 	if(typeof v.selected !== "function"){
			// 		v.selected = ko.observable(false);
			// 	}
			// });

			// Set the values for selectedLabels and selectedValues
			setSelectedLabelsAndValues(paramModel);			

			//Subscribe to the values array to handle additions and removals
			unwrappedParamModel.values.subscribe(function(params){
				//Subscribe to the selected observable in the values array
				params.forEach(function(v,i, arr){
					if(v.selected.hasSubscriptionsForEvent("change")===0){
						var subCount = v.selected.getSubscriptionsCount();
						v.selected.subscribe(function(newValue){
							setSelectedLabelsAndValues(paramModel);
						}, paramModel, "change");
					}
				});			
				
			});

			//Subscribe to the selected observable in the values array
			unwrappedParamModel.values().forEach(function(v,i, arr){
				if(v.selected.hasSubscriptionsForEvent("change")===0){
					var subCount = v.selected.getSubscriptionsCount();
					v.selected.subscribe(function( newValue){
						setSelectedLabelsAndValues(paramModel);
					}, paramModel, "change");
				}
			});				

			// Make a modified binding context and apply it to descendant elements
			var childBindingContext = bindingContext.createChildContext(paramModel);
 			ko.applyBindingsToDescendants(childBindingContext, element);
			

			// Tell KO *not* to bind the descendants itself, otherwise they will be bound twice
			//see http://knockoutjs.com/documentation/custom-bindings-controlling-descendant-bindings.html
			return { controlsDescendantBindings: true };
		},
		update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			var paramModel = valueAccessor();
			var valueUnwrapped = ko.utils.unwrapObservable(valueAccessor());
			var allBindingsAccessorUnwrapped = ko.utils.unwrapObservable(allBindingsAccessor().pmParam);

			var paramTemplateName = allBindingsAccessor.get('pmParamTemplate2') || "ko_pm_param";
            var paramContainer = element.appendChild(document.createElement("DIV"));
            ko.renderTemplate(paramTemplateName, valueAccessor(), { templateEngine: templateEngine }, paramContainer, "replaceNode");			


		}
	};

	// *********** END OF KO BINDINGS*********************
	// ***************************************************
	

}));