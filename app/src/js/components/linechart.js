import d3 from '../lib/d3';

export default class Linechart {
    constructor(el, width, height) {
        
        this.width = width;
        this.height = height;

        this.svg = d3.select(el)
                     .append("svg")
                     .attr("width", width)
                     .attr("height", height)
                     .append("g")
                     .attr("transform", "translate(0," + 10 + ")");
        
        // Set the ranges
        this.x = d3.scale.linear().range([0, width-30]);
        this.y = d3.scale.linear().range([height-10, 0]);

        // Define the axes
        this.xAxis = d3.svg.axis().scale(this.x)
                       .orient("bottom").ticks(6);
        this.yAxis = d3.svg.axis().scale(this.y)
                       .orient("left").ticks(8);

        // Define the line
        this.valueline = (type =>
                 d3.svg.line()
                .x(d => this.x(d.x))
                .y(d => this.y(d.y))
                .interpolate(type)
        );

        this.svg.append("path")
        .attr("class", "line");
        
        this.svg.append("path")
        .attr("class", "line-mask");
    }

    updateMask(data, className, lineType) {        
        var num = data.length,
            minX = data[0].x, 
            maxX = data[num-1].x, 
            maxY = d3.max(data, d => d.y),
            cn = className || "line";

        var dataMask = [
            {x: this.width, y: data[num-1].y}, 
            {x: this.width, y: maxY}, 
            {x: -0, y: maxY},
            {x: 0, y: data[0].y}
        ].concat(data); 
        
        this.x.domain([minX, maxX]).range([minX, maxX]);
        this.y.domain([0, maxY]);

        this.updatePath(dataMask, cn, lineType);
    }

    updatePath(data, className, lineType) {        
        this.svg
        .select("." + className).datum(data)
        .transition().duration(250)
        .attr("d", this.valueline(lineType)); 
    }
    
    updateLabels(data) {
        
        var label = this.svg
        .selectAll("text").data(data)
        .attr("x", d => this.x(d.x)-5)
        .attr("y", d => this.y(d.y)-2)
        .text(d => d.y);
        
        label.enter().append("text")
        .attr("x", d => this.x(d.x)-5)
        .attr("y", d => this.y(d.y)-2)
        .text(d => d.y);

        label.exit().remove();
    }
}
