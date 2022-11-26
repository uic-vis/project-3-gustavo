async function init() {

  mapboxgl.accessToken = "pk.eyJ1IjoiZ21tb3JlaXJhIiwiYSI6ImNrZDlnbmJrODBlY2cyc3NnazVscjJwcDgifQ.WNhHLBY6bfT9Ud-uaIQX3w";
  var map = new mapboxgl.Map({
    container: "map-mapbox",
    style: "mapbox://styles/mapbox/light-v9",
    center: [-87.64192964758396, 41.8395745181656],
    zoom: 10
  });

  await addDataMapbox(map);

  LinePlot("#LinePlot1",2020, 1);
  LinePlot("#LinePlot2",2020, 0);
  LinePlot("#LinePlot3",2021, 1);
  LinePlot("#LinePlot4",2021, 0);
  LinePlot("#LinePlot5",2022, 1);
  LinePlot("#LinePlot6",2022, 0);
  // CalendarPlot("#CalendarPlot", models, "007");
  matrixChart();

}

function matrixChart(){

  // d3.json("data/water-complaints.json", function(allData){
  d3.json("data/water-complaint-zip.geojson", function(allData){

    function addToAgg(elem, aggData){
      let added = false;
    
      aggData.forEach((item) => {
        if(item.street_direction == elem.street_direction && item.street_type == elem.street_type){
          item.quantity += 1;
          added = true;
        }
      });
      if(!added){
        aggData.push({"street_direction": elem.street_direction, "street_type": elem.street_type, "quantity": 1});
      }
    }

    function buildAggDataMatrix(){
      let aggData = [];
      
      dataForMatrix.forEach((elem) => {
        addToAgg(elem.properties, aggData);
      });
    
      return aggData;
    }
    
    // defining size of svg and margins
    let margin = ({top: 10, right: 20, bottom: 50, left: 105});
    let visWidth = 400;
    let visHeight = 400;

    let waterComplaintsData = allData.features;

    dataForMatrix = waterComplaintsData.filter(function (elem) {
      return elem.properties.street_direction != null && elem.properties.street_type != null && elem.properties.latitude != null && elem.properties.longitude != null;
    });

    
    let aggDataMatrix = buildAggDataMatrix();

    x = d3.scaleBand()
        .domain(Array.from(new Set(aggDataMatrix.map(d => d.street_direction))))
        .range([0, visWidth])
        .padding(0.02);

    y = d3.scaleBand()
        .domain(Array.from(new Set(aggDataMatrix.map(d => d.street_type))))
        .range([visHeight, 0])
        .padding(0.02);
  
    let arrayQuantity = []
  
    for(const elem of aggDataMatrix){
      arrayQuantity.push(elem.quantity);
    }
  
    arrayQuantity.sort(function(a, b){return a - b});
    
    let finalQuantityArray = [];
    let currentPercentil = 0;
    
    // Filtering the first and last 15 percentil to eliminate extreme values
    arrayQuantity.forEach((elem, index) => {
      if(currentPercentil < 0.85){
        finalQuantityArray.push(elem);
      }
      currentPercentil = index/arrayQuantity.length;
    });
  
    let colorDomain = d3.extent(finalQuantityArray);
  
    colorDomain[0] = -100 // Recalibrating the color scale
    
    square_color = d3.scaleSequential().domain(colorDomain).interpolator(d3.interpolateViridis);

    function matrixChart(){
      const mainDiv = d3.select("#matrixChart")
                        .append('div')
                        .attr('width', visWidth + margin.left + margin.right)
                        .attr('height', visHeight + margin.top + margin.bottom);
      
      const svg = mainDiv.append('svg')
        .attr('width', visWidth + margin.left + margin.right + 150)
        .attr('height', visHeight + margin.top + margin.bottom);
    
      let colors = ["rgb(247, 251, 255)", "rgb(8, 48, 107)"];
      
      const grad = svg.append('defs')
        .append('linearGradient')
        .attr('id', 'grad')
        .attr('x1', '0%')
        .attr('x2', '0%')
        .attr('y1', '100%')
        .attr('y2', '0%');
    
      grad.selectAll('stop')
        .data(colors)
        .enter()
        .append('stop')
        .style('stop-color', function(d){ return d; })
        .attr('offset', function(d,i){
          return 100 * (i / (colors.length - 1)) + '%';
        });
      
      svg.append('rect')
        .attr('x', visWidth+140)
        .attr('y', 10)
        .attr('width', 30)
        .attr('height', visHeight)
        .style('fill', 'url(#grad)')
        .style("stroke-width", "1px")
        .style("stroke", "black");
        
      const tooltip = mainDiv.append("div")
        .style("opacity", 0)
        .style("background-color", "white")
        .style("border", "1px solid")
        .style("pointer-events", "none")
        .style("z-index", 5)
        .style("width", "120px")
        .style("height", "35px")
        .style("padding", "5px");
      
      const g = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
      // create and add axes
      const xAxis = d3.axisBottom(x);
    
      const xAxisGroup = g.append("g")
          .call(xAxis)
          .attr("transform", `translate(0, ${visHeight})`);
    
      xAxisGroup.append("text")
          .attr("x", visWidth / 2)
          .attr("y", 40)
          .attr("fill", "black")
          .attr("text-anchor", "middle")
          .text("Street Direction")
          .style("font-size", "15px");
    
      const yAxis = d3.axisLeft(y);
    
      const yAxisGroup = g.append("g")
          .call(yAxis);
    
      yAxisGroup.append("text")
        .attr("x", "-65px")
        .attr("y", visHeight / 2)
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .text("Street Type")
        .style("font-size", "15px")
        .style("writing-mode", "vertical-rl");
      
      let squaresGroup = g.append("g");
    
      function mouseover(d, tooltip) {
        tooltip.style("opacity", 1);
      }

      function mousemove(d, tooltip) {

        tooltip
          .html("Quantity: " + d.quantity)
          .style("left", d3.event.pageX + "px")
          .style("position", "absolute")
          .style("top", d3.event.pageY + "px")
      }

      function mouseleave(d, tooltip) {
        tooltip.style("opacity", 0)
      }

      function update(data) {
        
        // draw bars
        let selectRect = squaresGroup.selectAll("rect")
                                  .data(data);
        
        selectRect 
          .attr("fill", 'blue')
          .attr("height", y.bandwidth())
          .attr("width", x.bandwidth())
          .attr("fill", d => square_color(d.quantity))
          .attr("x", d => x(d.street_direction))
          .attr("y", d => y(d.street_type))
          .on("mouseover", (d) => mouseover(d,tooltip))
          .on("mousemove", (d) => mousemove(d,tooltip))
          .on("mouseleave", (d) => mouseleave(d,tooltip));

        selectRect.enter()
          .append("rect")
          .attr("fill", 'blue')
          .attr("height", y.bandwidth())
          .attr("width", x.bandwidth())
          .attr("fill", d => square_color(d.quantity))
          .attr("x", d => x(d.street_direction))
          .attr("y", d => y(d.street_type))
          .on("mouseover", (d) => mouseover(d,tooltip))
          .on("mousemove", (d) => mousemove(d,tooltip))
          .on("mouseleave", (d) => mouseleave(d,tooltip));

        selectRect.exit().remove();

      }
    
      return Object.assign(mainDiv.node(), { update });
    }

    const matrixChartObject = matrixChart();
    matrixChartObject.update(aggDataMatrix);

    drawAggMap(matrixChartObject, dataForMatrix);

  });


}

async function loadGrid(year){
  let loadedData = {};
  let dataFile;

  if(year == "all"){
    dataFile = "data/all_years.json";
  }else if(year == "2018"){
    dataFile = "data/grid_2018.json";
  }else if(year == "2019"){
    dataFile = "data/grid_2019.json";
  }else if(year == "2020"){
    dataFile = "data/grid_2020.json";
  }else if(year == "2021"){
    dataFile = "data/grid_2021.json";
  }else if(year == "2022"){
    dataFile = "data/grid_2022.json";
  }

  d3.json(dataFile, function(data){
    loadedData.data = data;
  });

  while(!loadedData.data){
    await new Promise(r => setTimeout(r, 100));
  }

  return loadedData;
}

async function addDataMapbox(map){

  // let container = d3.select("#map-mapbox");

  // map.on("mousemove", e => {
  //   container.value = e.lngLat;
  //   container.dispatchEvent(new CustomEvent("input"));
  // });

  let canvasContainer = map.getCanvasContainer();

  let selectElem = d3.select(canvasContainer)
    .append("select")
    .attr("name", "selectYear")
    .style("position", "absolute")
    .style("z-index", 3)
    .style("right", "10px")
    .style("top", "66px");

  selectElem.append("option")
    .attr("value", "All time")
    .html("All time");

  selectElem.append("option")
    .attr("value", "2018")
    .html("2018");

  selectElem.append("option")
    .attr("value", "2019")
    .html("2019");

  selectElem.append("option")
    .attr("value", "2020")
    .html("2020");

  selectElem.append("option")
    .attr("value", "2021")
    .html("2021");

  selectElem.append("option")
    .attr("value", "2022")
    .html("2022");

  let svg = d3
    .select(canvasContainer)
    .append("svg")
    .attr("width", "100%")
    .attr("height", "50vh")
    .style("position", "absolute")
    .style("left", "0")
    .style("top", "0")
    .style("z-index", 2);

  const grad = svg.append('defs')
    .append('linearGradient')
    .attr('id', 'grad')
    .attr('x1', '0%')
    .attr('x2', '0%')
    .attr('y1', '100%')
    .attr('y2', '0%');

  let colors = ["rgb(247, 251, 255)", "rgb(8, 48, 107)"];

  grad.selectAll('stop')
    .data(colors)
    .enter()
    .append('stop')
    .style('stop-color', function(d){ return d; })
    .attr('offset', function(d,i){
      return 100 * (i / (colors.length - 1)) + '%';
    });

  svg.append('rect')
    .attr('x', 20)
    .attr('y', 20)
    .attr('width', 30)
    .attr('height', "90%")
    .style('fill', 'url(#grad)')
    .style("stroke-width", "1px")
    .style("stroke", "black");

  let createStringOfPoints = (flatPoints) => {
    let stringOfPoints = ""

    let i = 0;
    while(i < flatPoints.length-1){

      let longLat = map.project(new mapboxgl.LngLat(flatPoints[i], flatPoints[i+1]));

      if(i != flatPoints.length-2){
        stringOfPoints += longLat.x+","+longLat.y+" ";
      }else{
        stringOfPoints += longLat.x+","+longLat.y;
      }
      i += 2
    }

    return stringOfPoints;
  }

  let renderHeatMap = (grid) => {

    let grid_color = d3.scaleSequential(d3.interpolateViridis);
    grid_color.domain(d3.extent(grid, d => d.n_complaints));

    let dotsSelection = svg
      .selectAll("polygon")
      .data(grid);

    dotsSelection.style("opacity", 0.8)
      .style("fill", (d) => {
        if(d.n_complaints)
          return grid_color(d.n_complaints);
        else
          return "white";
      })
      .attr("points", function (d) {
        return createStringOfPoints(d.coordinates);
      })

    dotsSelection
      .enter()
        .append("polygon")
        .style("opacity", 0.8)
        .style("fill", (d) => {
          if(d.n_complaints)
            return grid_color(d.n_complaints);
          else
            return "white";
        })
        .attr("points", function (d) {
          return createStringOfPoints(d.coordinates);
        });

    dotsSelection.exit().remove();

  }

  let gridDataAll = await loadGrid("all");
  let gridData2018 = await loadGrid("2018");
  let gridData2019 = await loadGrid("2019");
  let gridData2020 = await loadGrid("2020");
  let gridData2021 = await loadGrid("2021");
  let gridData2022 = await loadGrid("2022");

  let prepareGridData = (grid) => {
    let reshapedArray = [];

    grid.forEach((elem) => {
      let squareObject = {};
      squareObject.n_complaints = elem.properties.n_complaints;
      squareObject.coordinates = [];
      elem.geometry.coordinates[0].forEach((pair) => {
        squareObject.coordinates.push(pair[0]);
        squareObject.coordinates.push(pair[1]);
      })
      reshapedArray.push(squareObject);
    });
    
    return reshapedArray;
  }

  let gridAllYears = prepareGridData(gridDataAll.data.features);
  let grid2018 = prepareGridData(gridData2018.data.features);
  let grid2019 = prepareGridData(gridData2019.data.features);
  let grid2020 = prepareGridData(gridData2020.data.features);
  let grid2021 = prepareGridData(gridData2021.data.features);
  let grid2022 = prepareGridData(gridData2022.data.features);

  let dots = renderHeatMap(gridAllYears);
  
  // render function is called every time an interaction is made with the map
  let render = () => {
    dots
      .attr("points", function (d) {
        return createStringOfPoints(d.coordinates);
      });
  }
  
  let lastChoice = "All time";

  selectElem.on("change", (e) => {
    lastChoice = selectElem.node().value;

    if(lastChoice == "All time"){
      renderHeatMap(gridAllYears);
    }
    
    if(lastChoice == "2018"){
      renderHeatMap(grid2018);
    }

    if(lastChoice == "2019"){
      renderHeatMap(grid2019);
    }

    if(lastChoice == "2020"){
      renderHeatMap(grid2020);
    }

    if(lastChoice == "2021"){
      renderHeatMap(grid2021);
    }

    if(lastChoice == "2022"){
      renderHeatMap(grid2022);
    }

  });

  let chooseRender = (subset) => {

    if(subset == "All time"){
      renderHeatMap(gridAllYears);
    }
    
    if(subset == "2018"){
      renderHeatMap(grid2018);
    }

    if(subset == "2019"){
      renderHeatMap(grid2019);
    }

    if(subset == "2020"){
      renderHeatMap(grid2020);
    }

    if(subset == "2021"){
      renderHeatMap(grid2021);
    }

    if(subset == "2022"){
      renderHeatMap(grid2022);
    }
  }

  map.on("viewreset", (e) => {
    chooseRender(lastChoice);
  });
  map.on("moveend", (e) => {
    chooseRender(lastChoice);
  });
}

//Create a tooltip
var tooltip = d3.select("#tooltip-map")
       .attr("class", "tooltip")
       .style("opacity", 0);

function drawAggMap(matrixChart, filteredComplaints){

  function updateMatrix(filteredComplaintsData, selectedZip, matrixChartObject){

    let selectedComplaints = filteredComplaintsData.filter(function (elem) {
      if(selectedZip == -1){
        return true; // all elements included
      }
      return elem.properties.zip == selectedZip;
    });

    function addToAgg(elem, aggData){
      let added = false;
    
      aggData.forEach((item) => {
        if(item.street_direction == elem.street_direction && item.street_type == elem.street_type){
          item.quantity += 1;
          added = true;
        }
      });
      if(!added){
        aggData.push({"street_direction": elem.street_direction, "street_type": elem.street_type, "quantity": 1});
      }
    }

    function buildAggDataMatrix(){
      let aggData = [];
      
      selectedComplaints.forEach((elem) => {
        addToAgg(elem.properties, aggData);
      });
    
      return aggData;
    }

    let aggDataMatrix = buildAggDataMatrix();

    matrixChartObject.update(aggDataMatrix);

  }

  d3.json("data/requests_by_zip.geojson", function(jsonData){
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

    let colorDomain = d3.extent(jsonData.features, d => d.properties["count"]);

    let colorScale = d3.scaleSequential().domain(colorDomain).interpolator(d3.interpolateViridis);

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
          return colorScale(d.properties["count"]);
        })
        .on('click',function(d){

          updateMatrix(filteredComplaints, d.properties.zip, matrixChart);

          d3.selectAll(".clicked1")
                  .classed("clicked1", false)
                  .style('stroke', 'black')
                  .style('stroke-width', "1px");

            d3.select(this)
                  .classed("clicked1", true)
                  .style('stroke', 'red')
                  .style('stroke-width', "5px");

        });

      d3.select("#button_reset_matrix").on('click', function(){
        d3.selectAll(".totalHNC")
            .classed("clicked1", false)
            .style('stroke', 'black')
            .style('stroke-width', '1px');

        updateMatrix(filteredComplaints, -1, matrixChart);
      })
  });

}

function CalendarPlot(container, models, countySelect){
	d3.selectAll('.Calendar').remove()
	d3.selectAll('.x axis').remove()
	d3.selectAll('.y axis').remove()

	var margin = {top: 5, right: 2, bottom: 5, left: 5},
    width = $(container).width() - margin.left - margin.right,
    height = $(container).height() - margin.top - margin.bottom;

    var itemSize = 10,
      	cellSize = itemSize - 1;

    var CalendarPlot = d3.select(container)
        .append("svg")
        .attr("width", $(container).width())
        .attr("height", $(container).height())
        .attr("class", "Calendar")
        .append("g")
        .attr("transform", "translate(180,45)");

    CalendarPlot.append("text")
                .attr("y", -40)
                .attr("x", "30%")
                .attr("dy", ".40em")
                .style("text-anchor", "start")
                .style("font" ,"12px sans-serif")
                .text("Weeks");

    if(countySelect!="007"){
    	CalendarPlot.append("text")
                .attr("y", 450)
                .attr("x", "25%")
                .attr("dy", ".40em")
                .style("text-anchor", "start")
                .style("font" ,"18px sans-serif")
                .text("County: " + countySelect);
    }

    var Calendardata = []

    if(countySelect=="007"){
    	for (week=0; week<=65; week++)
		{
			for(model in models[0]){
				s = 0
				var k = 0
				for(county in models[0][model]){
					if(!isNaN(models[0][model][county][week].diff)){
						s = s + models[0][model][county][week].diff;
					}
					k = k+1;
					b = s/k;
					if(b==0){
						b = "NaN"
					}
				}
				Calendardata.push({"model": model, "county": county, "week": week, "error": b})
			}
		}
    }
    else{
    	   for(var model in models[0]){
    			for(var county in models[0][model]){
    				for(var week in models[0][model][county]){
    					Calendardata.push({"model": model, "county": county, "week": week, "error": models[0][model][county][week].diff})
    				}
    			}
    		}
    }

    var x_elements = d3.set(Calendardata.map(function( item ) { return item.week; } )).values(),
        y_elements = d3.set(Calendardata.map(function( item ) { return item.model; } )).values();

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

    for(var NaNVal in Calendardata){
    	if(isNaN(Calendardata[NaNVal].error)){
    		Calendardata[NaNVal].error = 100000;
    	}
    }
        	
    var colorScale = d3.scaleThreshold()
        	.domain([-1300, -1000, -500, -200, -150, -100, 0, 100, 200, 300, 100000])
        	.range(["#67001f", "#b2182b", "#d6604d", "#f4a582", "#fddbc7", "#d1e5f0", "#92c5de", "#4393c3", "#2166ac", "#053061", "#999999"]);

    var tooltipClenderPlot = d3.select("#tooltipCalendarPlot")
            .attr("class", "tooltip")
            .style("opacity", 0);

    newData = []
    if(countySelect != "007")
    {
    	for(var j in Calendardata){
    		if(parseInt(Calendardata[j].county)==parseInt(countySelect)){
    			newData.push(Calendardata[j])
    		}
    	}

    }
    else{
    	newData = Calendardata
    }

    var cells = CalendarPlot.selectAll('rect')
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

        	CalendarPlot.append("g")
        		.attr("class", "y axis")
        		.call(yAxis)
        		.selectAll('text')
        		.attr('font-weight', 'normal');

    		CalendarPlot.append("g")
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
          var tooltipScatterlot = d3.select(".tooltip_ScatterPlot")
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

    });
}

function ScatterPlot(container, population, models, week){

	var margin = {top: 20, right: 10, bottom: 22, left: 5},
    width = $(container).width() - margin.left - margin.right-15,
    height = $(container).height() - margin.top - margin.bottom;

    var data = []
    for(var county in models[0]["COVIDhub-ensemble"]){
    	data.push({"CountyID": county, "population": population[0][county], "value": models[0]["COVIDhub-ensemble"][county][week].diff, "normalized":
    		models[0]["COVIDhub-ensemble"][county][week].diff/population[0][county]})
    }

    var FilteredData = []
    FilteredData = data.filter(function(d) {return ! isNaN(d.value);})

    let maxPopulation = d3.max(Object.values(population[0]))
    let minPopulation = d3.min(Object.values(population[0]))
    var xScale = d3.scaleLog().range([0, width]).domain([minPopulation, maxPopulation]); // value -> display
    var xAxis = d3.axisBottom(xScale).ticks(10);

    var yMax = d3.max(FilteredData, d => d.normalized)
    var yMin = d3.min(FilteredData, d => d.normalized)

    var yScale = d3.scaleLinear().range([height, 0]).domain([yMin, yMax]); // value -> display
    var yAxis = d3.axisLeft(yScale).ticks(10);

    var ScatterPlot = d3.select(container)
        .append("svg")
        .attr("width", $(container).width())
        .attr("height", $(container).height())
        .attr("class", "ScatterPlotClass")
        .append("g")
        .attr("transform", "translate(37,-2)");

     var tooltipScatterlot = d3.select(".tooltip_ScatterPlot")
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
          });

       var WeekName = ScatterPlot.append("g")
            .attr("width",40)
            .attr("height",70)
            .attr("class","text cancer-legend-heading")
            .append('text')
            .attr("x","75%")
            .attr("y","82%")
            .attr("font-size",'15px')
            .text('Week:' +" "+ week);

			function selectpoint(){

				if (d3.event.selection != null) {

          // revert circles to initial style
          circles.attr("class", "point");
          d3.selectAll(".county")
            .style('stroke', '#636363')
            .style('stroke-width', "1px");

          var brush_coords = d3.brushSelection(this);

          // style brushed circles
            co = circles.filter(function (){
              var cx = d3.select(this).attr("cx"),
                  cy = d3.select(this).attr("cy");
              return isBrushed(brush_coords, cx, cy);
            });

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