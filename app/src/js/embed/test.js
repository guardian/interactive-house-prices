import madlib from '../lib/madlib'

import mainHTML from './templates/test.html!text'

function init(el, config) {
    el.innerHTML = mainHTML;

    madlib(el.querySelector('.js-input'), [], () => true, v => v, v => v, () => {});
}

var el = document.querySelector('.interactive');
init(el, window.interactiveConfig);
