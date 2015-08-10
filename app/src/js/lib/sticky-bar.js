import throttle from './throttle'

function getOffset(el) {
    return el ? el.offsetTop + getOffset(el.offsetParent) : 0;
}

export default function stickybar(el, anchorEl) {
    var sticky = false;

    var eventHandler = throttle(function () {
        var newSticky = window.pageYOffset >= getOffset(el.parentNode) + anchorEl.offsetTop;
        if (newSticky != sticky) {
            sticky = newSticky;
            if (sticky) {
                el.className += ' is-sticky';
                anchorEl.className += ' is-sticky';
            } else {
                el.className = el.className.replace(/is-sticky/g, '').trim();
                anchorEl.className = anchorEl.className.replace(/is-sticky/g, '').trim();
            }
        }
    });

    document.addEventListener('scroll', eventHandler);
    window.addEventListener('resize', eventHandler);
}
