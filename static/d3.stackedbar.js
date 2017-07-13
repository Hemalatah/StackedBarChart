function inheritPrototype(childObject, parentObject) {
	var copyOfParent = Object.create(parentObject.prototype);
	copyOfParent.constructor = childObject;
	childObject.prototype = copyOfParent;
}

function D3Core(options) {
	if (!(this instanceof D3Core)) throw new TypeError("D3Core constructor cannot be called as a function.");
    var defaultOptions = {
		container: "#chart",
		margin: {top: 20, left: 50, bottom: 50, right: 20},
		spacing: 0.5,
		dataUrl: null,
		data: [ 
		        { key: "category 1", values: [ { x: "Type0", y: 4 }, { x: "Type2", y: 9959 } ]}, 
		        { key: "category 2", values: [ { x: "Type0", y: 16 }, { x: "Type2", y: 0 } ]}, 
		        { key: "category 3", values: [ { x: "Type0", y: 2 }, { x: "Type2", y: 0 } ]},
		        { key: "category 4", values: [ { x: "Type0", y: 23 }, { x: "Type2", y: 0 } ]},
		        { key: "category 5", values: [ { x: "Type0", y: 3648 }, { x: "Type2", y: 2088 } ]},
		        { key: "category 6", values: [ { x: "Type0", y: 69017 }, { x: "Type2", y: 0 } ]},
		        { key: "category 7", values: [ { x: "Type0", y: 566764 }, { x: "Type2", y: 1679 } ]},
		        { key: "category 8", values: [ { x: "Type0", y: 1 }, { x: "Type2", y: 0 } ]},
		        { key: "category 9", values: [ { x: "Type0", y: 92 }, { x: "Type2", y: 0 } ]},
		        { key: "category 10", values: [ { x: "Type0", y: 136 }, { x: "Type2", y: 412 } ]},
		        { key: "category 11", values: [ { x: "Type0", y: 1218 }, { x: "Type2", y: 0 } ]}
		      ],
		resizable: true,
		showLegend: true,
		showTooltip: true,
		showRuler: true,
		showHorizontalGrid: true,
		displayTable: true,
		yFormat: function(d) { return d; },
		colors: ['rgb(166,206,227)','rgb(31,120,180)','rgb(178,223,138)','rgb(51,160,44)','rgb(251,154,153)','rgb(227,26,28)','rgb(253,191,111)','rgb(255,127,0)','rgb(202,178,214)','rgb(106,61,154)','rgb(255,255,153)','rgb(177,89,40)'],
   		xTickSize: function(base) { return 10; },
		yTickSize: function(base) { return 10; },
		xTicks: 5,
		yTicks: 5,
		xTickPadding: 5,
		yTickPadding: 5,
		yAxisTranslate: function(base) { return "translate(0,0)"; },
		xAxisTranslate: function(base) { return "translate(0,"+base.height+")"; },
		xTickFormat: function(d) { return d; },
		yTickFormat: function(d) { return d; },
		tooltipText: function(d, element) { return "<p>Tooltip<br />x: "+d.x+"<br />y:"+d.y+"<p>"; }
	}	
	if (typeof options == 'object') this.options = $.extend(defaultOptions, options);
	else this.options = defaultOptions;
}

D3Core.prototype = {
	
	constructor: D3Core,
	
	prepare: function() {
		var base = this;
		this.margin = this.options.margin;
	    this.width = $(this.options.container).width() - this.margin.left - this.margin.right;
	    this.height = $(this.options.container).height() - this.margin.top - this.margin.bottom;
	    this.noData = null;
	    
	    if (this.options.showTooltip) {
	    	$(this.options.container).append("<div class='tooltip' style='display: none;' />");
	    	this.tooltipWidth = $(this.options.container+" .tooltip").outerWidth();
	    }
	    
	    if (this.options.showLegend) {
	    	base.legendDiv = d3.select(base.options.container).append("div").attr("class", "legend").append("ul");
	    }
	    
	    this.svg = d3.select(this.options.container)
			.append("svg:svg")
			.attr("width", this.width+this.margin.left+this.margin.right)
			.attr("height", this.height+this.margin.top+this.margin.bottom)
			.append("svg:g").attr("transform", "translate("+this.margin.left+","+this.margin.top+")");
	    
	    this.svg.append("clipPath")
			.attr("id", "clip")
			.append("rect")
			.attr("width", this.width)
			.attr("height", this.height)
			.attr("transform", "translate(0,0)");
	    
	    if (this.options.displayTable) {
	    	$(this.options.container).append("<div class='table' style='display: none;'><table /></div>");
	    	$(this.options.container).append("<a href='#' class='showTableIcon'>Display in Table</a>");
	    	this.table = $(this.options.container+" .table table");
	    	this.table.parent().css({
	    		width: $(this.options.container+" svg").width(),
	    		height: $(this.options.container+" svg").height()
	    	});
	    	
	    	$(this.options.container+" .showTableIcon").on("click", function(e) {
	    		e.preventDefault();
	    		if ($(this).hasClass("selected")) {
	    			$(this).removeClass("selected");
	    			$(this).text("Display in Table");
	    			base.table.parent().fadeOut("slow");
	    		} else {
	    			$(this).addClass("selected");
	    			$(this).text("Display in Graph");
	    			base.table.parent().fadeIn("slow");
	    		}
	    	});
	    	
	    }
	},
	
    show: function() {
    	var base = this;
    	base.prepare();
    	base.start();
    	var timeOut = null;
    	if (this.options.resizable) {
	    	$(window).on('resize', function(){	
	    	    if (timeOut != null) clearTimeout(timeOut);
	    	    timeOut = setTimeout(function(){
	    	    	base.resize()
	    	    }, 500);
	    	});
    	}
    },
    
    start: function() {
    	var base = this;
    	if (base.dataset) base.render();
    	else if (this.options.dataUrl) {
            $.ajax({
				url : base.options.dataUrl,
				type : 'GET'
			}).done(function(data){
				base.dataset = data;
				base.render();
    		});
    	} else {
    		base.dataset = base.options.data;
    		base.render();
    	}   
	},
	
	render: function() {
    	var base = this;
    	
    	if (base.dataset.length==0) {
    		this.noData = true;
    		base.showNoData();
    		return;
    	} else this.noData = false;
    	
    	base.prepareScales();

    	base.prepareCategory();
    	base.categoryEnter();
    	
    	base.prepareItem();
    	base.itemEnter();
		
		if (base.options.showRuler) base.axesRender();
		if (base.options.showTooltip) base.tooltipRender();
		
        if (base.options.showLegend) {
        	base.prepareLegend();
        	base.legendEnter();
        }
        
        if (base.options.displayTable) base.tableRender();
	},
	
	update: function() {
		var base = this;
		if (this.noData) {
			this.svg.selectAll(".nodata").remove();
			this.noData = false;
		}
		
		if (base.dataset.length==0) {
    		base.svg.selectAll(".item").remove();
    		base.svg.selectAll(".category").remove();
    		base.showNoData();
    		base.noData = true;
    		return;
    	}
		
		this.prepareScales();
		
		this.prepareCategory();
    	this.categoryEnter();
    	this.categoryUpdate();
    	this.categoryExit();
    	
    	this.prepareItem();
    	this.itemEnter();
    	this.itemUpdate();
    	this.itemExit();
    	
    	this.axesUpdate();
    	this.tooltipRender();
    	
        if (base.options.showLegend) {
        	this.prepareLegend();
        	this.legendEnter();
        	this.legendUpdate();
        	this.legendExit();
        }
        
        if (base.options.displayTable) base.tableRender();
        console.log("updated");
	},
	
	resize: function() {
		this.width = $(this.options.container).width() - this.margin.left - this.margin.right;
        this.height = $(this.options.container).height() - this.margin.top - this.margin.bottom;
        d3.select(this.options.container).select("svg").style('width', (this.width+this.margin.left+this.margin.right) + 'px').style('height', (this.height+this.margin.bottom+this.margin.top) + 'px');
        this.x = d3.scale.ordinal().rangePoints([0, this.width], this.options.spacing);
        this.y = d3.scale.linear().range([this.height, 0]);
		this.prepareScales();
        this.itemUpdate();
        this.axesUpdate();
	},
	
	prepareScales: function() {
		var base = this;
    	
	    this.x = d3.scale.ordinal().rangePoints([0, this.width], this.options.spacing);
	    this.y = d3.scale.linear().range([this.height, 0]);
	    this.color = d3.scale.ordinal().range(this.options.colors);
	    if (this.options.showRuler) this.prepareAxes();
		
    	base.color.domain(base.dataset.map(function(item) { return item.key; }));
    	base.x.domain(base.dataset[0].values.map(function(d) { return d.x; }));
    	var minValues = [
    	         	    d3.min(base.dataset, function (item) { return d3.min(item.values, function (d) { return d.y; });})*1.2, // 20% padding bottom
    	        	    d3.max(base.dataset, function (item) { return d3.max(item.values, function (d) { return d.y; });})*1.2 // 20% padding top
    	        	];
    	var multiplicator = (minValues[1]-minValues[0])*0.05;
    	base.y.domain([minValues[0]-multiplicator,minValues[1]+multiplicator]);
	},
	
	prepareAxes: function() {
		var base = this;
        this.xAxis = d3.svg.axis().scale(this.x).ticks(this.options.xTicks).tickSize(this.options.xTickSize(base)).tickPadding(this.options.xTickPadding).tickFormat(this.options.xTickFormat).orient("bottom");
        this.yAxis = d3.svg.axis().scale(this.y).ticks(this.options.yTicks).tickSize(this.options.yTickSize(base)).tickPadding(this.options.yTickPadding).tickFormat(this.options.yTickFormat).orient("left");
	},
	
	axesRender: function() {
		var base = this;
		
		if (base.options.showHorizontalGrid) {
			base.horizontalGrid = base.svg.append("g")
				.attr("class", "grid vertical")
				.selectAll("line.horizontalGrid").data(base.y.ticks(base.options.yTicks))
			
			base.horizontalGrid.enter()
		    	.append("line")
		        .attr("class", "horizontalGrid")
		        .transition().duration(1000)
		        .attr("x1", 0)
		        .attr("x2", base.width)
		        .attr("y1", function(d){ return base.y(d); })
		        .attr("y2", function(d){ return base.y(d); });
		}
		
    	if (base.y.domain()[0]<0) {
			base.centerLine = base.svg.append("g")
				.attr("class", "centerLine");
			
			base.centerLine
		    	.append("line")
		        .transition().duration(1000)
		        .attr("x1", 0)
		        .attr("x2", base.width)
		        .attr("y1", function(d){ return base.y(0); })
		        .attr("y2", function(d){ return base.y(0); });
    	}
		
		base.svg.append("g")
			.attr("class", "x axis")
			.attr("transform", base.options.xAxisTranslate(base))
			.call(base.xAxis);
	
		base.svg.append("g")	
			.attr("class", "y axis")
			.attr("transform", base.options.yAxisTranslate(base))
			.call(base.yAxis);
	},
	
	axesUpdate: function() {
		var base = this;
		
		if (base.options.showHorizontalGrid) {
			base.horizontalGrid = base.svg.select("g.grid.vertical").selectAll("line.horizontalGrid").data(base.y.ticks(base.options.yTicks));
			
			base.horizontalGrid.enter()
		    	.append("line")
		        .attr("class", "horizontalGrid")
		        .attr("y1", 0)
		        .attr("y2", 0)
		        .transition().duration(1000)
		        .attr("x1", 0)
		        .attr("x2", base.width)
		        .attr("y1", function(d){ return base.y(d); })
		        .attr("y2", function(d){ return base.y(d); });
			
			base.horizontalGrid
		        .transition().duration(1000)
		        .attr("x1", 0)
		        .attr("x2", base.width)
		        .attr("y1", function(d){ return base.y(d); })
		        .attr("y2", function(d){ return base.y(d); });
			
			base.horizontalGrid.exit()
		        .transition().duration(1000)
		        .attr("y1", 0)
		        .attr("y2", 0).remove();
		}
		base.centerLine = base.svg.select(".centerLine");
		if (base.y.domain()[0]<0) {
			if (!base.centerLine.select("line")) {
				base.centerLine
			    	.append("line")
			        .attr("y1", 0)
			        .attr("y2", 0)
			        .transition().duration(1000)
			        .attr("x1", 0)
			        .attr("x2", base.width)
			        .attr("y1", function(d){ return base.y(0); })
			        .attr("y2", function(d){ return base.y(0); });
			} else {
				base.centerLine.select("line")
			        .transition().duration(1000)
			        .attr("x1", 0)
			        .attr("x2", base.width)
			        .attr("y1", function(d){ return base.y(0); })
			        .attr("y2", function(d){ return base.y(0); });
			}
		} else if (base.centerLine) {
			base.centerLine.select("line")
		        .transition().duration(1000)
		        .attr("y1", 0)
		        .attr("y2", 0).remove();
		}
		
		base.svg.selectAll(".x.axis")
		   .transition().duration(1000)
		   .call(base.xAxis.scale(base.x));
		
		base.svg.selectAll(".y.axis")
		   .transition().duration(1000)
		   .call(base.yAxis.scale(base.y));
	},
	
	prepareCategory: function() {
		this.category = this.svg.selectAll(".category")
			.data(this.dataset);
	},
	
	categoryEnter: function() {
		var base = this;
		base.category
			.enter().append("g")
			.attr("class", "category")
			.attr("original-key", function(d, i) { return d.key; })
			.style("fill", function(d, i) { return base.color(d.key); });
	},
	
	categoryUpdate: function() {
		var base = this;
		base.category
			.attr("original-key", function(d, i) { return d.key; });
	},
	
	categoryExit: function() {
		var base = this;
		base.category
			.exit().selectAll(".item")
			.transition()
		    .remove();
		base.category
			.exit()
			.transition()
		    .remove();
	},
	
	prepareItem: function() {
		this.item = this.category.selectAll("path")
			.data(function(d) { return new Array(d); });
	},
	
	tooltipRender: function() {
		var base = this;
		base.item.on("mouseover", function(d) { base.options.tooltipOnMouseOver(d, this, base); });
		base.item.on("mouseout", function(d) { base.options.tooltipOnMouseOut(d, this, base); });
	},
	
	tableRender: function() {
		var base = this;
		base.table.empty();
		var $firstRow = $("<tr />");

		$firstRow.append("<th />");
		base.x.domain().forEach(function(element) {	
			var t = base.options.verticalText==null ? element : element+" ("+base.options.verticalText+")";
			$firstRow.append($("<th />").text(t));
		});
		base.table.append($("<thead />").append($firstRow));
		
		this.dataset.forEach(function(element) {
			var $row = $("<tr />");
			$row.append($("<th />").text(element.key));
			element.values.forEach(function(value) {
				$row.append($("<td />").text(base.options.yFormat(value.y)));
			});
			base.table.append($row);
		});
	},
	
	showNoData: function() {
		var base = this;
		base.svg.append("svg:text")
	  		.attr("dy", function(d) { return base.height/2; })
	  		.attr("dx", function(d) { return base.width/2; })
	  		.text("No data")
	  		.attr("text-anchor", "middle")
	  		.attr("class", "nodata")
		    .style("pointer-events", "none");
	},
	
	prepareLegend: function() {
    	this.legend = this.legendDiv.selectAll('li').data(this.color.domain());
	},
	
	legendEnter: function() {
		var base = this;
    	base.legend.enter().append('li')
    		.style("opacity", 0)
      	    .style('border-color', function(d) { return base.color(d); })
      	    .text(function(d) { return d; }) 		
    		.transition().duration(500).ease("cubic-in-out")
      	    .style("opacity", 1)
	},
	
	legendUpdate: function() {
		var base = this;
	   	base.legend
	  	    .style('border-color', function(d, i) { return base.color(d); })
	  	    .text(function(d) { return d; });
	},
	
	legendExit: function() {
    	this.legend.exit()
    		.style("opacity", 1)
    		.transition().duration(500).ease("cubic-in-out")
      	    .style("opacity", 0)
    		.remove();
	}
	
};

function D3StackedBar(options) {
	if (!(this instanceof D3StackedBar)) throw new TypeError("D3StackedBar constructor cannot be called as a function.");
    var defaultOptions = {
		container: "#stackedbar",
		spacing: 0.2,
		verticalText: "No. of Packets",
		tooltipOnMouseOver: function(d, element, base) { 		    
			var xPosition = parseInt($(element).attr("x")) + parseInt($(element).attr("width"))/2-base.tooltipWidth/2+base.options.margin.left;
			var yPosition = base.y.range()[0]-parseInt($(element).attr("y"))+base.options.margin.bottom+5;
			d3.select(base.options.container+" .tooltip")
				.style("left", xPosition + "px")
				.style("bottom", yPosition + "px")	
				.html(base.options.tooltipText(d, element));
			$(base.options.container+" .tooltip").show();
		},
		tooltipOnMouseOut: function(d, element, base) {
			$(base.options.container+" .tooltip").hide();
		}
	}	
	if (typeof options == 'object') this.options = $.extend(defaultOptions, options);
	else this.options = defaultOptions;
    D3Core.call(this, this.options);
}

inheritPrototype(D3StackedBar, D3Core);

D3StackedBar.prototype.prepareItem = function() {
	this.item = this.category.selectAll("rect")
		.data(function(d) { return d.values; });
}

D3StackedBar.prototype.itemEnter = function() {
	var base = this;
	base.item
		.enter().append("rect")
		.attr("x", function(d) { return base.x(d.x); })
		.attr("original-x", function(d) { return d.x; })
		.attr("original-y", function(d) { return d.y; })
		.attr("y", function(d) { return base.height; })   
		.attr("width", base.x.rangeBand())
		.attr("height", 0)
		.attr("class", "rect")
		.transition().delay(300).duration(500).ease("cubic-in-out")
		.attr("height", function(d) { return base.y(0)-base.y(d.size); })
		.attr("y", function(d) { return base.y(d.y0); });
}

D3StackedBar.prototype.itemUpdate = function() {
	var base = this;
	base.item
		.attr("original-x", function(d) { return d.x; })
		.attr("original-y", function(d) { return d.y; })	
		.transition().duration(500).ease("cubic-in-out")
		.attr("x", function(d) { return base.x(d.x); })
		.attr("y", function(d) { return base.y(d.y0); })
		.attr("height", function(d) { return base.y(0)-base.y(d.size); })
		.attr("width", base.x.rangeBand());
}

D3StackedBar.prototype.itemExit = function() {
	var base = this;
	base.item.exit()
	    .transition().duration(300).ease("cubic-in-out")
	    .attr("height", 0)
	    .attr("y", function(d) { return base.height; })  
	    .remove();
}

D3StackedBar.prototype.showVerticalText = function() {
	this.svg.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text(this.options.verticalText);
}

D3StackedBar.prototype.render = function() {
	D3Core.prototype.render.apply(this);
	if (this.options.verticalText!=null) this.showVerticalText();
}

D3StackedBar.prototype.resize = function() {
	this.width = $(this.options.container).width() - this.margin.left - this.margin.right;
    this.height = $(this.options.container).height() - this.margin.top - this.margin.bottom;
    d3.select(this.options.container).select("svg").style('width', (this.width+this.margin.left+this.margin.right) + 'px').style('height', (this.height+this.margin.bottom+this.margin.top) + 'px');
    this.x = d3.scale.ordinal().rangeRoundBands([0, this.width], this.options.spacing);
    this.y = d3.scale.linear().range([this.height, 0]);
	this.prepareScales();
    this.itemUpdate();
    this.axesUpdate();
}

D3StackedBar.prototype.prepareScales = function() {
	var base = this;
	
	this.x = d3.scale.ordinal().rangeRoundBands([0, this.width], this.options.spacing);
    this.y = d3.scale.linear().range([this.height, 0]);
    this.color = d3.scale.ordinal().range(this.options.colors);
    if (this.options.showRuler) this.prepareAxes();
	
    this.barStack = function(data) {
        var i = base.x.domain().length;
        while (i--) {
            var posBase = 0, negBase = 0;
            data.forEach(function(category) {
                var item = category.values[i]
                item.size = Math.abs(item.y);
                if (item.y < 0) {
                    item.y0 = negBase;
                    negBase -= item.size;
                } else {
                    posBase += item.size;
                    item.y0 = posBase;
                }
            });
        }
        data.extent = d3.extent(d3.merge(d3.merge(data.map(function(category) {
            return category.values.map(function(item) {
                return [item.y0, item.y0 - item.size]
            })
        }))));
        return data;
    };
    
	base.x.domain(base.dataset[0].values.map(function(d) { return d.x; }));
	base.categories = base.barStack(base.dataset);
	base.color.domain(base.dataset.map(function(item) { return item.key; }));
	base.y.domain(base.dataset.extent);
}
