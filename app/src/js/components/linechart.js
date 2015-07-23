import d3 from '../lib/d3';

export default class Linechart {
    constructor(elClassName, styleClassName, width, height, marginTop, marginBottom, isAxis) {
        
        this.width = width;
        this.height = height;

        this.svg = d3.select("." + elClassName)
                     .append("svg")
                     .attr("width", width)
                     .attr("height", height + marginTop)
                     .append("g")
                     .attr("transform", "translate(0," + marginTop + ")");
        
        // Set the ranges
        this.x = d3.scale.linear().range([0, width]);
        this.y = d3.scale.linear().range([height - marginTop, 0]);

        // Define the axes
        this.xAxis = d3.svg.axis().scale(this.x).orient("bottom");
        this.yAxis = d3.svg.axis().scale(this.y).orient("left");

        // Define the line
        this.valueline = (type =>
            d3.svg.line()
            .x(d => this.x(d.x))
            .y(d => this.y(d.y))
            .interpolate(type)
        );

        this.svg.append("path")
        .attr("class", styleClassName);
    
        if (isAxis) {
        this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height - marginTop + 2) + ")")
        .call(this.xAxis);
        }
    }

   
    updateLine(data, el, lineType, minRange, maxRange) {
        var num = data.length,
            rangeX = [ 
                minRange || 0,
                maxRange || this.width
            ], 
            domainX = [ 
                minRange || data[0].x,
                maxRange || data[num-1].x
            ],
            domainY = [0, d3.max(data, d => d.y)];
       
        this.x.domain(domainX).range(rangeX);
        this.y.domain(domainY);

        this.svg
        .select("." + el).datum(data)
        .transition().duration(250)
        .attr("d", this.valueline(lineType));    
    }   
    
    updateMask(data, el, lineType) {        
        var num = data.length,
            minX = data[0].x,
            maxX = data[num-1].x, 
            maxY = d3.max(data, d => d.y);

        var dataMask = [
            data[num-1],
            {x: this.width, y: data[num-1].y}, 
            {x: this.width, y: maxY}, 
            {x: -0, y: maxY},
            {x: 0, y: data[0].y}
        ].concat(data); 
        
        this.updateLine(dataMask, el, lineType, minX, maxX);
    }
    
    
    updateAxis(data) {
        var num = data.length,
            dataTick = data.map((d, i) =>
            (this.width/num)*i
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
