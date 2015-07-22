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
    var xMin, xWidth, xStep;

    var value;

    if (ticStep !== undefined) {
        el.appendChild(tics(min, max, ticStep));
    }

    function move(evt) {
        var x = Math.floor(evt.pageX - xMin);
        var newValue;

        if (x >= 0 && x <= xWidth) {
            newValue = Math.round(x / xStep);
            if (newValue != value) {
                thumb.style.left = (newValue / range * 100) + '%';
                value = newValue;
                onchange(value + min);
            }
        }

        evt.preventDefault();
    }

    function up(evt) {
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', up);
    }

    function down(evt) {
        var rect = el.getBoundingClientRect();
        xMin = rect.left;
        xWidth = rect.width;
        xStep = xWidth / range;

        move(evt);

        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', up);
    }

    thumb.addEventListener('mousedown', down);
    el.addEventListener('mousedown', down);

    return {
        'get': () => value
    }
}
