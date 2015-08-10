export default function translate(el) {
    var anim, translate;
    return function (x, y) {
        translate = `translate(${x}px, ${y}px)`;

        if (!anim) {
            anim = window.requestAnimationFrame(() => {
                el.style.transform = translate;
                el.style.msTransform = translate;
                el.style.webkitTransform = translate;
                anim = null;
            });
        }
    };
}

