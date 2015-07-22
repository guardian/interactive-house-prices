import d3 from '../lib/d3';

export default class Linechart {
    constructor(el, width, height, isAxis) {
        
        this.width = width;
        this.height = height;

        this.svg = d3.select(el)
                     .append("svg")
                     .attr("width", width)
                     .attr("height", height+8)
                     .append("g")
                     .attr("transform", "translate(0," + 10 + ")");
        
        // Set the ranges
        this.x = d3.scale.linear().range([0, width-30]);
        this.y = d3.scale.linear().range([height-10, 0]);

        // Define the axes
        this.xAxis = d3.svg.axis().scale(this.x)
                       .orient("bottom");//.ticks(6);
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
    
        if (isAxis) {
        this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height-8) + ")")
        .call(this.xAxis);
        }
    }

 
    updatePath(data, className, lineType) {        
        this.svg
        .select("." + className).datum(data)
        .transition().duration(250)
        .attr("d", this.valueline(lineType)); 
    }
   
    updateLine(data, className, lineType) {
        var num = data.length,
            minX = data[0].x,
            maxX = data[num-1].x, 
            maxY = d3.max(data, d => d.y),
            cn = className || "line";
        
        this.x.domain([minX, maxX]).range([0, this.width]);
        this.y.domain([0, maxY]);
       
        this.updatePath(data, cn, lineType);
    }   
    
    updateMask(data, className, lineType, min, max) {        
        var num = data.length,
            minX = data[0].x, 
            maxX = data[num-1].x, 
            maxY = d3.max(data, d => d.y),
            minRange = min || minX,
            maxRange = max || maxX,
            cn = className || "line";

        var dataMask = [
            data[num-1],
            {x: this.width, y: data[num-1].y}, 
            {x: this.width, y: maxY}, 
            {x: -0, y: maxY},
            {x: 0, y: data[0].y}
        ].concat(data); 
        
        this.x.domain([minX, maxX]).range([minRange, maxRange]);
        this.y.domain([0, maxY]);
       
        this.updatePath(dataMask, cn, lineType);
    }
    
    
    updateAxis(data) {
        var num = data.length,
            dataTick = data.map((d, i) =>
            (280/num)*i
        );       
        
        this.xAxis
        .tickValues(dataTick);
        
        this.svg
        .select(".x.axis")
        .call(this.xAxis);
        
        //TODO: debug!
        this.svg
        .select(".x.axis .domain")
        .attr("d", "M0,6V0H"+dataTick[dataTick.length-1]+"V6");
    }
    
    updateLabels(data) {
        
        var label = this.svg
        .selectAll(".label").data(data)
        .attr("x", d => this.x(d.x)-5)
        .attr("y", d => this.y(d.y)-3)
        .text(d => d.y);
        
        label.enter().append("text")
        .attr("class", "label")
        .attr("x", d => this.x(d.x)-5)
        .attr("y", d => this.y(d.y)-3)
        .text(d => d.y);

        label.exit().remove();
    }
}
