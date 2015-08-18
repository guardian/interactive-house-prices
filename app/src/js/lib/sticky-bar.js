import throttle from './throttle';

function getOffset(el) {
    return el ? el.offsetTop + getOffset(el.offsetParent) : 0;
}

export default function stickyBar(el, anchorEl) {
    var sticky = false;
    var parentEl = el.parentNode;

    var eventHandler = throttle(function () {
        var newSticky = window.pageYOffset >= getOffset(parentEl) + anchorEl.offsetTop;
        if (newSticky != sticky) {
            sticky = newSticky;
            if (sticky) {
                el.className += ' is-sticky';
                parentEl.className += ' has-sticky';
            } else {
                el.className = el.className.replace(/is-sticky/g, '').trim();
                parentEl.className = parentEl.className.replace(/has-sticky/g, '').trim();
            }
        }
    });

    document.addEventListener('scroll', eventHandler);
    window.addEventListener('resize', eventHandler);
}
