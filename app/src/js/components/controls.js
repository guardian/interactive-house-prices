import madlib from '../lib/madlib';
import template from './templates/controls.html!text';

export default function Controls(el, tooltip, map, currentValue) {
    function init() {
        el.innerHTML += template;
        
        madlib(el.querySelector('.js-location'), [], () => true, v => v, v => v, postcode => {
            if (postcode.length > 0) {
                var district = (postcode.length > 4 ? postcode.substring(0, postcode.length - 3) : postcode)
                .trim().toUpperCase();
                tooltip.show(currentValue, district);
                //tooltip.show(wentValue, district, coordi);
                map.flyToDistrict(district);
            } else {
                tooltip.hide();
            }
        });

        // test: icon-clear
        el.querySelector('.icon-clear').addEventListener('click', evt => {
            tooltip.hide();
        });
    }

    init();
}
