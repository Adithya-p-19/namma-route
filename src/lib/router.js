// Multi-objective multimodal router (runs in the browser for the prototype).
// Objectives (all minimised): time, cost, walking distance, number of boardings.
// Algorithm: label-setting search that keeps a Pareto set of labels per
// (node, service) and prunes anything dominated by an already-found journey.
// The FastAPI + NetworkX backend can implement the same contract later.

import { NODES, NODE, METRO, BUSES, accessWalk } from '../data/network';

const toRad = (d) => (d * Math.PI) / 180;

export function meters(a, b) {
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function isPeak(hour) {
  return (hour >= 8 && hour < 11) || (hour >= 17 && hour < 21);
}

const WALK_SPEED = 83.3; // m per minute (5 km/h)

const strip = (id) => id.replace('@', '');

function buildGraph({ bus, metro, auto, peak }) {
  const places = NODES.filter((n) => n.place);
  const adj = new Map([...NODES.map((n) => [n.id, []]), ...places.map((n) => [`@${n.id}`, []])]);
  const add = (from, e) => adj.get(from).push(e);
  let edgeCount = 0;

  // walking links between anything within 1.5 km
  for (let i = 0; i < NODES.length; i++) {
    for (let j = i + 1; j < NODES.length; j++) {
      const d = meters(NODES[i], NODES[j]);
      if (d > 1500) continue;
      const m = d * 1.25;
      const base = { mode: 'walk', svc: 'walk', svcName: 'Walk', time: m / WALK_SPEED, cost: 0, meters: m, wait: 0, board: 0 };
      add(NODES[i].id, { ...base, to: NODES[j].id });
      add(NODES[j].id, { ...base, to: NODES[i].id });
      edgeCount += 2;
    }
  }

  if (metro) {
    for (const [key, line] of Object.entries(METRO)) {
      for (let i = 0; i < line.stops.length - 1; i++) {
        const a = NODE[line.stops[i]];
        const b = NODE[line.stops[i + 1]];
        const m = meters(a, b) * 1.15;
        const e = { mode: 'metro', svc: key, svcName: line.name, time: (m / 1000 / 34) * 60 + 0.6, cost: (m / 1000) * 3.4, meters: m, wait: peak ? 6 : 5, board: 10 };
        add(a.id, { ...e, to: b.id });
        add(b.id, { ...e, to: a.id });
        edgeCount += 2;
      }
    }
  }

  if (bus) {
    for (const r of BUSES) {
      for (let i = 0; i < r.stops.length - 1; i++) {
        const a = NODE[r.stops[i]];
        const b = NODE[r.stops[i + 1]];
        const m = meters(a, b) * 1.35;
        const speed = peak ? 11 : 16;
        const e = { mode: 'bus', svc: r.id, svcName: r.id, time: (m / 1000 / speed) * 60 + 1, cost: (m / 1000) * (r.ac ? 2.4 : 1.6), meters: m, wait: peak ? 9 : 6, board: r.ac ? 10 : 6 };
        add(a.id, { ...e, to: b.id });
        add(b.id, { ...e, to: a.id });
        edgeCount += 2;
      }
    }
  }

  // each selectable place gets a virtual "doorstep" node linked to its stop by a short walk
  for (const p of places) {
    const m = accessWalk(p.id);
    const base = { mode: 'walk', svc: 'walk', svcName: 'Walk', time: m / WALK_SPEED, cost: 0, meters: m, wait: 0, board: 0 };
    add(`@${p.id}`, { ...base, to: p.id });
    add(p.id, { ...base, to: `@${p.id}` });
    edgeCount += 2;
  }

  if (auto) {
    for (const p of places) {
      for (const q of NODES) {
        if (q.id === p.id) continue;
        const d = meters(p, q);
        if (d > (q.place ? 12000 : 6000)) continue;
        const m = d * 1.35;
        const speed = peak ? 15 : 24;
        const fare = m <= 2000 ? 36 : 36 + ((m - 2000) / 1000) * 18;
        const e = { mode: 'auto', svc: 'auto', svcName: 'Auto', time: (m / 1000 / speed) * 60, cost: fare, meters: m, wait: 3, board: 0 };
        add(`@${p.id}`, { ...e, to: q.place ? `@${q.id}` : q.id });
        if (!q.place) add(q.id, { ...e, to: `@${p.id}` });
        edgeCount += 2;
      }
    }
  }

  return { adj, edgeCount };
}

class Heap {
  constructor() { this.a = []; }
  get size() { return this.a.length; }
  push(x) {
    const a = this.a;
    a.push(x);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p].t <= a[i].t) break;
      [a[p], a[i]] = [a[i], a[p]];
      i = p;
    }
  }
  pop() {
    const a = this.a;
    const top = a[0];
    const last = a.pop();
    if (a.length) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < a.length && a[l].t < a[m].t) m = l;
        if (r < a.length && a[r].t < a[m].t) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i], a[m]];
        i = m;
      }
    }
    return top;
  }
}

const dom = (a, b) => a.t <= b.t && a.c <= b.c && a.w <= b.w && a.b <= b.b;

function visited(label, id) {
  for (let l = label; l; l = l.prev) if (l.node === id) return true;
  return false;
}

function toRoute(label) {
  const steps = [];
  for (let l = label; l.prev; l = l.prev) steps.push(l);
  steps.reverse();

  const legs = [];
  for (const s of steps) {
    const e = s.edge;
    const last = legs[legs.length - 1];
    if (last && last.svc === e.svc && last.mode === e.mode && e.mode !== 'auto') {
      last.to = strip(e.to);
      last.via.push(e.to);
      last.mins += e.time;
      last.cost += e.cost;
      last.meters += e.meters;
    } else {
      legs.push({
        mode: e.mode,
        svc: e.svc,
        svcName: e.svcName,
        from: strip(s.prev.node),
        to: strip(e.to),
        via: [s.prev.node, e.to],
        mins: e.time + s.wait,
        wait: s.wait,
        cost: e.cost + s.boardCost,
        meters: e.meters,
      });
    }
  }
  legs.forEach((l) => { l.mins = Math.max(1, Math.round(l.mins)); l.cost = Math.round(l.cost); l.meters = Math.round(l.meters); });

  const rides = legs.filter((l) => l.mode !== 'walk').length;
  return {
    id: legs.map((l) => `${l.svc}:${l.from}>${l.to}`).join('|'),
    legs,
    time: Math.round(label.t),
    cost: Math.round(label.c),
    walk: Math.round(label.w),
    transfers: Math.max(0, rides - 1),
  };
}

export function solve(originId, destId, { modes, time = '08:30' }) {
  const t0 = performance.now();
  const hour = parseInt(time.split(':')[0], 10) || 8;
  const peak = isPeak(hour);
  const { adj, edgeCount } = buildGraph({ ...modes, peak });

  const heap = new Heap();
  const seen = new Map();
  const found = [];
  let explored = 0;

  const startId = `@${originId}`;
  const goal = `@${destId}`;
  const start = { node: startId, svc: 'start', t: 0, c: 0, w: 0, b: 0, prev: null };
  heap.push(start);

  while (heap.size) {
    const L = heap.pop();
    if (L.dead) continue;
    explored++;
    if (L.node === goal) {
      if (!found.some((f) => dom(f, L))) found.push(L);
      continue;
    }
    for (const e of adj.get(L.node)) {
      if (e.mode === 'auto' && L.svc === 'auto') continue;
      if (visited(L, e.to)) continue;
      const boarding = e.mode !== 'walk' && e.svc !== L.svc;
      const wait = boarding ? e.wait : 0;
      const boardCost = boarding ? e.board : 0;
      const N = {
        node: e.to,
        svc: e.svc,
        t: L.t + e.time + wait,
        c: L.c + e.cost + boardCost,
        w: L.w + (e.mode === 'walk' ? e.meters : 0),
        b: L.b + (boarding ? 1 : 0),
        prev: L,
        edge: e,
        wait,
        boardCost,
      };
      if (N.t > 210 || N.w > 2500 || N.b > 5) continue;
      if (found.some((f) => dom(f, N))) continue;
      const key = `${N.node}|${N.svc}`;
      const list = seen.get(key) || [];
      if (list.some((x) => dom(x, N))) continue;
      if (list.length >= 10) continue;
      for (const x of list) if (dom(N, x)) x.dead = true;
      list.push(N);
      seen.set(key, list);
      heap.push(N);
    }
  }

  const unique = new Map();
  for (const f of found) {
    const r = toRoute(f);
    if (!unique.has(r.id)) unique.set(r.id, r);
  }
  const routes = [...unique.values()].sort((a, b) => a.time - b.time).slice(0, 16);

  return {
    routes,
    peak,
    stats: {
      nodes: NODES.length,
      edges: edgeCount,
      explored,
      pareto: routes.length,
      ms: Math.max(1, Math.round(performance.now() - t0)),
    },
  };
}
