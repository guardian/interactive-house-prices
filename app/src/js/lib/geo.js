// http://en.wikipedia.org/wiki/Universal_Transverse_Mercator_coordinate_system
const a = 6378.137, f = 1/298.257223563;
const N0 = 0, E0 = 500, k0 = 0.9996;
const n = f / (2 - f);
const n2 = n*n, n3 = n*n2, n4 = n*n3;
const t_part = 2 * Math.sqrt(n)/(1 + n);
const A = a/(1+n) * (1 + 1/4*n2 + 1/64*n4);
const zone = 30;
const λ0 = rad(zone * 6 - 183);
const k0A = k0 * A;

function rad(d) { return d * Math.PI / 180; }

export function utm(lat, lon) {
    var φ = rad(lat);
    var λ = rad(lon) - λ0;

    var sinφ = Math.sin(φ);
    var t = Math.sinh(Math.atanh(sinφ) - t_part * Math.atanh(t_part * sinφ));

    var E = E0 + k0A*Math.atanh(Math.sin(λ)/Math.sqrt(1 + t*t));
    var N = N0 + k0A*Math.atan(t/Math.cos(λ));
    return [E, -N];
}

export function centroid(points) {
    return points.reduce((a, b) => [a[0] + b[0], a[1] + b[1]]).map((c) => c / points.length);
}

