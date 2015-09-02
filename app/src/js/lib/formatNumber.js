export default function (value) {
    // number to string
    if (typeof(value)==='number') {
        value = value.toString();        
    }
    
    // format number 
    var newValue = '';
    while (value.length > 3) {
        newValue = ',' + value.substr(-3) + newValue;
        value = value.substr(0, value.length - 3);
    }
    return value + newValue;
}
