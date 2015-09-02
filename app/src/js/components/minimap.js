import { config } from '../lib/cfg';
import translate from '../lib/translate';

import districtCodes from '../data/codes.json!json';
import positions from '../data/positions.json!json';

var sprites, inits = [];

const MINIMAP_WIDTH = 180 + 20;  //TODO: check this num fix
const MINIMAP_HEIGHT = 216 + 24; //TODO: check this num fix

const DISTRICT_WIDTH = 18;
const DISTRICT_HEIGHT = 17;

const SPRITE_CHUNKS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const SPRITE_CHUNK_SIZE = Math.ceil(districtCodes.length / SPRITE_CHUNKS.length);

export default function Minimap(el) {
    var ctx, translateEl, districtsOnLoad, showOnLoad = false;

    function init() {
        var canvas = document.createElement('canvas');
        canvas.width = MINIMAP_WIDTH;
        canvas.height = MINIMAP_HEIGHT;
        canvas.className = 'hp-results-minimap__year';
        translateEl = translate(canvas);

        el.appendChild(canvas);
        ctx = canvas.getContext('2d');

        if (districtsOnLoad) draw(districtsOnLoad);
        if (showOnLoad) show();
    }

    var draw = this.draw = function (districtNos) {
        if (!ctx) {
            districtsOnLoad = districtNos;
            return;
        }

        ctx.clearRect(0, 0, MINIMAP_WIDTH, MINIMAP_HEIGHT);
        districtNos.forEach(districtNo => {
            var pos = positions[districtNo];
            var chunk = Math.floor(districtNo / SPRITE_CHUNK_SIZE);
            var y = (districtNo % SPRITE_CHUNK_SIZE) * DISTRICT_HEIGHT;
            ctx.drawImage(sprites[chunk].img, 0, y, DISTRICT_WIDTH, DISTRICT_HEIGHT, pos[0], pos[1],
                DISTRICT_WIDTH, DISTRICT_HEIGHT);
        });
    };

    var show = this.show = function () {
        if (translateEl) translateEl(0, 0);
        else showOnLoad = true;
    };

    this.hide = function () {
        if (translateEl) translateEl(-2000, -2000);
        else showOnLoad = false;
    }

    if (!sprites) {
        sprites = SPRITE_CHUNKS.map(function (chunk) {
            var img = document.createElement('img');
            var sprite = {'img': img, 'loaded': false};
            img.src = `${config.assetPath}/assets/minimap/districts-${chunk}.png`;
            img.style.display = 'none';
            img.addEventListener('load', () => {
                sprite.loaded = true;
                if (sprites.reduce((loaded, sprite) => loaded && sprite.loaded, true)) {
                    inits.forEach(init => init());
                }
            });

            document.body.appendChild(img);
            return sprite;
        });
    }

    inits.push(init);
}
