export default function (el, onchange) {
    var expanded = false;
    var text = el.querySelector('.madlib__input__custom__text'),
        type = el.querySelector('.madlib__input__type'),
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

    function submit() {
        var newValue = '',
            value = parseInt(text.value.replace(/[^0-9]/g, ''));

        if (isNaN(value)) {
            text.focus();
        } else {
            onchange(value);

            value = value + '';
            while (value.length > 3) {
                newValue = ',' + value.substr(-3) + newValue;
                value = value.substr(0, value.length - 3);
            }
            text.value = value + newValue;
        }
    }

    text.addEventListener('focus', () => {
        text.select();
        text.addEventListener('mouseup', function mouseup(evt) {
            evt.preventDefault();
            evt.target.removeEventListener('mouseup', mouseup);
        });
    });
    text.addEventListener('blur', () => submit());

    text.addEventListener('input', evt => {
        var value = text.value;
        var newValue = value.replace(/[^0-9,]/g, '');
        if (newValue !== value) {
            text.value = newValue;
        }
        type.textContent = '(custom)';
    });

    el.addEventListener('submit', evt => {
        evt.preventDefault();
        submit();
    });

    expand.addEventListener('click', toggle);

    canned.addEventListener('change', evt => {
        var option = canned.options[canned.selectedIndex];
        var optionText = option.textContent;
        var value = optionText.split(' ', 1)[0].substr(1);
        text.value = value;
        type.textContent = optionText.substr(value.length + 2);

        onchange(option.value);

        toggle();
        canned.selectedIndex = -1;
    });

    return {
        get: () => text.value,
        set: value => text.value = value
    };
}
