export var config = {};
export function set(cfg) {
    Object.keys(cfg).map(k => config[k] = cfg[k])
}
