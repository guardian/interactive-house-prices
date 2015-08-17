import madlib from '../lib/madlib';
import template from './templates/controls.html!text';

export default function Controls(el, map) {
    function init() {
        el.innerHTML += template;
        /*madlib(el.querySelector('.hp-location'), [], () => true, v => v, v => v, postcode => {
            var district = postcode; //TODO
            console.log(districtLayer.getLayers());
            map.flyToBounds(districtLayer.getLayers()[0]._bounds);
        });*/

    }

    init();
}
