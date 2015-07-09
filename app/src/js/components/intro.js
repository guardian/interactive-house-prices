import template from './templates/intro.html!text'
import { config } from '../lib/cfg'

export default class Intro {
    constructor(el) {
        el.innerHTML = template;
        this.steps = [1, 2, 3, 4].map(n => {
            return {
                'img': el.querySelector('.js-img-' + n),
                'year': el.querySelector('.js-year-' + n)
            };
        });
        var img = new Image();
        img.onload = this.start.bind(this);
        img.src = config.assetPath + '/assets/intro.png';
        console.log(this.steps);
    }

    start() {
        
    }
}
