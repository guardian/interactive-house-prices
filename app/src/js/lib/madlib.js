export default function (el, presets, onchange) {
    var text = el.querySelector('.hp-madlib__input__text');
    var btn = el.querySelector('.hp-madlib__input__btn');
    var currentValue = '25,000';

    function valid() {
        var value = text.value;
        return value.length && value.replace(/[,0-9]+/, '').length === 0;
    }

    function submit() {
        if (valid()) {
            let newValue = '', value = parseInt(text.value.replace(/[^0-9]/g, ''));
            onchange(value);

            value = value + '';
            while (value.length > 3) {
                newValue = ',' + value.substr(-3) + newValue;
                value = value.substr(0, value.length - 3);
            }
            text.value = currentValue = value + newValue;
            text.blur();

            btn.removeAttribute('data-focus');
        }
    }

    text.addEventListener('focus', () => {
        btn.setAttribute('data-focus', '');
    });
    text.addEventListener('blur', evt => {
        setTimeout(() => {
            if (document.activeElement !== btn) {
                if (valid()) {
                    submit();
                } else {
                    text.value = currentValue;
                    btn.style.visibility = 'visible';
                    btn.removeAttribute('data-focus');
                }
            }
        }, 0);
    });
    text.addEventListener('input', () => {
        btn.style.visibility = valid() ? 'visible' : 'hidden';
    });

    el.addEventListener('submit', evt => {
        evt.preventDefault();
        submit();
    });

    btn.addEventListener('click', evt => {
        if (btn.hasAttribute('data-focus')) {
            submit();
        } else {
            text.value = '';
            btn.style.visibility = 'hidden';
            text.focus();
        }
        evt.preventDefault();
    });
}
