import { config } from '../lib/cfg'

import districtCodes from '../data/codes.json!json'
import positions from '../data/positions.json!json'

var minimapImg, minimapLoaded = false;

const MINIMAP_WIDTH = 200
const MINIMAP_HEIGHT = 240;

const DISTRICT_WIDTH = 20;
const DISTRICT_HEIGHT = 18;

const SPRITE_CHUNK_SIZE = districtCodes.length / 2;

export default function Minimap(el) {
    var canvas, ctx;

    function init() {
        minimapLoaded = true;

        canvas = document.createElement('canvas');
        canvas.width = MINIMAP_WIDTH;
        canvas.height = MINIMAP_HEIGHT;

        el.appendChild(canvas);
        ctx = canvas.getContext('2d');
    }

    this.draw = function (districtNos) {
        if (!ctx) return;

        ctx.clearRect(0, 0, MINIMAP_WIDTH, MINIMAP_HEIGHT);
        districtNos.forEach(districtNo => {
            var pos = positions[districtNo];
            var x = Math.floor(districtNo / SPRITE_CHUNK_SIZE) * DISTRICT_WIDTH;
            var y = (districtNo % SPRITE_CHUNK_SIZE) * DISTRICT_HEIGHT;
            ctx.drawImage(minimapImg, x, y, DISTRICT_WIDTH, DISTRICT_HEIGHT, pos[0], pos[1],
                DISTRICT_WIDTH, DISTRICT_HEIGHT);
        });
    };

    this.show = function () {
        if (canvas) canvas.style.display = 'block';
    };

    this.hide = function () {
        if (canvas) canvas.style.display = 'none';
    }

    if (!minimapImg) {
        minimapImg = document.createElement('img');
        minimapImg.src = config.assetPath + '/assets/minimap/districts.png';
        minimapImg.style.display = 'none';
        document.body.appendChild(minimapImg);
    }

    if (minimapLoaded) {
        init();
    } else {
        minimapImg.addEventListener('load', init);
    }
}
