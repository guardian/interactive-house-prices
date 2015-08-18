import madlib from '../lib/madlib';
import template from './templates/controls.html!text';

export default function Controls(el, map) {
    function init() {
        el.innerHTML += template;

        madlib(el.querySelector('.js-location'), [], () => true, v => v, v => v, postcode => {
            if (postcode.length > 0) {
                let district = (postcode.length > 4 ? postcode.substring(0, postcode.length - 3) : postcode)
                map.flyToDistrict(district.trim().toUpperCase());
            }
        });

        if ('geolocation' in navigator) {
            let userLocationEl = el.querySelector('.js-user-location');
            userLocationEl.style.display = 'block';
            userLocationEl.addEventListener('click', () => {
                navigator.geolocation.getCurrentPosition(function (position) {
                    map.flyToPosition(position.coords.latitude, position.coords.longitude);
                });
            });
        }
    }

    init();
}
