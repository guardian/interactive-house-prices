import throttle from './throttle';

function getOffset(el) {
    return el ? el.offsetTop + getOffset(el.offsetParent) : 0;
}

var bottomNotSticky;
function getBottomNotSticky() {
    return bottomNotSticky;
}
export function setBottomNotSticky(value) {
    bottomNotSticky = value;
}

export function stickyBar(el, anchorEl) {
    var sticky = false;

    var thumbEl = document.querySelector('.hp-range-slider__thumb');

    var eventHandler = throttle(function () {
        var newSticky = window.pageYOffset >= getOffset(el.parentNode) + anchorEl.offsetTop;
        if (newSticky != sticky) {
            sticky = newSticky;
            if (sticky) {
                el.className += ' is-sticky';
                anchorEl.className += ' is-sticky';
                setBottomNotSticky(thumbEl.style.bottom);
                thumbEl.style.bottom = "25px";
            } else {
                el.className = el.className.replace(/is-sticky/g, '').trim();
                anchorEl.className = anchorEl.className.replace(/is-sticky/g, '').trim();
                thumbEl.style.bottom = getBottomNotSticky();
            }
        }
    });

    document.addEventListener('scroll', eventHandler);
    window.addEventListener('resize', eventHandler);
}
