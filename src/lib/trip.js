// Journey simulation: turns a route into a timeline and answers
// "where is the traveller after N minutes?". Frontend demo only; a real build
// would replace `elapsed` with live GPS and vehicle feeds.

import { coord } from '../data/network';

const rad = (d) => (d * Math.PI) / 180;
const strip = (id) => id.replace('@', '');

function dist(a, b) {
  const dLat = rad(b[0] - a[0]);
  const dLng = rad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(h));
}

export function buildTimeline(route) {
  let t = 0;
  const legs = route.legs.map((leg) => {
    const pts = leg.via.map(coord);
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + dist(pts[i - 1], pts[i]));
    const start = t;
    t += leg.mins;
    return { leg, pts, cum, len: cum[cum.length - 1] || 1, start, end: t, wait: Math.min(leg.wait || 0, leg.mins - 0.5) };
  });
  return { legs, total: t };
}

export function stateAt(tl, elapsed) {
  const e = Math.min(Math.max(elapsed, 0), tl.total);
  const last = tl.legs[tl.legs.length - 1];
  if (e >= tl.total) {
    return { done: true, i: tl.legs.length - 1, phase: 'done', latlng: last.pts[last.pts.length - 1], minsLeft: 0, legLeft: 0, progress: 1, pos: 1, stopsLeft: 0, nextStopId: strip(last.leg.to), f: 1 };
  }
  const i = tl.legs.findIndex((x) => e < x.end);
  const L = tl.legs[i];
  const local = e - L.start;
  const waiting = local < L.wait;
  const f = waiting ? 0 : (local - L.wait) / Math.max(L.leg.mins - L.wait, 0.01);
  const d = f * L.len;
  let k = 1;
  while (k < L.cum.length - 1 && L.cum[k] < d) k++;
  const seg = L.cum[k] - L.cum[k - 1] || 1;
  const u = Math.min(Math.max((d - L.cum[k - 1]) / seg, 0), 1);
  const a = L.pts[k - 1];
  const b = L.pts[k];

  const weights = tl.legs.map((x) => Math.max(x.leg.mins, 3));
  const before = weights.slice(0, i).reduce((s, w) => s + w, 0);
  const pos = (before + f * weights[i]) / weights.reduce((s, w) => s + w, 0);

  return {
    done: false,
    i,
    phase: waiting ? 'waiting' : 'moving',
    f,
    latlng: [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u],
    minsLeft: tl.total - e,
    legLeft: L.end - e,
    waitLeft: waiting ? L.start + L.wait - e : 0,
    progress: e / tl.total,
    pos,
    stopsLeft: L.pts.length - k,
    nextStopId: strip(L.leg.via[k]),
  };
}
