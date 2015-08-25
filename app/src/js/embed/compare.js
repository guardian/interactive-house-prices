import mainHTML from './templates/compare.html!text'

function init(el, config) {
    el.innerHTML = mainHTML.replace(/%assetPath%/g, config.assetPath);
}

var el = document.querySelector('.interactive');
init(el, window.interactiveConfig);
