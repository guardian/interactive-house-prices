import d3 from '../lib/d3';

export default function Linechart(elClassName, styleClassName, width, height, marginTop, marginBottom, isAxis) {
    var svg, x, y, xAxis, yAxis, valueline;

    function init() {
        svg = d3.select("." + elClassName)
                     .append("svg")
                     .attr("width", width)
                     .attr("height", height + marginTop)
                     .append("g")
                     .attr("transform", "translate(0," + marginTop + ")");

        // Set the ranges
        x = d3.scale.linear().range([0, width]);
        y = d3.scale.linear().range([height - marginTop, 0]);

        // Define the axes
        xAxis = d3.svg.axis().scale(x).orient("bottom");
        yAxis = d3.svg.axis().scale(y).orient("left");

        // Define the line
        valueline = (type =>
            d3.svg.line()
            .x(d => x(d.x))
            .y(d => y(d.y))
            .interpolate(type)
        );

        svg.append("path")
            .attr("class", styleClassName);

        if (isAxis) {
            svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (height - marginTop + 2) + ")")
            .call(xAxis);
        }
    }

    this.updateLine = function(data, el, rangeX, rangeY, lineType) {
        var num = data.length,
            domainX = (rangeX !== undefined && rangeX !== null) ? rangeX : [data[0].x, data[num-1].x],
            domainY = (rangeY !== undefined && rangeY !== null) ? rangeY : [0, d3.max(data, d => d.y)];
        
        x.domain(domainX); if (rangeX) { x.range(rangeX); }
        y.domain(domainY);
        
        svg.select("." + el).datum(data)
            .transition().duration(250)
            .attr("d", valueline(lineType));
    };

    this.updateMask = function(data, el, lineType, hasOutlier) {
        var num = data.length,
            minX = data[0].x,
            maxX = data[num-1].x,
            maxY = d3.max(data, d => d.y),
            dataMask;
        
        if (hasOutlier) {
            dataMask = [
                {x: width-30, y: data[num-1].y},
                {x: width, y: data[num-1].y},
                {x: width, y: maxY},
                {x: -0, y: maxY},
                {x: 0, y: data[0].y}
            ].concat(data.slice(0, -1), {x: width-30, y: data[num-1].y});
        } else {
            dataMask = [
                {x: width, y: 0},
                {x: width, y: maxY},
                {x: -0, y: maxY},
                {x: 0, y: data[0].y}
            ].concat(data.slice(0, -1), {x: width, y: 0}, {x: width, y: 0});
        }

        this.updateLine(dataMask, el, [minX, maxX], null, lineType);
    };

    this.updateAxis = function(data, axisWidth) {
        var num = data.length,
            dataTick = data.map((d, i) =>
            i*axisWidth/num
        );

        xAxis.tickValues(dataTick);

        svg.select(".x.axis")
            .call(xAxis);

        //TODO: debug!
        svg.select(".x.axis .domain")
            .attr("d", "M0,6V0H"+axisWidth+"V6");
    };

    this.updateLabels = function(data) {
        var label = svg.selectAll(".label")
            .data(data)
            .attr("x", d => x(d.x)-5)
            .attr("y", d => y(d.y)-3)
            .text(d => d.y);

        label.enter().append("text")
            .attr("class", "label")
            .attr("x", d => x(d.x)-5)
            .attr("y", d => y(d.y)-3)
            .text(d => d.y);

        label.exit().remove();
    };

    init();
}
