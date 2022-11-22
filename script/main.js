var GlobalPopulation
var GlobalModels

function init() {
     var populationPromise = $.getJSON("population.json");
     var modelsPromise = $.getJSON("models2.json");
     // var countyPromise = $.getJSON("counties.json");
    // when both requests complete
    $.when(populationPromise, modelsPromise).then(function(population, models) {
    	//global.GlobalModels = models
    	// console.log( csvTest)
      	LinePlot("#LinePlot1",2020, 1);
      	LinePlot("#LinePlot2",2020, 0);
      	LinePlot("#LinePlot3",2021, 1);
      	LinePlot("#LinePlot4",2021, 0);
      	LinePlot("#LinePlot5",2022, 1);
      	LinePlot("#LinePlot6",2022, 0);
      	CalenderPlot("#CalenderPlot", models, "007");
      	drawAggMap()
    });
}
//init()
//console.log(global.GlobalModels)

//Create a tooltip
var tooltip = d3.select("#tooltip-map")
       .attr("class", "tooltip")
       .style("opacity", 0);

function drawAggMap(){
    
    d3.json("data/mapChicagoDistribution.geojson", function(jsonData){
        var width = $("#map-layer").width();
        var height = $("#map-layer").height();
        var center = [-87.623177, 41.881832];
        var scale = 170;

        var projection = d3.geoMercator().center(center)
                            .scale(width*50)
                            .translate([width/1.5, height/3]);
        var path = d3.geoPath().projection(projection);



        //Create SVG element
        var svg = d3.select(".map")
                    .attr("height", height);

        svg.append('g')
            .selectAll('path')
            .data(jsonData.features)
            .enter().append('path')
            .attr('d', path)
            .attr('vector-effect', 'non-scaling-stroke')
            .attr('class', 'totalHNC')
            .style("stroke", "#636363")
            .style('stroke-width', "1px")
            .attr('fill', function(d) { 
                if(d.properties["Count_Total"]<=10){return "#eff3ff"}
            else if(d.properties["Count_Total"]>10 && d.properties["Count_Total"]<=20){return "#bdd7e7"}
            else if(d.properties["Count_Total"]>20 && d.properties["Count_Total"]<=30){return "#6baed6"}
            else if(d.properties["Count_Total"]>30 && d.properties["Count_Total"]<=40){return "#3182bd"}
            else if(d.properties["Count_Total"]>40){return "#08519c"}
            else {
                return "#053061";
                }
            
            })
            .on('click',function(d){
                // console.log(d.properties)

                d3.selectAll(".clicked1")
                        .classed("clicked1", false)
                        .style('stroke', 'black')
                        .style('stroke-width', "1px");

                 d3.select(this)
                        .classed("clicked1", true)
                        .style('stroke', 'red')
                        .style('stroke-width', "5px");

            })

    })

    // d3.select("#mapLegend").append('g')
    //         .attr("width",40)
    //         .attr("height",60)
    //         .attr("class","mapLegendText")
    //         .append('text')
    //         .attr("x","90%")
    //         .attr("y","45%")
    //         .attr("font-size",'30px')
    //         .text('Total Pollution Soures');


    // var CalLgndTxt = ["10", "20", "30", "40", "50"]
    // var CalLgndColor = ["#eff3ff", "#bdd7e7", "#6baed6", "#3182bd", "#08519c"]

    // var Legend = d3.select("#mapLegend")
    //     .append('svg')
    //     .attr("width", 100)
    //     .attr("height", $("#mapLegend").height())
    //     .append("g")
    //     .attr("class", "Lgnd")
    //     .attr("transform", function(d, i) { return "translate(10," + (60 + i * 20) + ")"; });


    // for (var i = 0; i < CalLgndColor.length; i++) {
    //     Legend.append("g:rect")
    //         .attr("y", i*35)
    //         .attr("height", 35)
    //         .attr("width", 25)
    //         .style("fill", CalLgndColor[i])
    //         .style("opacity", "1")
    //         .attr('stroke', 'black')
    //         .attr('stroke-width', '0.3px');


    //     Legend.append("text")
    //         .attr("y", (i* 35)+25)
    //         .attr("x", 35)
    //         .attr("dy", ".40em")
    //         .style("text-anchor", "start")
    //         .style("font" ,"10px sans-serif")
    //         .text(String(CalLgndTxt[i]));
    // };





}



function CalenderPlot(container, models, countySelect){
	//console.log(countySelect)
	d3.selectAll('.Calender').remove()
	//d3.selectAll('.CalenderLgnd').remove()
	//d3.select('#CalenderLegend').remove()
	d3.selectAll('.x axis').remove()
	d3.selectAll('.y axis').remove()
	//d3.selectAll('.Cell').remove()

	var margin = {top: 5, right: 2, bottom: 5, left: 5},
    width = $(container).width() - margin.left - margin.right,
    height = $(container).height() - margin.top - margin.bottom;

    var itemSize = 10,
      	cellSize = itemSize - 1;

    var CalenderPlot = d3.select(container)
        .append("svg")
        .attr("width", $(container).width())
        .attr("height", $(container).height())
        .attr("class", "Calender")
        .append("g")
        .attr("transform", "translate(180,45)");

    CalenderPlot.append("text")
                .attr("y", -40)
                .attr("x", "30%")
                .attr("dy", ".40em")
                .style("text-anchor", "start")
                .style("font" ,"12px sans-serif")
                .text("Weeks");

    if(countySelect!="007"){
    	CalenderPlot.append("text")
                .attr("y", 450)
                .attr("x", "25%")
                .attr("dy", ".40em")
                .style("text-anchor", "start")
                .style("font" ,"18px sans-serif")
                .text("County: " + countySelect);
    }
 

        //attr("transform", "translate(" + margin.left + "," + margin.top + ")");
       /* p = 0;
        console.log(models[0]["COVIDhub-ensemble"]["1001"][p])*/

    var Calenderdata = []

    if(countySelect=="007"){
    	for (week=0; week<=65; week++)
		{
			for(model in models[0]){
				s = 0
				var k = 0
				for(county in models[0][model]){
					//console.log(county, week, models[0][model][county][week].diff)
					if(!isNaN(models[0][model][county][week].diff)){
						s = s + models[0][model][county][week].diff;
					}
					k = k+1;
					b = s/k;
					if(b==0){
						b = "NaN"
					}
				}
				Calenderdata.push({"model": model, "county": county, "week": week, "error": b})
			}
		}
    }
    else{
    	   for(var model in models[0]){
    			for(var county in models[0][model]){
    				for(var week in models[0][model][county]){
    					Calenderdata.push({"model": model, "county": county, "week": week, "error": models[0][model][county][week].diff})
    				}
    			}
    		}
    }
    //console.log(Calenderdata)

    var x_elements = d3.set(Calenderdata.map(function( item ) { return item.week; } )).values(),
        y_elements = d3.set(Calenderdata.map(function( item ) { return item.model; } )).values();

	//var checkVal = d3.max(Calenderdata, d => d.error)
	//var checkValmin = d3.min(Calenderdata, d => d.error)
	//console.log(checkVal, checkValmin)

    var xScale = d3.scaleBand()
        	.domain(x_elements)
        	.range([0, x_elements.length * itemSize]);

    var xAxis = d3.axisTop(xScale)
        	.tickFormat(function (d) {
            	return d;
        	})
        	

    var yScale = d3.scaleBand()
        	.domain(y_elements)
        	.range([0, y_elements.length * itemSize]);

    var yAxis = d3.axisLeft(yScale)
        	.tickFormat(function (d) {
            	return d;
        	})

    for(var NaNVal in Calenderdata){
    	//console.log(typeof Calenderdata[NaNVal].error)
    	if(isNaN(Calenderdata[NaNVal].error)){
    		Calenderdata[NaNVal].error = 100000;
    	}
    }
        	

    var colorScale = d3.scaleThreshold()
        	.domain([-1300, -1000, -500, -200, -150, -100, 0, 100, 200, 300, 100000])
        	.range(["#67001f", "#b2182b", "#d6604d", "#f4a582", "#fddbc7", "#d1e5f0", "#92c5de", "#4393c3", "#2166ac", "#053061", "#999999"]);

    var tooltipClenderPlot = d3.select("#tooltipClenderPlot")
            .attr("class", "tooltip")
            .style("opacity", 0);

    newData = []
    if(countySelect != "007")
    {
    	for(var j in Calenderdata){
    		if(parseInt(Calenderdata[j].county)==parseInt(countySelect)){
    		//console.log(Calenderdata[j])

    			newData.push(Calenderdata[j])
    		
    		}
    	}

    }
    else{
    	newData = Calenderdata
    }
    // console.log(newData)

   

    var cells = CalenderPlot.selectAll('rect')
        	.data(newData)
        	.enter().append('g').append('rect')
        	.attr('class', 'cell')
        	.attr('width', cellSize)
        	.attr('height', cellSize)
        	.attr('y', function(d) { return yScale(d.model); })
        	.attr('x', function(d) { return xScale(d.week); })
        	.attr('fill', function(d) { 
        		if(d.error<=-1300){return "#67001f"}
            else if(d.error>-1300 && d.error<=-1000){return "#b2182b"}
            else if(d.error>-1000 && d.error<=-500){return "#d6604d"}
            else if(d.error>-500 && d.error<=-200){return "#f4a582"}
            else if(d.error>-200 && d.error<=-150){return "#fddbc7"}
            else if(d.error>-150 && d.error<=-100){return "#f7f7f7"}
            else if(d.error>-100 && d.error<=0){return "#d1e5f0"}
            else if(d.error>0 && d.error<=100){return "#92c5de"}
            else if(d.error>100 && d.error<=200){return "#4393c3"}
            else if(d.error>200 && d.error<=300){return "#2166ac"}
            else if(d.error==100000){return "#999999"}
            else {
            	return "#053061";
        		//return colorScale(d.error); 
            }
        	})
        	.attr('stroke', 'black')
        	.attr('stroke-width', '0.3px')
        	.on("mouseover", function(d) {
        		if(d.error==100000)
        		{
        			errorVal = "No Information";
        		}
        		else{
        			errorVal = d.error;
        		}
        		tooltipClenderPlot.transition()
                   .duration(200)
                   .style("opacity", .9);
                 tooltipClenderPlot.html("Model name: " + d.model + "<br/>" +
                            "Error:"  + errorVal + "<br/>" +
                            "Week:"  + d.week + "<br/>")
                   .style("left", (d3.event.pageX + 5) + "px")
                   .style("top", (d3.event.pageY - 28) + "px");
        	})
        	.on("mouseout", function(d) {
              tooltipClenderPlot.transition()
                   .duration(500)
                   .style("opacity", 0);
          	});

        	CalenderPlot.append("g")
        		.attr("class", "y axis")
        		.call(yAxis)
        		.selectAll('text')
        		.attr('font-weight', 'normal');

    		CalenderPlot.append("g")
        		.attr("class", "x axis")
        		.call(xAxis)
        		.selectAll('text')
        		.attr('font-weight', 'normal')
        		.style("text-anchor", "start")
        		.attr("dx", ".8em")
        		.attr("dy", ".5em")
        		.attr("transform", function (d) {
            		return "rotate(-65)";
        		});

}

function LinePlot(container, year, complaint){
	// var margin = {top: 20, right: 10, bottom: 22, left: 5},
 //    width = $(container).width() - margin.left - margin.right-15,
 //    height = $(container).height() - margin.top - margin.bottom;

 	var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = $(container).width() - margin.left - margin.right,
    height = $(container).height() - margin.top - margin.bottom

    var LinePlot = d3.select(container)
        .append("svg")
        .attr("width", $(container).width())
        .attr("height", $(container).height())
        .attr("class", "LinePlotClass")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        var yLevel = 0
        var xLevel = 0

    
    	d3.csv("data/MergedData2020.csv", function(d){
    		if(year==2020){
    			xLevel = 'Months of 2020';
    			if(complaint==1){
    				yLevel = 'Total Complaints';
    				return { date : d3.timeParse("%Y-%m-%d")(d.month), value : d.counts_2020 }
    			}
    			else if(complaint==0){
    				yLevel = 'Total Rain';
    				return { date : d3.timeParse("%Y-%m-%d")(d.month), value : d.Total_Rain_2020 }
    			}
    		}
    		else if(year==2021){
    			xLevel = 'Months of 2021';
    			if(complaint==1){
    				yLevel = 'Total Complaints';
    				return { date : d3.timeParse("%Y-%m-%d")(d.month), value : d.counts_2021 }
    			}
    			else if(complaint==0){
    				yLevel = 'Total Rain';
    				return { date : d3.timeParse("%Y-%m-%d")(d.month), value : d.Total_Rain_2021 }
    			}
    		}
    		else if(year==2022){
    			xLevel = 'Months of 2022';
    			if(complaint==1){
    				yLevel = 'Total Complaints';
    				return { date : d3.timeParse("%Y-%m-%d")(d.month), value : d.counts_2022 }
    			}
    			else if(complaint==0){
    				yLevel = 'Total Rain';
    				return { date : d3.timeParse("%Y-%m-%d")(d.month), value : d.Total_Rain_2022 }
    			}
    		}
  },

  // Now I can use this dataset:
	  function(data) {

	    var x = d3.scaleTime()
	      .domain(d3.extent(data, function(d) { return d.date; }))
	      .range([ 0, width]);
	    LinePlot.append("g")
	      .attr("transform", "translate(0," + height + ")")
	      .call(d3.axisBottom(x))
	      .append("text")
      	  .attr("class", "label")
          .attr("x", width-width/2)
          .attr("y", 28)
          .style("text-anchor", "end")
          .attr("fill", "#000000")
          .text(String(xLevel));

	    // Add Y axis
	    var y = d3.scaleLinear()
	      .domain([0, d3.max(data, function(d) { return +d.value; })])
	      .range([ height, 0 ]);
	    LinePlot.append("g")
	      .call(d3.axisLeft(y))
	      .append("text")
	      .attr("class", "label")
	      .attr("transform", "rotate(-90)")
	      .attr("x", -10)
	      .attr("y", 15)
	      .attr("dy", ".71em")
	      .style("text-anchor", "end")
	      .attr("fill", "#000000")
	      .text(String(yLevel));

	    // Add the line
	    LinePlot.append("path")
	      .datum(data)
	      .attr("fill", "none")
	      .attr("stroke", "steelblue")
	      .attr("stroke-width", 1.5)
	      .attr("d", d3.line()
	        .x(function(d) { return x(d.date) })
	        .y(function(d) { return y(d.value) })
	       )
	      

	      // create a tooltip
	      var tooltipScatterlot = d3.select("#tooltip_ScatterPlot")
	    	.attr("class", "tooltip")
	    	.style("opacity", 0)
	      	.attr("class", "tooltip")
	      	.style("background-color", "white")
	      	.style("border", "solid")
	      	.style("border-width", "2px")
	      	.style("border-radius", "5px")
	      	.style("padding", "5px")

	      // Three function that change the tooltip when user hover / move / leave a cell
	      var mouseover = function(d) {
	        tooltipScatterlot
	          .style("opacity", 1)
	      }
	      var mousemove = function(d) {
	        tooltipScatterlot
	          .html("Value: " + d.value)
	          .style("left", (d3.event.pageX + 5) + "px")
	          .style("top", (d3.event.pageY - 28) + "px")
	      }
	      var mouseleave = function(d) {
	        tooltipScatterlot
	          .style("opacity", 0)
	      }

	    // Add the points
	    LinePlot
	      .append("g")
	      .selectAll("dot")
	      .data(data)
	      .enter()
	      .append("circle")
	        .attr("class", "myCircle")
	        .attr("cx", function(d) { return x(d.date) } )
	        .attr("cy", function(d) { return y(d.value) } )
	        .attr("r", 4)
	        .attr("stroke", "#69b3a2")
	        .attr("stroke-width", 3)
	        .attr("fill", "white")
	        .on("mouseover", mouseover)
	        .on("mousemove", mousemove)
	        .on("mouseleave", mouseleave)

	})
   //  console.log(data)
   //  var xScale = d3.scaleTime()
   //    		  .domain(d3.extent(data, function(d) { return d.Month; }))
   //            .range([ 0, width ]);

   //  var xAxis = d3.axisBottom(xScale);

   // var x_axis = LinePlot.append("g")
   //    .attr("class", "x axis")
   //    .attr("transform", "translate(0," + height + ")")
   //    .call(xAxis)
   //    .append("text")
   //    .attr("class", "label")
   //    .attr("x", width-width/2)
   //    .attr("y", 28)
   //    .style("text-anchor", "end")
   //    .attr("fill", "#000000")
   //    .text("Months");

   //  // Add Y axis
   //  var yMax = d3.max(data, d => d.Counts)
   //  var yScale = d3.scaleLinear()
   //    		  .domain([0, yMax])
   //    		  .range([ height, 0 ]);
   //  var yAxis = d3.axisLeft(yScale);

	  //  axis = width-520;
	  // var y_axis = LinePlot.append("g")
	  //     .attr("class", "y axis")
	  //     .call(yAxis)
	  //     .append("text")
	  //     .attr("class", "label")
	  //     .attr("transform", "rotate(-90)")
	  //     .attr("x", -3)
	  //     .attr("y", 15)
	  //     .attr("dy", ".71em")
	  //     .style("text-anchor", "end")
	  //     .attr("fill", "#000000")
	  //     .text("Counts");

   //   var tooltipScatterlot = d3.select("#tooltip_ScatterPlot")
   //          .attr("class", "tooltip")
   //          .style("opacity", 0);

   //    // Add the line
   //  LinePlot.append("path")
   //    .datum(data)
   //    .attr("fill", "none")
   //    .attr("stroke", "steelblue")
   //    .attr("stroke-width", 1.5)
   //    .attr("d", d3.line()
   //      .x(function(d) { return xScale(d.Month) })
   //      .y(function(d) { return yScale(d.Counts) })
   //      )
}

function ScatterPlot(container, population, models, week){

	var margin = {top: 20, right: 10, bottom: 22, left: 5},
    width = $(container).width() - margin.left - margin.right-15,
    //height = 600- margin.top - margin.bottom;
    height = $(container).height() - margin.top - margin.bottom;

    //var xValue = function(d) { return d.value;}, // data -> value
    //console.log(models)
    //console.log(models[0]["COVIDhub-ensemble"]["1003"][0].diff)
   /* var Checkdata = []
    for(var county1 in models[0]["COVIDhub-ensemble"])
    {
    	console.log(models[0]["COVIDhub-ensemble"][county1][55])
    }*/

    var data = []
    for(var county in models[0]["COVIDhub-ensemble"]){
    	data.push({"CountyID": county, "population": population[0][county], "value": models[0]["COVIDhub-ensemble"][county][week].diff, "normalized":
    		models[0]["COVIDhub-ensemble"][county][week].diff/population[0][county]})
    }
    //console.log(data.filter(data, d => !isNaN(d.value)))
    var FilteredData = []
    FilteredData = data.filter(function(d) {return ! isNaN(d.value);})
    //console.log(data)

    let maxPopulation = d3.max(Object.values(population[0]))
    let minPopulation = d3.min(Object.values(population[0]))
    var xScale = d3.scaleLog().range([0, width]).domain([minPopulation, maxPopulation]); // value -> display
    var xAxis = d3.axisBottom(xScale).ticks(10);

    var yMax = d3.max(FilteredData, d => d.normalized)
    var yMin = d3.min(FilteredData, d => d.normalized)
    //console.log(yMin, yMax, maxPopulation)
    var yScale = d3.scaleLinear().range([height, 0]).domain([yMin, yMax]); // value -> display
    var yAxis = d3.axisLeft(yScale).ticks(10);

    var ScatterPlot = d3.select(container)
        .append("svg")
        .attr("width", $(container).width())
        .attr("height", $(container).height())
        .attr("class", "ScatterPlotClass")
        .append("g")
        .attr("transform", "translate(37,-2)");

     var tooltipScatterlot = d3.select("#tooltip_ScatterPlot")
            .attr("class", "tooltip")
            .style("opacity", 0);

    var x_axis = ScatterPlot.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis)
          .append("text")
          .attr("class", "label")
          .attr("x", width-width/2)
          .attr("y", 28)
          .style("text-anchor", "end")
          .attr("fill", "#000000")
          .text("Population");

      // y-axis
      axis = width-520;
      var y_axis = ScatterPlot.append("g")
          .attr("class", "y axis")
          .call(yAxis)
          .append("text")
          .attr("class", "label")
          .attr("transform", "rotate(-90)")
          .attr("x", -3)
          .attr("y", 15)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .attr("fill", "#000000")
          .text("Normalized");

        // draw dots .attr("transform", "translate(" + axis + ", 5)")  .attr("transform", "translate(0," + height + ")")
      var circles = ScatterPlot.selectAll("circle")
          .data(FilteredData)
          .enter().append("circle")
          .attr("class", "point")
          .attr("id", function(d){
          	return "point_" + week;
          })
          .attr("cx", d=> xScale(d.population))
          .attr("cy", d=> yScale(d.normalized))
          .attr("r", 3)
          .attr("fill", "#4393c3")
          .attr("stroke", "black")
          .on("mouseover", function(d) {
        		tooltipScatterlot.transition()
                   .duration(200)
                   .style("opacity", .9);
                 tooltipScatterlot.html("County: " + d.CountyID + "<br/>" +
                            "Population: "  + d.population + "<br/>" +
                            "Normalized Error:"  + d.normalized + "<br/>")
                   .style("left", (d3.event.pageX + 5) + "px")
                   .style("top", (d3.event.pageY - 28) + "px");
        	})
        	.on("mouseout", function(d) {
              tooltipScatterlot.transition()
                   .duration(500)
                   .style("opacity", 0);
          	})
          

       var WeekName = ScatterPlot.append("g")
            .attr("width",40)
            .attr("height",70)
            .attr("class","text cancer-legend-heading")
            .append('text')
            .attr("x","75%")
            .attr("y","82%")
            .attr("font-size",'15px')
            .text('Week:' +" "+ week);

			function selectpoint()
			{
				if (d3.event.selection != null) {
					//console.log(circles)
					//co.attr("class", "point");
					//console.log(co)

                    // revert circles to initial style
                    circles.attr("class", "point");
                    d3.selectAll(".county")
          				.style('stroke', '#636363')
                		.style('stroke-width', "1px");

                    var brush_coords = d3.brushSelection(this);
                    //console.log("bc is: " + brush_coords)

                    // style brushed circles
                     co = circles.filter(function (){

                               var cx = d3.select(this).attr("cx"),
                                   cy = d3.select(this).attr("cy");

                                   //console.log("cx is: " + cx, "cy is: " + cy)

                               return isBrushed(brush_coords, cx, cy);
                           })
                           co.attr("class", "brushed");
                }
			}

			function isBrushed(brush_coords, cx, cy) {

             	var x0 = brush_coords[0][0],
                	 x1 = brush_coords[1][0],
                 	y0 = brush_coords[0][1],
                	 y1 = brush_coords[1][1];

           		 return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
        	}

        	function Selectcounty(){
        		//console.log("Hi")
        		// disregard brushes w/o selections  
                // ref: http://bl.ocks.org/mbostock/6232537
                if (!d3.event.selection) return;

                // programmed clearing of brush after mouse-up
                // ref: https://github.com/d3/d3-brush/issues/10
                d3.select(this).call(brush.move, null);

                var d_brushed =  d3.selectAll(".brushed").data();
                console.log(d_brushed)

                // populate table if one or more elements is brushed
                if (d_brushed.length > 0) {
                    d3.selectAll(".county")
          				.style('stroke', '#636363')
                		.style('stroke-width', "1px");
                    d_brushed.forEach(d_row => HighlightMap(d_row))
                } else {
                   d3.selectAll(".county")
          				.style('stroke', '#636363')
                		.style('stroke-width', "1px");
                }
        	}

        	var brush = d3.brush()
			                  .on("brush", selectpoint)
			                  .on("end", Selectcounty);
			ScatterPlot.append("g")
						.call(brush);

			function HighlightMap(d_row) {
            	d3.select("#path_"+parseInt(d_row.CountyID))
          		.style('stroke', 'red')
                .style('stroke-width', "3px");
        	}


        
}


window.onload = init()