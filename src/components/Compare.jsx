import { useState } from 'react';
import { CRITERIA } from '../lib/rank';
import { dominantMode, modeColor, fmtWalk } from '../lib/modes';
import { useReveal } from '../lib/useReveal';
import RouteBar from './RouteBar';

const SLOTS = ['#14121C', '#E11D48', '#B8892B'];

const METRICS = [
  { key: 'time', label: 'Time', fmt: (v) => `${v} min` },
  { key: 'cost', label: 'Fare', fmt: (v) => `₹${v}` },
  { key: 'walk', label: 'Walking', fmt: (v) => (v ? fmtWalk(v) : 'None') },
  { key: 'transfers', label: 'Changes', fmt: (v) => (v === 0 ? 'Direct' : v) },
];

const W = 680, H = 380, M = { l: 62, r: 24, t: 24, b: 54 };
const fmtAxis = (key, v) => (key === 'cost' ? `₹${Math.round(v)}` : key === 'time' ? `${Math.round(v)} min` : key === 'walk' ? fmtWalk(v) : Math.round(v));

function Scatter({ routes, selected, bestId, onSelect }) {
  const [xk, setXk] = useState('time');
  const [yk, setYk] = useState('cost');
  const [hover, setHover] = useState(null);
  const range = (k) => {
    const v = routes.map((r) => r[k]);
    let lo = Math.min(...v), hi = Math.max(...v);
    if (lo === hi) { lo -= 1; hi += 1; }
    const pad = (hi - lo) * 0.12;
    return [lo - pad, hi + pad];
  };
  const [x0, x1] = range(xk), [y0, y1] = range(yk);
  const sx = (v) => M.l + ((v - x0) / (x1 - x0)) * (W - M.l - M.r);
  const sy = (v) => H - M.b - ((v - y0) / (y1 - y0)) * (H - M.t - M.b);
  const front = routes
    .filter((a) => !routes.some((b) => b !== a && b[xk] <= a[xk] && b[yk] <= a[yk] && (b[xk] < a[xk] || b[yk] < a[yk])))
    .sort((a, b) => a[xk] - b[xk]);
  const stair = front.flatMap((r, i) => (i ? [[sx(r[xk]), sy(front[i - 1][yk])], [sx(r[xk]), sy(r[yk])]] : [[sx(r[xk]), sy(r[yk])]]));
  const ticks = (lo, hi) => Array.from({ length: 5 }, (_, i) => lo + ((hi - lo) * i) / 4);
  const shown = routes.find((r) => r.id === hover) ?? selected;
  const label = (k) => CRITERIA.find((c) => c.key === k).label;
  const Axis = ({ value, onChange, name }) => (
    <label className="flex items-center gap-2 text-sm font-semibold text-muted">
      {name}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="rounded-lg bg-raise px-3 py-1.5 text-ink outline-none">
        {CRITERIA.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
      </select>
    </label>
  );
  const txt = { fill: 'rgb(var(--muted))', fontFamily: 'Manrope, sans-serif', fontSize: 11, fontWeight: 600 };

  return (
    <div>
      <p className="max-w-2xl text-sm text-muted">Every dot is a route. Closer to the bottom-left is better. The dashed line joins the routes that nothing else beats on both axes. Click a dot to open it on the map.</p>
      <div className="mt-4 flex flex-wrap gap-4"><Axis value={xk} onChange={setXk} name="Across" /><Axis value={yk} onChange={setYk} name="Up" /></div>
      <div className="mt-4 grid items-start gap-5 lg:grid-cols-[1.8fr_1fr]">
        <div className="rounded-2xl border border-line bg-card">
          <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label="Scatter plot of all routes">
            {ticks(y0, y1).map((v, i) => (
              <g key={i}><line x1={M.l} x2={W - M.r} y1={sy(v)} y2={sy(v)} style={{ stroke: 'rgb(var(--line))' }} /><text x={M.l - 10} y={sy(v) + 4} textAnchor="end" style={txt}>{fmtAxis(yk, v)}</text></g>
            ))}
            {ticks(x0, x1).map((v, i) => <text key={i} x={sx(v)} y={H - M.b + 20} textAnchor="middle" style={txt}>{fmtAxis(xk, v)}</text>)}
            <text x={(M.l + W - M.r) / 2} y={H - 10} textAnchor="middle" style={{ ...txt, fill: 'rgb(var(--ink))' }}>{label(xk)} →</text>
            <text transform={`translate(14 ${(M.t + H - M.b) / 2}) rotate(-90)`} textAnchor="middle" style={{ ...txt, fill: 'rgb(var(--ink))' }}>{label(yk)} →</text>
            <polyline points={stair.map((p) => p.join(',')).join(' ')} fill="none" strokeDasharray="5 5" strokeWidth="1.5" style={{ stroke: 'rgb(var(--ink))' }} />
            {routes.map((r) => {
              const isSel = selected?.id === r.id;
              const rad = 7 + Math.min(r.walk / 220, 9);
              return (
                <g key={r.id} className="cursor-pointer" onClick={() => onSelect(r.id)} onMouseEnter={() => setHover(r.id)} onMouseLeave={() => setHover(null)}>
                  {r.id === bestId && <circle cx={sx(r[xk])} cy={sy(r[yk])} r={rad + 7} fill="none" stroke="#E11D48" strokeWidth="2" strokeDasharray="3 3" />}
                  <circle cx={sx(r[xk])} cy={sy(r[yk])} r={rad} style={{ fill: modeColor(dominantMode(r)), stroke: 'rgb(var(--ink))', strokeWidth: isSel ? 3 : 1, fillOpacity: 0.9 }} />
                </g>
              );
            })}
          </svg>
          <p className="border-t border-line px-4 py-2 text-xs font-semibold text-muted">Colour = main mode · Size = walking · Dashed ring = best for you</p>
        </div>
        {shown && (
          <aside className="rounded-2xl border border-line bg-card p-5">
            <p className="text-xs font-semibold text-muted">{hover ? 'Hovering' : 'Selected'}</p>
            <p className="mt-1 font-display text-4xl">{shown.time} min</p>
            <dl className="mt-4 space-y-2 text-sm">
              {[['Fare', `₹${shown.cost}`], ['Walking', shown.walk ? fmtWalk(shown.walk) : 'None'], ['Changes', shown.transfers]].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-line pb-1.5"><dt className="text-muted">{k}</dt><dd className="font-bold">{v}</dd></div>
              ))}
            </dl>
            <div className="mt-4"><RouteBar legs={shown.legs} h={8} gap={2} /></div>
          </aside>
        )}
      </div>
    </div>
  );
}

export default function Compare({ routes, headlines, selected, bestId, scores, onSelect }) {
  const ref = useReveal();
  const options = headlines.map((h) => ({ route: h.route, name: h.tags[0], tags: h.tags }));
  const [chosen, setChosen] = useState(() => options.slice(0, 3).map((o) => o.route.id));
  const [hot, setHot] = useState(null);

  const toggle = (id) => setChosen((c) => (c.includes(id) ? (c.length > 2 ? c.filter((x) => x !== id) : c) : [...c.slice(-2), id]));
  const picks = chosen.map((id) => options.find((o) => o.route.id === id)).filter(Boolean);
  const match = (id) => Math.round(100 * (1 - (scores.get(id) ?? 0)));

  const best = picks.find((p) => p.route.id === bestId) ?? picks[0];
  const byTime = [...picks].sort((a, b) => a.route.time - b.route.time)[0];
  const byCost = [...picks].sort((a, b) => a.route.cost - b.route.cost)[0];
  let verdict = null;
  if (picks.length > 1 && byTime.route.id !== byCost.route.id)
    verdict = `${byTime.name} gets you there ${byCost.route.time - byTime.route.time} min sooner, but costs ₹${byTime.route.cost - byCost.route.cost} more than ${byCost.name.toLowerCase()}.`;
  else if (picks.length > 1) verdict = `${byTime.name} wins on both time and fare here. Nothing in this selection beats it.`;

  return (
    <section id="compare" ref={ref} className="reveal scroll-mt-16 border-t border-line">
      <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <p className="text-sm font-semibold text-muted">Compare</p>
        <h2 className="mt-2 max-w-3xl font-display text-[clamp(2rem,5vw,3.4rem)] leading-[1.05]">Which one should you <span className="text-pin">take?</span></h2>
        <p className="mt-4 max-w-xl text-muted">Pick up to three routes and put them head to head. On every bar, shorter is better.</p>

        <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Choose routes to compare">
          {options.map((o) => {
            const i = chosen.indexOf(o.route.id);
            const on = i >= 0;
            return (
              <button key={o.route.id} onClick={() => toggle(o.route.id)} aria-pressed={on}
                className={`flex items-center gap-2.5 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${on ? 'border-ink bg-card shadow-sm' : 'border-line text-muted hover:border-ink/40 hover:text-ink'}`}>
                <span className="grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold text-white" style={{ background: on ? SLOTS[i] : 'rgb(var(--line))' }}>{on ? i + 1 : ''}</span>
                {o.name}
                <span className="font-normal text-muted">{o.route.time} min · ₹{o.route.cost}</span>
              </button>
            );
          })}
        </div>

        {verdict && (
          <p className="mt-6 flex max-w-2xl items-start gap-3 rounded-xl bg-raise px-4 py-3 text-[15px]">
            <svg className="mt-0.5 shrink-0 text-pin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16.5v.5" /></svg>
            {verdict}
          </p>
        )}

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {picks.map((p, i) => (
            <article key={p.route.id} onMouseEnter={() => setHot(p.route.id)} onMouseLeave={() => setHot(null)}
              className={`rounded-2xl border bg-card p-5 transition-all ${hot && hot !== p.route.id ? 'opacity-50' : ''} ${p.route.id === best?.route.id ? 'border-ink' : 'border-line'}`}
              style={{ borderTopColor: SLOTS[i], borderTopWidth: 4 }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold">{p.name}</p>
                  <p className="mt-0.5 text-xs text-muted">{p.tags.slice(1).join(' · ') || 'Route option'}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-3xl leading-none">{match(p.route.id)}%</p>
                  <p className="mt-1 text-[11px] font-semibold text-muted">match for you</p>
                </div>
              </div>
              <div className="mt-4"><RouteBar legs={p.route.legs} h={8} gap={2} /></div>
              <button onClick={() => onSelect(p.route.id)} className="mt-4 text-sm font-bold text-pin hover:underline">Show on map →</button>
            </article>
          ))}
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {METRICS.map((m) => {
            const vals = picks.map((p) => p.route[m.key]);
            const max = Math.max(...vals, 1);
            const min = Math.min(...vals);
            return (
              <div key={m.key} className="rounded-2xl border border-line bg-card p-5">
                <p className="text-sm font-bold">{m.label}</p>
                <div className="mt-4 space-y-4">
                  {picks.map((p, i) => {
                    const v = p.route[m.key];
                    const win = v === min && picks.length > 1;
                    return (
                      <div key={p.route.id} onMouseEnter={() => setHot(p.route.id)} onMouseLeave={() => setHot(null)} className={`transition-opacity ${hot && hot !== p.route.id ? 'opacity-40' : ''}`}>
                        <div className="flex items-center justify-between text-[13px]">
                          <span className="font-semibold text-muted">{p.name}</span>
                          <span className="flex items-center gap-2 font-bold">
                            {win && <span className="rounded bg-ink px-1.5 py-0.5 text-[10px] text-paper">Best</span>}
                            {m.fmt(v)}
                          </span>
                        </div>
                        <div className="mt-1.5 h-2.5 rounded-full bg-raise">
                          <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${Math.max(v / max, 0.03) * 100}%`, background: SLOTS[i] }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <details className="group mt-8 rounded-2xl border border-line bg-card">
          <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-[15px] font-bold">
            Explore all {routes.length} routes as a chart
            <svg className="transition-transform group-open:rotate-180" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
          </summary>
          <div className="border-t border-line p-5"><Scatter routes={routes} selected={selected} bestId={bestId} onSelect={onSelect} /></div>
        </details>
      </div>
    </section>
  );
}
