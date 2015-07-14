export default function (el, min, max, onchange) {
    var thumb = el.querySelector('.range-slider__thumb');
    var xMin, xMax, xStep;

    var value;

    function move(evt) {
        var x = Math.floor(evt.pageX - xMin);
        var newValue;

        if (x >= 0 && x <= xMax) {
            newValue = Math.round(x / xStep);
            if (newValue != value) {
                thumb.style.left = (newValue * xStep) + 'px';
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
        xMax = rect.width;
        xStep = xMax / (max - min - 1);

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
