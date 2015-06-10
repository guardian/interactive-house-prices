import areaName from '../data/areas-name.json!json';
import areaPrice from '../data/areas-prices-2014.json!json';
import sectorPrice from '../data/sector-prices-2013.json!json';
import wageYear from '../data/wages.json!json';

import {find} from '../components/polyfill';

const year = 2013;
const min = 7000;
const max = 50000000;


function hideTooltip() {
    var tp = document.querySelector(".js-tooltip");
    tp.style.left = "-300px";    
    tp.style.top = "-300px";
}

function showTooltip(e) {
    var layer = e.target,
        postcodeArea = layer.feature.id;

    /* data */
    /*var avg, region, median,
        num = 0, sum = 0, fac = 0,
        max = 0, min = 1000000;

    // calc of areas and distrcts from sectors
    sectorPrice
    .filter(d => d.postcode.indexOf(postcodeArea) !== -1)
    .forEach(d => {
        num += d.num;
        sum += d.num*d.avg;
        fac += d.num*d.factor;
        min = (d.min < min) ? d.min : min;
        max = (d.max > max) ? d.max : max;
        region = d.region;
    });
    // format data
    min = min.toLocaleString();
    max = max.toLocaleString();
    avg = Math.round(sum/num).toLocaleString();
    fac = Math.round(fac*100/num)/100;
    */
    // get index from col array
    var idx;
    areaPrice.postcode.forEach((a, i) => { 
        if (a.indexOf(postcodeArea) !== -1) {
            idx = i;
        }
    });

    var avg = areaPrice.avg[idx].toLocaleString(),
        min = areaPrice.min[idx].toLocaleString(),
        max = areaPrice.max[idx].toLocaleString(),
        med = areaPrice.median[idx].toLocaleString(),
        fac = Math.round(areaPrice.median[idx] / wageYear[2014]);
   

    /* tooltip */
    var w = window,
        d = document;

    var tp = d.querySelector(".js-tooltip");
    tp.style.left = w.event.pageX + "px";    
    tp.style.top = w.event.pageY + "px";
    //tp.style.right = "10px";    
    //tp.style.top = "10px";

    var salary = Math.round(wageYear[2014]),//[region],
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

    var nl = d.querySelectorAll(".js-salary"),
        al = Array.prototype.slice.call(nl); // convert NodeList to Array
    al.forEach(s => { s.textContent = salary.toLocaleString(); });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
}


export var tooltip = {
    hide: hideTooltip,
    show: showTooltip
};

