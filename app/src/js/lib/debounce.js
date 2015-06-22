export default function debounce(fn, delay) {
    var timer;
    return function () {
        if (timer) window.clearTimeout(timer);
        timer = window.setTimeout(fn, delay);
    }
}
