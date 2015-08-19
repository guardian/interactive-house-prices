import throttle from './throttle';

function getOffset(el) {
    return el ? el.offsetTop + getOffset(el.offsetParent) : 0;
}

export default function stickyBar(el, anchorEl, flagEl) {
    var sticky = false;

    var eventHandler = throttle(function () {
        var newSticky = window.pageYOffset >= getOffset(anchorEl);
        if (newSticky != sticky) {
            sticky = newSticky;
            if (sticky) {
                el.className += ' is-sticky';
                if (flagEl) flagEl.className += ' has-sticky';
            } else {
                el.className = el.className.replace(/is-sticky/g, '').trim();
                if (flagEl) flagEl.className = flagEl.className.replace(/has-sticky/g, '').trim();
            }
        }
    });

    document.addEventListener('scroll', eventHandler);
    window.addEventListener('resize', eventHandler);
}
