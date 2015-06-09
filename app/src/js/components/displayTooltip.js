import areaName from '../data/areas-name.json!json';
import pricesJson from '../data/sector-prices-2014.json!json';
import wageYear from '../data/wages.json!json';

const year = 2014;


export var tooltip = {
    hide: hideTooltip,
    show: showTooltip
};

function hideTooltip() {
    var tp = document.querySelector(".js-tooltip");
    tp.style.left = "-300px";    
    tp.style.top = "-300px";
}

function showTooltip(e) {
    var layer = e.target,
        postcodeArea = layer.feature.id;

    /* data */
    var avg, region,
    num = 0, sum = 0, fac = 0,
        max = 0, min = 1000000;

    // calc of areas and distrcts from sectors
    pricesJson
    .filter(d => d.postcode.indexOf(postcodeArea) !== -1)
    .forEach(d => {
        num += d.num;
        sum += d.num*d.avg;
        fac += d.num*d.factor;
        min = (d.min < min) ? d.min : min;
        max = (d.max > max) ? d.max : max;
        region = d.region;
    });

    min = min.toLocaleString();
    max = max.toLocaleString();
    avg = Math.round(sum/num).toLocaleString();
    fac = Math.round(fac*100/num)/100;
    /*
       console.log("num:", num);
       console.log("min:", min, "max:", max);
       console.log("avg:", avg);
       console.log("fac:", fac);
       */

    /* tooltip */
    var w = window,
        d = document;

    var tp = d.querySelector(".js-tooltip");
    tp.style.left = w.event.pageX + "px";    
    tp.style.top = w.event.pageY + "px";
    //tp.style.right = "10px";    
    //tp.style.top = "10px";

    var salary = wageYear[year][region],
        result = Math.round(salary*fac).toLocaleString(),
        range1 = Math.round(salary*6).toLocaleString(),
        range2 = Math.round(salary*12).toLocaleString();

    d.querySelector(".js-region").textContent = areaName[postcodeArea] + " [" + postcodeArea +/*","+region+*/ "]"; 
    d.querySelector(".js-result").textContent = result;
    d.querySelector(".js-range1").textContent = range1;
    d.querySelector(".js-range2").textContent = range2;
    d.querySelector(".js-factor").textContent = fac;    
    d.querySelector(".js-min").textContent = min;    
    d.querySelector(".js-avg").textContent = avg;    
    d.querySelector(".js-max").textContent = max;    

    var s = d.querySelectorAll(".js-salary");
    s[0].textContent = salary.toLocaleString();
    s[1].textContent = salary.toLocaleString();
    s[2].textContent = salary.toLocaleString();

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
}
