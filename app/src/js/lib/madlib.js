export default function (el, onchange) {
    var text = el.querySelector('.hp-madlib__input__text');

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
    });

    el.addEventListener('submit', evt => {
        evt.preventDefault();
        submit();
    });
}
