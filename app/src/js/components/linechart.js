import d3 from '../lib/d3';

export default class Linechart {
    constructor(el, width, height) {
        
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
        this.valueline = d3.svg.line()
                           .x(d => this.x(d.x))
                           .y(d => this.y(d.y));
    
        this.path = this.svg.append("path")
        .attr("class", "line");
        
        /*this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + width + ")")
        .call(this.xAxis);

        this.svg.append("g")
        .attr("class", "y axis")
        .call(this.yAxis);
        */
    }

    update(data, width, height) {
        var maxX = d3.max(data, d => d.x),
            maxY = d3.max(data, d => d.y),
            rangeX = width || maxX/*,
            rangeY = height || 0*/;

        this.x.domain([0, maxX]);
        this.y.domain([0, maxY]);
        
        this.x.range([0, rangeX]);
        this.xAxis.scale(this.x);
        /*if (rangeY !== 0) {
            this.y.range([0, rangeY]);
            this.yAxis.scale(this.y);
        }*/

        this.svg
        .select("path")
        .transition()
        .duration(250)
        .attr("d", this.valueline(data));
        
    }
    
    labels(data) {
        this.svg
        .selectAll("text")
        .data(data)
        .attr("x", d => this.x(d.x)-5)
        .attr("y", d => this.y(d.y)-3)
        .text(d => d.y)
        .enter().append("text")
        .attr("x", d => this.x(d.x)-5)
        .attr("y", d => this.y(d.y)-3)
        .text(d => d.y);
    }
}
