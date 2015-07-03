import d3 from '../lib/d3';

const width = 280;
const height = 15;

export default class Linechart {
    constructor() {
        //this.el = root.querySelector('.js-linechart');
        //this.el.innerHTML = template;
        
        this.svg = d3.select(".lines")
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
                           .x(function(d) { return this.x(d.range); })
                           .y(function(d) { return this.y(d.count); });
    
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

    update(data) {
        var maxX = d3.max(data, function(d) { return d.range; });

        // Select the section we want to apply our changes to
        //this.svg = d3.select("body").transition();
        
        this.x.domain([0, maxX]);
        this.y.domain([0, d3.max(data, function(d) { return d.count; })]);
        
        this.x.range([0, maxX]);
        this.xAxis.scale(this.x);
        
        this.svg
        .select("path")
        //.duration(500)
        .attr("d", this.valueline(data));
    }
}
