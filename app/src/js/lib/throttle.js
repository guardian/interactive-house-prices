export default function (fn, delay) {
    var timer, run = false;
    return function runner() {
        if (timer) {
            run = true;
        } else {
            fn();

            timer = window.setTimeout(() => {
                timer = undefined;
                if (run) {
                    runner();
                    run = false;
                }
            }, delay);
        }
    }
}
