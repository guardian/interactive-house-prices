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

    var value;

    if (ticStep !== undefined) {
        el.appendChild(tics(min, max, ticStep));
    }

    function premove() {
        var rect = el.getBoundingClientRect();
        xMin = rect.left;
        xWidth = rect.width;
        xStep = xWidth / range;
    }

    function move(evt) {
        var pageX = evt.center.x;
        var x = Math.floor(pageX - xMin);
        var newValue;

        if (x >= 0 && x <= xWidth) {
            newValue = Math.round(x / xStep);
            if (newValue != value) {
                thumb.style.left = (newValue / range * 100) + '%';
                thumbline.style.left = (newValue / range * 100) + '%';
                value = newValue;
                onchange(value + min, evt.isFinal ? 'end' : 'move');
            }
        }
    }

    var hammer = new Hammer(el);
    hammer.on('panstart tap', premove)
    hammer.on('pan tap', move);
}
