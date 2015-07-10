function handler(evt) {
    var target = evt.target, display, newEvt;
    if (target.currentStyle && target.currentStyle.pointerEvents === 'none') {
        display = target.style.display;
        target.style.display = 'none';

        newEvt = document.createEvent('MouseEvent');
        newEvt.initMouseEvent(evt.type, evt.bubbles, evt.cancelable, evt.view, evt.detail,
            evt.screenX, evt.screenY, evt.clientX, evt.clientY, evt.ctrlKey, evt.altKey,
            evt.shiftKey, evt.metaKey, evt.button, evt.relatedTarget);
        document.elementFromPoint(evt.clientX, evt.clientY).dispatchEvent(newEvt);

        target.style.display = display;

        evt.preventDefault();
        evt.stopPropagation();
    }
}

if (navigator.userAgent.match(/MSIE (8|9|10)/)) {
    ['click', 'dblclick', 'mouseup', 'mousedown', 'mousemove'].forEach(function (e) {
        document.addEventListener(e, handler, true);
    });
}
