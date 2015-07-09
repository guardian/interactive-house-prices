import d3 from '../lib/d3';

const Width = 280;
const Height = 15;

export default class Linechart {
    constructor(el, width, height) {
        //this.el = root.querySelector('.js-linechart');
        //this.el.innerHTML = template;
        
        this.svg = d3.select(el)
                     .append("svg")
                     .attr("width", width)
                     .attr("height", height);

        // Set the ranges
        this.x = d3.scale.linear().range([0, width]);
        this.y = d3.scale.linear().range([height, 0]);

        // Define the axes
        this.xAxis = d3.svg.axis().scale(this.x)
                       .orient("bottom").ticks(6);
        this.yAxis = d3.svg.axis().scale(this.y)
                       .orient("left").ticks(8);

        // Define the line
        this.valueline = d3.svg.line()
                           .x(function(d) { return this.x(d.x); })
                           .y(function(d) { return this.y(d.y); });
    
        this.svg
        .append("path")
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
        var maxX = d3.max(data, function(d) { return d.x; }),
            maxY = d3.max(data, function(d) { return d.y; }),
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
}
