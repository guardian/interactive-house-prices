import mainHTML from './templates/compare.html!text'

function init(el, config) {
    el.innerHTML = mainHTML;
}

var el = document.querySelector('.interactive');
init(el, window.interactiveConfig);
