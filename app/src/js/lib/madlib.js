export default function (el, presets, valid, format, parse, onchange) {
    var text = el.querySelector('.hp-madlib__input__text');
    var btn = el.querySelector('.hp-madlib__input__btn');
    var currentValue = '', currentPreset;

    presets.forEach(function (preset) {
        if (preset.hasAttribute('data-selected')) {
            change(parse(preset.getAttribute('data-value')), preset);
        }
    });

    function change(value, preset, notify=false) {
        var strValue = value + '';
        text.value = format(strValue);
        btn.style.visibility = strValue.length && valid(strValue) ? 'visible' : 'hidden';
        currentValue = value;

        presets.forEach(p => p.removeAttribute('data-selected'));
        if (preset) {
            preset.setAttribute('data-selected', '');
        }
        currentPreset = preset;

        if (notify) {
            onchange(value);
        }
    }

    function submit() {
        if (valid(text.value)) {
            var value = parse(text.value);
            if (value !== currentValue) {
                change(value, null, true);
            }
            text.blur();
            btn.removeAttribute('data-focus');
            return true;
        }
        return false;
    }

    text.addEventListener('focus', () => { btn.setAttribute('data-focus', ''); });
    text.addEventListener('blur', evt => {
        // Wait for new activeElement
        setTimeout(() => {
            if (document.activeElement !== btn) {
                if (!submit()) {
                    change(currentValue, currentPreset);
                }
                btn.removeAttribute('data-focus');
            }
        }, 0);
    });
    text.addEventListener('input', () => {
        var value = text.value;
        btn.style.visibility = value.length && valid(value) ? 'visible' : 'hidden';
        presets.forEach(p => p.removeAttribute('data-selected'));
    });

    el.addEventListener('submit', evt => {
        evt.preventDefault();
        submit();
    });

    btn.addEventListener('click', evt => {
        evt.preventDefault();
        if (btn.hasAttribute('data-focus')) {
            submit();
        } else {
            text.value = '';
            btn.style.visibility = 'hidden';
            presets.forEach(p => p.removeAttribute('data-selected'));
            text.focus();
        }
    });

    presets.forEach(preset => {
        var value = parse(preset.getAttribute('data-value'));
        preset.addEventListener('click', () => {
            change(value, preset, true);
        });
    });
}
