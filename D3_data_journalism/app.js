// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin = {
   top: 20,
   right: 40,
   bottom: 100,
   left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
   .select("#scatter")
   .append("svg")
   .attr("width", svgWidth)
   .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
   .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";


// function used for updating x-scale var upon click on axis label
function xScale(healthData, chosenXAxis) {
   // create scales
   var xLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, data => data[chosenXAxis]) * 0.8,
         d3.max(healthData, data => data[chosenXAxis]) * 1.2
      ])
      .range([0, width]);

   return xLinearScale;
}

// function used for updating y-scale var upon click on axis label
function yScale(healthData, chosenYAxis) {
   // create scales
   var yLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, data => data[chosenYAxis]) * 0.8,
         d3.max(healthData, data => data[chosenYAxis]) * 1.2
      ])
      .range([height, 0]);

   return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXAxis(newXScale, xAxis) {
   var bottomAxis = d3.axisBottom(newXScale);

   xAxis.transition()
      .duration(1000)
      .call(bottomAxis);

   return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxis(newYScale, yAxis) {
   var leftAxis = d3.axisLeft(newYScale);

   yAxis.transition()
      .duration(1000)
      .call(leftAxis);

   return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

   circlesGroup.transition()
      .duration(1000)
      .attr("cx", data => newXScale(data[chosenXAxis]))
      .attr("cy", data => newYScale(data[chosenYAxis]))

   return circlesGroup;
}

//function for updating STATE labels
function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

   textGroup.transition()
      .duration(1000)
      .attr('x', data => newXScale(data[chosenXAxis]))
      .attr('y', data => newYScale(data[chosenYAxis]));

   return textGroup
}

// //function to stylize x-axis values for tooltips
function styleX(value, chosenXAxis) {

//poverty
if (chosenXAxis === 'poverty') {
      return `${value}%`;
}
//household income
else if (chosenXAxis === 'age') {
      return `${value}`;
}
//income
else {
   return `${value}`;
}
}

// //function to stylize y-axis values for tooltips
function styleY(value, chosenYAxis) {

   //healthcare
   if (chosenYAxis === 'healthcare') {
         return `${value}%`;
   }
   //smokes
   else if (chosenYAxis === 'smokes') {
         return `${value}`;
   }
   //obesity
   else {
      return `${value}`;
   }
   }

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

   // x label
   var xLabel;

   //poverty
   if (chosenXAxis === "poverty") {
      xLabel = "Poverty:";
   } 
   //age
   else if (chosenXAxis === "age") {
      xLabel = "Age:";
   }
   //median income
   else {
      xLabel = "Median Income";
   }

   // y label
   var yLabel;

   //healthcare
   if (chosenYAxis ==='healthcare') {
      yLabel = "Healthcare:"
   }
   // smokes
   else if(chosenYAxis === 'smokes') {
      yLabel = 'Smokes:';
   }
   //obesity
   else{
      yLabel = 'Obese:';
   }

   var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function (data) {
         return (`${data.state}<br>${xLabel} ${styleX(data[chosenXAxis], chosenXAxis)}<br>${yLabel} ${styleY(data[chosenYAxis], chosenYAxis)}`);
      });

   circlesGroup.call(toolTip);

   circlesGroup.on("mouseover", function (data) {
         toolTip.show(data, this);
      })
      // onmouseout event
      .on("mouseout", function (data, index) {
         toolTip.hide(data, this);
      });

   return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("data.csv").then(function (healthData, err) {
   if (err) throw err;

   console.log(healthData);

      // parse data
   healthData.forEach(function (data) {
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.income = +data.income;
      data.healthcare = +data.healthcare;
      data.obesity = +data.obesity;
      data.smokes = +data.smokes;

   });

   // create linear scales
   var xLinearScale= xScale(healthData, chosenXAxis);
   var yLinearScale = yScale(healthData, chosenYAxis);
   
   // Create initial axis functions
   var bottomAxis = d3.axisBottom(xLinearScale);
   var leftAxis = d3.axisLeft(yLinearScale);

   // append x axis
   var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

   // append y axis
   var yAxis = chartGroup.append('g')
      .classed('y-axis', true)
      // .attr("transform", `translate(${height}, 0)`)
      .call(leftAxis);

   // append initial circles
   var circlesGroup = chartGroup.selectAll("circle")
      .data(healthData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 20)
      .attr("fill", "lightblue")
      .attr("opacity", ".5");

   // Create group for x-axis labels
   var xLabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20 + margin.top})`);

   var povertyLabel = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("In Poverty (%)");

   var ageLabel = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Age (Median)");

   var incomeLabel = xLabelsGroup.append("text")
   .attr("x", 0)
   .attr("y", 60)
   .attr("value", "income") // value to grab for event listener
   .classed("inactive", true)
   .text("Income (Median)");

   //create a group for Y labels
   var yLabelsGroup = chartGroup.append('g')
   .attr('transform', `translate(${0 - margin.left/4}, ${height/2})`);

   var healthcareLabel = yLabelsGroup.append('text')
      .classed('aText', true)
      .classed('active', true)
      .attr('x', 0)
      .attr('y', 0 - 20)
      .attr('dy', '1em')
      .attr('transform', 'rotate(-90)')
      .attr('value', 'healthcare')
      .text('Healthcare (%)');
   
   var smokesLabel = yLabelsGroup.append('text')
      .classed('aText', true)
      .classed('inactive', true)
      .attr('x', 0)
      .attr('y', 0 - 40)
      .attr('dy', '1em')
      .attr('transform', 'rotate(-90)')
      .attr('value', 'smokes')
      .text('Smoker (%)');
   
   var obesityLabel = yLabelsGroup.append('text')
      .classed('aText', true)
      .classed('inactive', true)
      .attr('x', 0)
      .attr('y', 0 - 60)
      .attr('dy', '1em')
      .attr('transform', 'rotate(-90)')
      .attr('value', 'obesity')
      .text('Obese (%)');
   

   // updateToolTip function above csv import
   var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
   
   // x axis labels event listener
   xLabelsGroup.selectAll("text")
      .on("click", function () {
         // get value of selection
         var value = d3.select(this).attr("value");
         if (value !== chosenXAxis) {

            // replaces chosenXAxis with value
            chosenXAxis = value;

            // console.log(chosenXAxis)

            // functions here found above csv import
            // updates x scale for new data
            xLinearScale = xScale(healthData, chosenXAxis);

            // updates x axis with transition
            xAxis = renderXAxis(xLinearScale, xAxis);

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            // //update text 
            // textGroupX = renderText(textGroupX, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
            
            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            //change of classes changes text
         if (chosenXAxis === 'poverty') {
            povertyLabel.classed('active', true).classed('inactive', false);
            ageLabel.classed('active', false).classed('inactive', true);
            incomeLabel.classed('active', false).classed('inactive', true);
         }
         else if (chosenXAxis === 'age') {
            povertyLabel.classed('active', false).classed('inactive', true);
            ageLabel.classed('active', true).classed('inactive', false);
            incomeLabel.classed('active', false).classed('inactive', true);
         }
         else {
            povertyLabel.classed('active', false).classed('inactive', true);
            ageLabel.classed('active', false).classed('inactive', true);
            incomeLabel.classed('active', true).classed('inactive', false);
         }
      }
      });
   //y axis lables event listener
   yLabelsGroup.selectAll('text')
      .on('click', function() {
         var value = d3.select(this).attr("value");
         if (value !== chosenYAxis) {
            //replace chosenY with value  
            chosenYAxis = value;

            //update Y scale
            yLinearScale = yScale(healthData, chosenYAxis);

            //update Y axis 
            yAxis = renderYAxis(yLinearScale, yAxis);

            //Udate CIRCLES with new y
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            //update TEXT with new Y values
            // textGroupY = renderText(textGroupY, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            //update tooltips
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            //Change of the classes changes text
            if (chosenYAxis === 'healthcare') {
            healthcareLabel.classed('active', true).classed('inactive', false);
            smokesLabel.classed('active', false).classed('inactive', true);
            obesityLabel.classed('active', false).classed('inactive', true);
            }
            else if (chosenYAxis === 'smokes') {
            healthcareLabel.classed('active', false).classed('inactive', true);
            smokesLabel.classed('active', true).classed('inactive', false);
            obesityLabel.classed('active', false).classed('inactive', true);
            }
            else {
            healthcareLabel.classed('active', false).classed('inactive', true);
            smokesLabel.classed('active', false).classed('inactive', true);
            obesityLabel.classed('active', true).classed('inactive', false);
            }
         }
      });
});
