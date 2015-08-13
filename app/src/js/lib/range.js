import Hammer from './hammer.min'

function tics(min, max, ticStep) {
    var range = max - min;
    var v, tics = document.createElement('div');
    tics.className = 'hp-range-slider__tics';

    function tic(v, major) {
        var t = document.createElement('div');
        t.className = 'hp-range-slider__tics__tic';
        t.style.left = (v / range * 100) + '%';
        if (major) {
            t.className += ' hp-range-slider__tics__tic--major';
            t.innerHTML = `<span>${v + min}</span>`;
        }
        tics.appendChild(t);
    }

    for (v = 0; v < range; v++) {
        tic(v, v % ticStep === 0);
    }
    // Always have an end tic
    tic(range, true);

    return tics;
}


export default function (el, min, max, onchange, ticStep) {
    var range = max - min;

    var thumb = el.querySelector('.hp-range-slider__thumb');
    var thumbline = el.querySelector('.hp-range-slider__thumbline');
    var xMin, xWidth, xStep;
    // Attempting to reduce scroll interference
    var scrollY, isFirst;

    var value;

    if (ticStep !== undefined) {
        el.appendChild(tics(min, max, ticStep));
    }

    function premove(evt) {
        var rect = el.getBoundingClientRect();
        xMin = rect.left;
        xWidth = rect.width;
        xStep = xWidth / range;
        scrollY = window.pageYOffset;
        isFirst = true;

        if (evt.type === 'panstart') {
            document.body.style.MozUserSelect = 'none';
        }
    }

    function move(evt) {
        var x = Math.floor(evt.center.x - xMin);
        var isPan = evt.type === 'pan';

        if (window.pageYOffset === scrollY && (!isPan || !isFirst && evt.direction & Hammer.DIRECTION_HORIZONTAL)
                && x >= 0 && x <= xWidth) {
            let newValue = Math.round(x / xStep);
            if (newValue != value) {
                value = newValue;
                thumb.style.left = (newValue / range * 100) + '%';
                thumbline.style.left = (newValue / range * 100) + '%';
                onchange(value + min, isPan ? 'move' : 'end');
            }
        }

        isFirst = false;

        if (evt.pointerType === 'mouse') {
            evt.preventDefault();
        }
    }

    function postmove() {
        document.body.style.MozUserSelect = '';
        if (window.pageYOffset === scrollY) {
            onchange(value + min, 'end');
        }
    }

    var hammer = new Hammer(el);
    hammer.on('panstart tap press', premove)
    hammer.on('pan tap press', move);
    hammer.on('panend', postmove);
    hammer.get('tap').set({'interval': 0, 'threshold': 10});
}
