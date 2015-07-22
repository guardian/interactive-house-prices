export default function (el, onchange) {
    var text = el.querySelector('.hp-madlib__input__text');

    function submit() {
        var newValue = '',
            value = parseInt(text.value.replace(/[^0-9]/g, ''));

        if (!isNaN(value)) {
            onchange(value);

            value = value + '';
            while (value.length > 3) {
                newValue = ',' + value.substr(-3) + newValue;
                value = value.substr(0, value.length - 3);
            }
            text.value = value + newValue;
            text.blur();
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

    el.addEventListener('submit', evt => {
        evt.preventDefault();
        submit();
    });
}
