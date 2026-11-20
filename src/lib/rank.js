export const CRITERIA = [
  { key: 'time', label: 'Time', unit: 'min' },
  { key: 'cost', label: 'Cost', unit: '₹' },
  { key: 'walk', label: 'Walking', unit: 'm' },
  { key: 'transfers', label: 'Changes', unit: '' },
];

export const PRESETS = [
  { name: 'Balanced', w: { time: 60, cost: 40, walk: 30, transfers: 30 } },
  { name: 'Running late', w: { time: 95, cost: 15, walk: 25, transfers: 30 } },
  { name: 'Student budget', w: { time: 25, cost: 95, walk: 45, transfers: 30 } },
  { name: 'Tired feet', w: { time: 35, cost: 25, walk: 95, transfers: 40 } },
  { name: 'No changes', w: { time: 35, cost: 25, walk: 35, transfers: 95 } },
];

export function scoreRoutes(routes, weights) {
  const range = {};
  for (const { key } of CRITERIA) {
    const v = routes.map((r) => r[key]);
    range[key] = [Math.min(...v), Math.max(...v)];
  }
  const total = CRITERIA.reduce((s, { key }) => s + weights[key], 0) || 1;
  const out = new Map();
  for (const r of routes) {
    let s = 0;
    for (const { key } of CRITERIA) {
      const [lo, hi] = range[key];
      const n = hi === lo ? 0 : (r[key] - lo) / (hi - lo);
      s += (weights[key] / total) * n;
    }
    out.set(r.id, s);
  }
  return out;
}

export function pickHeadlines(routes, weights) {
  if (!routes.length) return [];
  const score = scoreRoutes(routes, weights);
  const by = (fn) => [...routes].sort((a, b) => fn(a) - fn(b) || score.get(a.id) - score.get(b.id))[0];

  const picks = [
    ['best', 'Best for you', by((r) => score.get(r.id))],
    ['fastest', 'Fastest', by((r) => r.time)],
    ['cheapest', 'Cheapest', by((r) => r.cost)],
    ['walk', 'Least walking', by((r) => r.walk)],
    ['changes', 'Fewest changes', by((r) => r.transfers)],
  ];

  const out = [];
  for (const [, tag, route] of picks) {
    const hit = out.find((o) => o.route.id === route.id);
    if (hit) hit.tags.push(tag);
    else out.push({ route, tags: [tag] });
  }
  return out.slice(0, 5).map((o) => ({ ...o, score: score.get(o.route.id) }));
}
