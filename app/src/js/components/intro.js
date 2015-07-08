import template from './templates/intro.html!text'
import { config } from '../lib/cfg'

export default class Intro {
    constructor(el) {
        el.innerHTML = template.replace(/%assetPath%/g, config.assetPath);
    }
}
