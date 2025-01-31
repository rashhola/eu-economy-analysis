// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
function gdpBarChart () {

  var svg = d3.select("#barchart")
    .append("svg")
    .attr("width", 960)
    .attr("height", 600);

  // Duration is in miliseconds. It tells you how long the transition last when you call the Duration
  var tickDuration = 1500;

  var top_n = 12;
  var height = 600;
  var width = 960;

  const margin = {
    top: 80,
    right: 0,
    bottom: 5,
    left: 2
  };

  var barPadding = (height - (margin.bottom + margin.top)) / (top_n * 5);


  // var title = svg.append('text')
  //   .attr('class', 'title')
  //   .attr('y', 24)
  //   .html('Top 12 European Union countries, GDP per capita');

  // var subTitle = svg.append("text")
  //   .attr("class", "subTitle")
  //   .attr("y", 55)
  //   .html("Value in USD currency");

  // var caption = svg.append('text')
  //   .attr('class', 'caption')
  //   .attr('x', width)
  //   .attr('y', height - 5)
  //   .style('text-anchor', 'end')
  //   .html('Source: <a href="https://datacatalog.worldbank.org/search?sort_by=field_wbddh_modified_date&sort_order=DESC&f%5B0%5D=field_license_wbddh%3A1335/">Worldbank</a>');





  var year = 2005;
  var pause = false;

  d3.json("appBar").then(function (data) {
    //if (error) throw error;


    function updateChart() {

      if (year > 2019) {

        return
      }

      d3.select("#slider").property("value", year)
      d3.select("#range").html(year)

      yearSlice = data.filter(d => d.year == year)

        .sort((a, b) => b.value - a.value)
        .slice(0, top_n);

      yearSlice.forEach((d, i) => d.rank = i);

      //console.log('IntervalYear: ', yearSlice);

      x.domain([0, d3.max(yearSlice, d => d.value)]);

      svg.select('.xAxis')
        .transition()
        .duration(tickDuration)
        .ease(d3.easeLinear)
        .call(xAxis);

      var bars = svg.selectAll('.bar').data(yearSlice, d => d.name);

      bars
        .enter()
        .append('rect')
        .attr('class', d => `bar ${d.name.replace(/\s/g, '_')}`)
        .attr('x', x(0) + 1)
        .attr('width', d => x(d.value) - x(0) - 1)
        .attr('y', d => y(top_n + 1) + 5)
        .attr('height', y(1) - y(0) - barPadding)
        .style('fill', d => d.colour)
        .transition()
        .duration(tickDuration)
        .ease(d3.easeLinear)
        .attr('y', d => y(d.rank) + 5);

      bars
        .transition()
        .duration(tickDuration)
        .ease(d3.easeLinear)
        .attr('width', d => x(d.value) - x(0) - 1)
        .attr('y', d => y(d.rank) + 5);

      bars
        .exit()
        .transition()
        .duration(tickDuration)
        .ease(d3.easeLinear)
        .attr('width', d => x(d.value) - x(0) - 1)
        .attr('y', d => y(top_n + 1) + 5)
        .remove();

      var labels = svg.selectAll('.label')
        .data(yearSlice, d => d.name);

      labels
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', d => x(d.value) - 8)
        .attr('y', d => y(top_n + 1) + 5 + ((y(1) - y(0)) / 2))
        .style('text-anchor', 'end')
        .html(d => d.name)
        .transition()
        .duration(tickDuration)
        .ease(d3.easeLinear)
        .attr('y', d => y(d.rank) + 5 + ((y(1) - y(0)) / 2) + 1);


      labels
        .transition()
        .duration(tickDuration)
        .ease(d3.easeLinear)
        .attr('x', d => x(d.value) - 8)
        .attr('y', d => y(d.rank) + 5 + ((y(1) - y(0)) / 2) + 1);

      labels
        .exit()
        .transition()
        .duration(tickDuration)
        .ease(d3.easeLinear)
        .attr('x', d => x(d.value) - 8)
        .attr('y', d => y(top_n + 1) + 5)
        .remove();



      var valueLabels = svg.selectAll('.valueLabel').data(yearSlice, d => d.name);

      valueLabels
        .enter()
        .append('text')
        .attr('class', 'valueLabel')
        .attr('x', d => x(d.value) + 5)
        .attr('y', d => y(top_n + 1) + 5)
        .text(d => d3.format(',.0f')(d.lastValue))
        .transition()
        .duration(tickDuration)
        .ease(d3.easeLinear)
        .attr('y', d => y(d.rank) + 5 + ((y(1) - y(0)) / 2) + 1);

      //  This is  what makes the numbers have the animation where they continuously change instead of change suddenly.

      valueLabels
        .transition()
        .duration(tickDuration)
        .ease(d3.easeLinear)
        .attr('x', d => x(d.value) + 5)
        .attr('y', d => y(d.rank) + 5 + ((y(1) - y(0)) / 2) + 1)
        .tween("text", function (d) {
          var i = d3.interpolateRound(d.lastValue, d.value);
          return function (t) {
            this.textContent = d3.format(',')(i(t));
          };
        });


      valueLabels
        .exit()
        .transition()
        .duration(tickDuration)
        .ease(d3.easeLinear)
        .attr('x', d => x(d.value) + 5)
        .attr('y', d => y(top_n + 1) + 5)
        .remove();




    }

    function tickerUpdate(e) {
      updateChart()
      if (year == 2019) ticker.stop();
      year = +year + 1;
    }

    console.log(data);

    // change number by converting the number into integer (preprocessing)
    data.forEach(d => {
      d.value = +d.value,
        d.lastValue = +d.lastValue,
        //d.value = isNaN(d.value) ? 0 : d.value,
        d.year = +d.year,
        d.colour = d3.hsl(Math.random() * 360, 0.75, 0.75)
    });

    console.log(data);

    var yearSlice = data.filter(d => d.year == year)
      //sort when the year stats
      .sort((a, b) => b.value - a.value)
      .slice(0, top_n);

    yearSlice.forEach((d, i) => d.rank = i);

    console.log('yearSlice: ', yearSlice)

    var x = d3.scaleLinear()
      .domain([0, d3.max(yearSlice, d => d.value)])
      .range([margin.left, width - margin.right - 65]);

    var y = d3.scaleLinear()
      .domain([top_n, 0])
      .range([height - margin.bottom, margin.top]);

    var xAxis = d3.axisTop()
      .scale(x)
      .ticks(width > 500 ? 5 : 2)
      .tickSize(-(height - margin.top - margin.bottom))
      .tickFormat(d => d3.format(',')(d));

    svg.append('g')
      .attr('class', 'axis xAxis')
      .attr('transform', `translate(0, ${margin.top})`)
      .call(xAxis)
      .selectAll('.tick line')
      .classed('origin', d => d == 0);

    svg.selectAll('rect.bar')
      .data(yearSlice, d => d.name)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', x(0) + 1)
      .attr('width', d => x(d.value) - x(0) - 1)
      .attr('y', d => y(d.rank) + 5)
      .attr('height', y(1) - y(0) - barPadding)
      .style('fill', d => d.colour);

    svg.selectAll('text.label')
      .data(yearSlice, d => d.name)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => x(d.value) - 8)
      .attr('y', d => y(d.rank) + 5 + ((y(1) - y(0)) / 2) + 1)
      .style('text-anchor', 'end')
      .html(d => d.name);

    // var flag = svg.append("image")
    //   .attr("xlink:src", "https://upload.wikimedia.org/wikipedia/en/thumb/c/c3/Flag_of_France.svg/320px-Flag_of_France.svg.png")
    //   .attr('x', 250)
    //   .attr('y', 250)
    //   .attr("width", 150)
    //   .attr("height", 150);


    svg.selectAll('text.valueLabel')
      .data(yearSlice, d => d.name)
      .enter()
      .append('text')
      .attr('class', 'valueLabel')
      .attr('x', d => x(d.value) + 5)
      .attr('y', d => y(d.rank) + 5 + ((y(1) - y(0)) / 2) + 1)
      .text(d => d3.format(',.0f')(d.lastValue));






    // This is when the animation happens
    var ticker = d3.interval(tickerUpdate, tickDuration);

    d3.select("#slider").on("change", function () {
      year = +d3.select("#slider").property("value")
      d3.select("#range").html(year);
      updateChart()
      pause = true
      ticker.stop()
    });

    d3.select("#play").on("click", function () {
      // year = 2005
      // d3.select("#range").html(year);
      // d3.select("#slider").property("value", 2005);
      if (!pause) {
        pause = true
        ticker.stop()
      }
      else {
        ticker = d3.interval(tickerUpdate, tickDuration)
        pause = false
      }

    });

  });

  const halo = function (text, strokeWidth) {
    text.select(function () { return this.parentNode.insertBefore(this.cloneNode(true), this); })
      .style('fill', '#ffffff')
      .style('stroke', '#ffffff')
      .style('stroke-width', strokeWidth)
      .style('stroke-linejoin', 'round')
      .style('opacity', 1);



  }

}

gdpBarChart ();