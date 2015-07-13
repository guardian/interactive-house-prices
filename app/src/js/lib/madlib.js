export default function (el, onchange) {
    var expanded = false;
    var text = el.querySelector('.madlib__input__text'),
        expand = el.querySelector('.madlib__input__expand'),
        canned = el.querySelector('.madlib__input__canned__options');

    function toggle() {
        if (expanded) {
            el.removeAttribute('data-expanded');
        } else {
            el.setAttribute('data-expanded', '');
        }

        expanded = !expanded;
    }

    el.addEventListener('submit', evt => {
        evt.preventDefault();
        onchange(text.value);
    });

    expand.addEventListener('click', toggle);

    canned.addEventListener('change', evt => {
        var option = canned.options[canned.selectedIndex];
        text.value = '';
        text.placeholder = option.textContent;
        onchange(option.value);

        toggle();
        canned.selectedIndex = -1;
    });

    return {
        get: () => text.value,
        set: value => text.value = value
    };
}
