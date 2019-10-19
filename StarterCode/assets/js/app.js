// D3 Scatter Plot
var displayWidth;
var displayHeight;
var margin; // Margin space for graph
var labelArea;

// Padding
var tPadBot;
var tPadLeft;

// graph vars
var graphImg;

// Dots
var circleRad; // Radius of each circle

//
var leftTextX;
var leftTextY;

// xText
var xText;
var yText;

function setupInitVariables() {
  // Setup arch
  displayWidth = parseInt(d3.select("#plotarea").style("width"));
  displayHeight = displayWidth - displayWidth / 3.9;
  margin = 10;

  // Space for words
  labelArea = 100;

  // Padding at the bottom and left axes for text
  tPadBot = 30;
  tPadLeft = 80;

  leftTextX = margin + tPadLeft;
  leftTextY = (displayHeight + labelArea) / 2 - labelArea;
}

// Create the actual canvas for the graph
function setupGraph() {
  graphImg = d3
    .select("#plotarea")
    .append("svg")
    .attr("width", displayWidth)
    .attr("height", displayHeight)
    .attr("class", "chart");

  // X - Axis
  // We create a group element to nest our bottom axes labels.
  graphImg.append("g").attr("class", "xText");
  graphImg.append("g").attr("class", "yText");
}

function determineCircleRadius() {
  circleRad = displayWidth <= 530 ? 5 : 10;
}

function setupXText() {
  xText = d3.select(".xText");
}

function xTextRefresh() {
  xText.attr(
    "transform",
    "translate(" +
      ((displayWidth - labelArea) / 2 + labelArea) +
      ", " +
      (displayHeight - margin - tPadBot) +
      ")"
  );
}

function initXText() {
  xText
    .append("text")
    .attr("y", -26)
    .attr("data-name", "poverty")
    .attr("data-axis", "x")
    .attr("class", "aText active x")
    .text("In Poverty (%)");
}

function setupYText() {
  yText = d3.select(".yText");
}

function yTextRefresh() {
  yText.attr(
    "transform",
    "translate(" + leftTextX + ", " + leftTextY + ")rotate(-90)"
  );
}

function initYText() {
  yText
    .append("text")
    .attr("y", -26)
    .attr("data-name", "obesity")
    .attr("data-axis", "y")
    .attr("class", "aText active y")
    .text("Obese (%)");
}

setupInitVariables();
setupGraph();
determineCircleRadius();

// Setup x text and refresh to init
setupXText();
xTextRefresh(); // Aligning properly
initXText(); // setting value

// Setup y text and refresh to init
setupYText();
yTextRefresh();
initYText();

// Importing provided CSV data.
d3.csv("assets/data/data.csv").then(function(data) {
  // call visualize method
  visualize(data);
});

function visualize(theData) {
  // xData and yData will determine what data gets represented in each axis.
  // We specify  defaults here, which carry the same names
  // as the headings in their matching .csv data file.
  var xData = "poverty";
  var yData = "obesity";

  // Declare variables for the min and max values of x and y.
  var xMin;
  var xMax;
  var yMin;
  var yMax;

  // Scales for d3 , x and y
  var xScale;
  var yScale;

  // Axis
  var yAxis;
  var xAxis;

  function getToolTip() {
    return d3
      .tip()
      .attr("class", "d3-tip")
      .offset([40, -60])
      .html(function(d) {
        var xTooltipText;
        var state = "<div>" + d.state + "</div>";
        var yTooltipText = "<div>" + yData + ": " + d[yData] + "%</div>";
        if (xData === "poverty") {
          xTooltipText = "<div>" + xData + ": " + d[xData] + "%</div>";
        } else {
          // Grab the x key and a version of the value formatted to include commas after every third digit.
          xTooltipText =
            "<div>" +
            xData +
            ": " +
            parseFloat(d[xData]).toLocaleString("en") +
            "</div>";
        }
        // Display what we capture.
        return state + xTooltipText + yTooltipText;
      });
  }
  function xMinMax() {
    // min will grab the smallest datum from the selected column.
    xMin = d3.min(theData, function(d) {
      return parseFloat(d[xData]) * 0.9;
    });

    // .max will grab the largest datum from the selected column.
    xMax = d3.max(theData, function(d) {
      return parseFloat(d[xData]) * 1.1;
    });
  }

  function yMinMax() {
    // min will grab the smallest datum from the selected column.
    yMin = d3.min(theData, function(d) {
      return parseFloat(d[yData]) * 0.9;
    });

    // max will grab the largest datum from the selected column.
    yMax = d3.max(theData, function(d) {
      return parseFloat(d[yData]) * 1.1;
    });
  }

  // change the classes (and appearance) of label text when clicked.
  function labelChange(axis, clickedText) {
    // Switch the currently active to inactive.
    d3.selectAll(".aText")
      .filter("." + axis)
      .filter(".active")
      .classed("active", false)
      .classed("inactive", true);

    // Switch the text just clicked to active.
    clickedText.classed("inactive", false).classed("active", true);
  }

  function setupScale() {
    xScale = d3
      .scaleLinear()
      .domain([xMin, xMax])
      .range([margin + labelArea, displayWidth - margin]);

    yScale = d3
      .scaleLinear()
      .domain([yMin, yMax])
      .range([displayHeight - margin - labelArea, margin]);
  }

  function setupAxis() {
    xAxis = d3.axisBottom(xScale);
    yAxis = d3.axisLeft(yScale);
  }

  // Determine x and y tick counts.
  // Note: Saved as a function for easy mobile updates.
  function tickCount() {
    if (displayWidth <= 500) {
      xAxis.ticks(5);
      yAxis.ticks(5);
    } else {
      xAxis.ticks(10);
      yAxis.ticks(10);
    }
  }


  // Append axes in group elements. By calling them, we include
  // all of the numbers, borders and ticks.
  // The transform attribute specifies where to place the axes.
  function appendAxes() {
    graphImg
      .append("g")
      .call(xAxis)
      .attr("class", "xAxis")
      .attr(
        "transform",
        "translate(0," + (displayHeight - margin - labelArea) + ")"
      );
    graphImg
      .append("g")
      .call(yAxis)
      .attr("class", "yAxis")
      .attr("transform", "translate(" + (margin + labelArea) + ", 0)");
  }

  // Process
  graphImg.call(getToolTip());
  xMinMax();
  yMinMax();
  setupScale();
  setupAxis();
  tickCount();
  appendAxes();


  // making a grouping for the dots and their labels.
  var theCircles = graphImg
    .selectAll("g theCircles")
    .data(theData)
    .enter();

  // add the circles for each row of data.
  theCircles
    .append("circle")
    // These attr's specify location, size and class.
    .attr("cx", function(d) {
      return xScale(d[xData]);
    })
    .attr("cy", function(d) {
      return yScale(d[yData]);
    })
    .attr("r", circleRad)
    .attr("class", function(d) {
      return "stateCircle " + d.abbr;
    })
    // mouse over and out rules
    .on("mouseover", function(d) {
      // Show the tooltip
      toolTip.show(d, this);
      // Highlight the state circle's border
      d3.select(this).style("stroke", "#323232");
    })
    .on("mouseout", function(d) {
      // Remove the tooltip
      toolTip.hide(d);
      // Remove highlight
      d3.select(this).style("stroke", "#e3e3e3");
    });

  // for the circles in the graph, we need matching labels.
  // Let's get the state abbreviations from our data
  // and place them in the center of our circles.
  theCircles
    .append("text")
    // We return the abbreviation to .text, which makes the text the abbreviation.
    .text(function(d) {
      return d.abbr;
    })
    // Now place the text using our scale.
    .attr("dx", function(d) {
      return xScale(d[xData]);
    })
    .attr("dy", function(d) {
      // push the text into the middle of the circle.
      return yScale(d[yData]) + circleRad / 2.5;
    })
    .attr("font-size", circleRad)
    .attr("class", "stateText")
    // Hover Rules
    .on("mouseover", function(d) {
      // Show the tooltip
      toolTip.show(d);
      // Highlight the state circle's border
      d3.select("." + d.abbr).style("stroke", "#323232");
    })
    .on("mouseout", function(d) {
      // Remove tooltip
      toolTip.hide(d);
      // Remove highlight
      d3.select("." + d.abbr).style("stroke", "#e3e3e3");
    });

  // Select all axis text and add this d3 click event.
  d3.selectAll(".aText").on("click", function() {
    // Save a selection of the clicked text, so we can reference it without typing out the invoker each time.
    var self = d3.select(this);

    if (self.classed("inactive")) {
      // Grab the name and axis saved in label.
      var axis = self.attr("data-axis");
      var name = self.attr("data-name");

      // When x is the saved axis, execute this:
      if (axis === "x") {
        // Make xData the same as the data name.
        xData = name;

        // Change the min and max of the x-axis
        xMinMax();

        // Update the domain of x.
        xScale.domain([xMin, xMax]);

        // Now use a transition when we update the xAxis.
        graphImg
          .select(".xAxis")
          .transition()
          .duration(300)
          .call(xAxis);

        // With the axis changed, let's update the location of the state circles.
        d3.selectAll("circle").each(function() {
          // This will lend the circle a motion
          d3.select(this)
            .transition()
            .attr("cx", function(d) {
              return xScale(d[xData]);
            })
            .duration(300);
        });

        // We need change the location of the state texts, too.
        d3.selectAll(".stateText").each(function() {
          // We give each state text the same motion tween as the matching circle.
          d3.select(this)
            .transition()
            .attr("dx", function(d) {
              return xScale(d[xData]);
            })
            .duration(300);
        });

        // Finally, change the classes of the last active label and the clicked label.
        labelChange(axis, self);
      } else {
        // When y is the saved axis, execute yData the same as the data name.
        yData = name;

        // Change the min and max of the y-axis.
        yMinMax();

        // Update the domain of y.
        yScale.domain([yMin, yMax]);

        // Update Y Axis
        graphImg
          .select(".yAxis")
          .transition()
          .duration(300)
          .call(yAxis);

        // With the axis changed, let's update the location of the state circles.
        d3.selectAll("circle").each(function() {
          // Each state circle gets a transition for it's new attribute.
      
          d3.select(this)
            .transition()
            .attr("cy", function(d) {
              return yScale(d[yData]);
            })
            .duration(300);
        });

        // Changing the location of the state texts.
        d3.selectAll(".stateText").each(function() {
          // We give each state text the same motion tween as the matching circle.
          d3.select(this)
            .transition()
            .attr("dy", function(d) {
              return yScale(d[yData]) + circleRad / 3;
            })
            .duration(300);
        });

        // Finally, change the classes of the last active label and the clicked label.
        labelChange(axis, self);
      }
    }
  });

  // With d3, we can call a resize function whenever the window dimensions change.
  d3.select(window).on("resize", resize);

  // we need to specify what specific parts of the chart need size and position changes.
  function resize() {
    // Redefine the displayWidth, height and leftTextY .
    displayWidth = parseInt(d3.select("#plotarea").style("width"));
    displayHeight = displayWidth - displayWidth / 3.9;
    leftTextY = (displayHeight + labelArea) / 2 - labelArea;

    // Apply the displayWidth and height to the svg canvas.
    graphImg.attr("width", displayWidth).attr("height", displayHeight);

    // Change the xScale and yScale ranges
    xScale.range([margin + labelArea, displayWidth - margin]);
    yScale.range([displayHeight - margin - labelArea, margin]);

    // With the scales changes, update the axes (and the height of the x-axis)
    graphImg
      .select(".xAxis")
      .call(xAxis)
      .attr(
        "transform",
        "translate(0," + (displayHeight - margin - labelArea) + ")"
      );

    graphImg.select(".yAxis").call(yAxis);

    // Update the ticks on each axis.
    tickCount();

    // Update the labels.
    xTextRefresh();
    yTextRefresh();

    // Update the radius of each dot.
    determineCircleRadius();

    // updating the location and radius of the state circles.
    d3.selectAll("circle")
      .attr("cy", function(d) {
        return yScale(d[yData]);
      })
      .attr("cx", function(d) {
        return xScale(d[xData]);
      })
      .attr("r", function() {
        return circleRad;
      });

    // We need change the location and size of the state texts, too.
    d3.selectAll(".stateText")
      .attr("dy", function(d) {
        return yScale(d[yData]) + circleRad / 3;
      })
      .attr("dx", function(d) {
        return xScale(d[xData]);
      })
      .attr("r", circleRad / 3);
  }
}
