/*CONFIGURATION*/
const config = {
    width: 1100,
    height: 750,
    margin: { top: 80, right: 180, bottom: 50, left: 120 }
};

const TEMP_MIN = 0;
const TEMP_MAX = 40;
let showingMax = true;

// main SVG container
const svg = d3.select("#visualization")
    .append("svg")
    .attr("width", config.width)
    .attr("height", config.height);

/*LOAD AND PROCESS DATA*/
d3.csv("temperature_daily.csv").then(rawData => {
    const parseDate = d3.timeParse("%Y-%m-%d");
    const data = rawData.map(d => {
        const date = parseDate(d.date);
        return {
            date,
            year:  date.getFullYear(),
            month: date.getMonth() + 1,
            max:   +d.max_temperature,
            min:   +d.min_temperature
        };
    });

    const maxYear = d3.max(data, d => d.year);
    const filtered = data.filter(d => d.year >= maxYear - 9);
    const grouped = d3.group(filtered, d => d.year, d => d.month);
    const matrixData = [];
    grouped.forEach((months, year) => {
        months.forEach((days, month) => {
            matrixData.push({
                year,
                month,
                maxDaily: d3.max(days, d => d.max), 
                minDaily: d3.min(days, d => d.min),  
                daily: days                           
            });
        });
    });

    drawMatrix(matrixData);
});

/*DRAW MATRIX*/
function drawMatrix(data) {
    const years = Array.from(new Set(data.map(d => d.year))).sort();
    const monthNames = [
        "January", "February", "March",     "April",
        "May",     "June",     "July",      "August",
        "September","October", "November",  "December"
    ];

    // X scale
    const xScale = d3.scaleBand()
        .domain(years)
        .range([config.margin.left, config.width - config.margin.right])
        .padding(0.05);

    // Y scale
    const yScale = d3.scaleBand()
        .domain(d3.range(1, 13))
        .range([config.margin.top, config.height - config.margin.bottom])
        .padding(0.05);
    const colorScale = d3.scaleSequential()
        .domain([TEMP_MAX, TEMP_MIN])
        .interpolator(d3.interpolateSpectral);

    svg.append("g")
        .attr("transform", `translate(0,${config.margin.top - 10})`)
        .call(d3.axisTop(xScale));

    svg.append("g")
        .attr("transform", `translate(${config.margin.left - 10},0)`)
        .call(d3.axisLeft(yScale)
            .tickFormat(d => monthNames[d - 1])
        );

    const cells = svg.selectAll(".cell")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "cell")
        .attr("transform", d =>
            `translate(${xScale(d.year)},${yScale(d.month)})`
        );

    cells.append("rect")
        .attr("width",  xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("fill",   d => colorScale(d.maxDaily))
        .on("mouseover", (event, d) => showTooltip(event, d))
        .on("mouseout",  hideTooltip)
        .on("click",     () => toggleView());

    cells.each(function(d) {
        // X maps day index across the cell width
        const x = d3.scaleLinear()
            .domain([0, d.daily.length - 1])
            .range([0, xScale.bandwidth()]);

        // Y maps temperature using the global fixed range
        const y = d3.scaleLinear()
            .domain([TEMP_MIN, TEMP_MAX])
            .range([yScale.bandwidth(), 0]);

        // Line generators for max and min daily temperatures
        const lineMax = d3.line().x((dd, i) => x(i)).y(dd => y(dd.max));
        const lineMin = d3.line().x((dd, i) => x(i)).y(dd => y(dd.min));

        const cell = d3.select(this);

        // Max temperature line
        cell.append("path")
            .datum(d.daily)
            .attr("class", "line-max")
            .attr("d", lineMax)
            .attr("stroke", "white")
            .attr("fill", "none")
            .attr("stroke-width", 1.2);

        // Min temperature line
        cell.append("path")
            .datum(d.daily)
            .attr("class", "line-min")
            .attr("d", lineMin)
            .attr("stroke", "white")
            .attr("fill", "none")
            .attr("stroke-width", 1.2)
            .style("display", "none");
    });

    addLegend();
}

/*******************************************************
 * TOGGLE VIEW
 * Switches between max and min temperature display.
 * Updates background colors and the visible mini-line.
 *******************************************************/
function toggleView() {
    showingMax = !showingMax;

    // Rebuild the color scale (Spectral reversed, same as drawMatrix)
    const colorScale = d3.scaleSequential()
        .domain([TEMP_MAX, TEMP_MIN])
        .interpolator(d3.interpolateSpectral);

    // Animate cell background colors to reflect the selected metric
    svg.selectAll(".cell rect")
        .transition()
        .duration(500)
        .attr("fill", d =>
            showingMax ? colorScale(d.maxDaily) : colorScale(d.minDaily)
        );

    // Show only the relevant mini-line
    svg.selectAll(".line-max").style("display", showingMax  ? "block" : "none");
    svg.selectAll(".line-min").style("display", !showingMax ? "block" : "none");
}

/*******************************************************
 * TOOLTIP
 * Displays date and temperature value on mouse hover.
 *******************************************************/
function showTooltip(event, d) {
    const monthFormatted = d.month.toString().padStart(2, "0");

    // Show date + max temperature when viewing max, date + min when viewing min
    const label = showingMax ? "Max Temperature" : "Min Temperature";
    const temp  = showingMax ? d.maxDaily : d.minDaily;

    d3.select("#tooltip")
        .style("opacity", 1)
        .html(`Date: ${d.year}-${monthFormatted}, ${label}: ${temp}`)
        .style("left", (event.pageX + 12) + "px")
        .style("top",  (event.pageY - 24) + "px");
}

function hideTooltip() {
    d3.select("#tooltip").style("opacity", 0);
}

/*******************************************************
 * LEGEND
 * Draws 11 discrete color blocks using Spectral scale.
 * Fixed range 0°C (blue, top) to 40°C (maroon, bottom)
 * matching the professor reference exactly.
 *******************************************************/
function addLegend() {
    const legendConfig = {
        height:    250,
        width:     20,
        steps:     11,
        x: config.width - config.margin.right + 50,
        y: config.margin.top
    };

    const legend = svg.append("g")
        .attr("transform",
            `translate(${legendConfig.x},${legendConfig.y})`
        );

    const stepHeight = legendConfig.height / legendConfig.steps;

    // Draw discrete color blocks from top (0°C = blue) to bottom (40°C = maroon)
    // Spectral reversed: t goes from 1.0 (blue, top) down to 0.0 (maroon, bottom)
    for (let i = 0; i < legendConfig.steps; i++) {
        const t = 1 - (i / (legendConfig.steps - 1)); 
        legend.append("rect")
            .attr("x",      0)
            .attr("y",      i * stepHeight)
            .attr("width",  legendConfig.width)
            .attr("height", stepHeight)
            .attr("fill",   d3.interpolateSpectral(t));
    }

    // Top label
    legend.append("text")
        .attr("x", legendConfig.width + 8)
        .attr("y", 0)
        .attr("dominant-baseline", "hanging")
        .style("font-size", "13px")
        .text("0 Celsius");

    // Bottom label
    legend.append("text")
        .attr("x", legendConfig.width + 8)
        .attr("y", legendConfig.height)
        .attr("dominant-baseline", "ideographic")
        .style("font-size", "13px")
        .text("40 Celsius");
}