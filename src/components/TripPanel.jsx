import { PLACES, NODE } from '../data/network';
import { CRITERIA, PRESETS } from '../lib/rank';
import { AUTO_BG } from '../lib/modes';
import { isPeak } from '../lib/router';
import RouteRow from './RouteRow';
import Ticket from './Ticket';
import TripView from './TripView';

const MODE_CHIPS = [
  { key: 'walk', label: 'Walk', locked: true, swatch: { background: 'radial-gradient(circle, rgb(var(--ink)) 1.5px, transparent 1.9px)', backgroundSize: '6px 100%' } },
  { key: 'bus', label: 'Bus', swatch: { background: 'rgb(var(--bus))' } },
  { key: 'metro', label: 'Metro', swatch: { background: 'rgb(var(--metro))' } },
  { key: 'auto', label: 'Auto', swatch: { background: AUTO_BG } },
];

const HINT = { time: 'Get there sooner', cost: 'Keep it cheap', walk: 'Walk less', transfers: 'Avoid changing' };

function PlaceSelect({ label, value, onChange }) {
  return (
    <label className="relative block rounded-lg bg-raise px-4 py-2.5 transition-colors focus-within:ring-2 focus-within:ring-ink">
      <span className="block text-[11px] font-semibold text-muted">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full cursor-pointer appearance-none bg-transparent pr-6 text-base font-semibold outline-none">
        {PLACES.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
    </label>
  );
}

function Priorities({ weights, setWeights }) {
  const active = PRESETS.find((p) => CRITERIA.every(({ key }) => p.w[key] === weights[key]));
  return (
    <div>
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
        {PRESETS.map((p) => (
          <button key={p.name} onClick={() => setWeights(p.w)} className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${active?.name === p.name ? 'bg-ink text-paper' : 'bg-raise text-ink hover:bg-line'}`}>
            {p.name}
          </button>
        ))}
      </div>
      <details className="group mt-3">
        <summary className="flex cursor-pointer list-none items-center gap-1.5 text-[13px] font-semibold text-muted hover:text-ink">
          Fine-tune priorities
          <svg className="transition-transform group-open:rotate-180" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
        </summary>
        <div className="mt-4 space-y-4">
          {CRITERIA.map(({ key, label }) => (
            <div key={key}>
              <div className="flex items-baseline justify-between text-sm">
                <label htmlFor={`w-${key}`} className="font-semibold">{label}</label>
                <span className="text-xs text-muted">{HINT[key]}</span>
              </div>
              <input id={`w-${key}`} type="range" min="0" max="100" step="5" value={weights[key]} className="slim mt-2"
                style={{ background: `linear-gradient(to right, rgb(var(--ink)) ${weights[key]}%, rgb(var(--line)) ${weights[key]}%)` }}
                onChange={(e) => setWeights({ ...weights, [key]: Number(e.target.value) })} />
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

export default function TripPanel({ view, setView, form, setForm, weights, setWeights, state, headlines, selected, onSelect, onSearch, onFocus, trip, live, tripCtl, onStart }) {
  const set = (patch) => setForm({ ...form, ...patch });
  const same = form.origin === form.dest;
  const peak = isPeak(parseInt(form.time.split(':')[0], 10));
  const loading = state.status === 'loading';

  if (view === 'plan')
    return (
      <div className="px-5 pb-10 pt-8">
        <h1 className="font-display text-[2.6rem] leading-[1.02] sm:text-5xl">Go anywhere in Bengaluru, <span className="text-pin">your way.</span></h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">Walk, bus, metro and auto compared side by side, then ranked by what matters to you.</p>

        <div className="mt-7 flex gap-3">
          <div className="flex flex-col items-center py-[22px]" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-ink" />
            <span className="my-1 w-px flex-1 border-l-2 border-dotted border-muted/60" />
            <span className="h-2.5 w-2.5 bg-pin" />
          </div>
          <div className="relative flex-1 space-y-2">
            <PlaceSelect label="Pickup" value={form.origin} onChange={(v) => set({ origin: v })} />
            <PlaceSelect label="Drop-off" value={form.dest} onChange={(v) => set({ dest: v })} />
            <button onClick={() => set({ origin: form.dest, dest: form.origin })} aria-label="Swap pickup and drop-off" className="absolute right-11 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-line bg-paper transition-colors hover:bg-raise">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M7 4v16M7 20l-3-3M7 20l3-3M17 20V4M17 4l-3 3M17 4l3 3" /></svg>
            </button>
          </div>
        </div>

        <label className="mt-2 flex items-center gap-3 rounded-lg bg-raise px-4 py-2.5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
          <span className="flex-1"><span className="block text-[11px] font-semibold text-muted">Leave at</span>
            <input type="time" value={form.time} onChange={(e) => set({ time: e.target.value })} className="bg-transparent text-base font-semibold outline-none" /></span>
          {peak && <span className="rounded bg-pin/15 px-2 py-0.5 text-[11px] font-bold text-pin">Peak hour</span>}
        </label>

        <p className="mb-2 mt-6 text-[13px] font-semibold text-muted">Ways to travel</p>
        <div className="flex flex-wrap gap-2">
          {MODE_CHIPS.map((m) => {
            const on = m.locked || form.modes[m.key];
            return (
              <button key={m.key} aria-pressed={on} disabled={m.locked} onClick={() => set({ modes: { ...form.modes, [m.key]: !form.modes[m.key] } })}
                className={`flex items-center gap-2.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${on ? 'bg-raise text-ink' : 'border border-line text-muted'} ${m.locked ? 'cursor-default' : 'hover:bg-line'}`}>
                <span className="h-1.5 w-6 rounded-full" style={on ? m.swatch : { background: 'rgb(var(--line))' }} />
                {m.label}
              </button>
            );
          })}
        </div>

        <p className="mb-3 mt-6 text-[13px] font-semibold text-muted">Rank routes by</p>
        <Priorities weights={weights} setWeights={setWeights} />

        <button onClick={onSearch} disabled={loading || same} className="mt-8 h-14 w-full rounded-lg bg-ink text-base font-bold text-paper transition-opacity hover:opacity-90 disabled:opacity-40">
          {loading ? 'Finding routes…' : 'See routes'}
        </button>
        {same && <p className="mt-2 text-sm text-pin">Pick two different places.</p>}
      </div>
    );

  const query = state.query ?? form;
  if (trip && live) return <TripView trip={trip} live={live} depart={query.time} {...tripCtl} />;
  return (
    <div className="px-5 pb-10 pt-5">
      <button onClick={() => setView('plan')} className="flex w-full items-center gap-3 rounded-lg bg-raise px-4 py-3 text-left transition-colors hover:bg-line">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-semibold">{NODE[query.origin].name} → {NODE[query.dest].name}</span>
          <span className="block text-xs text-muted">Leave {query.time} · tap to edit trip</span>
        </span>
      </button>

      <div className="mt-6"><Priorities weights={weights} setWeights={setWeights} /></div>

      {loading && (
        <div className="mt-6 space-y-3" aria-busy="true">
          {[0, 1, 2].map((i) => <div key={i} className="h-[132px] animate-pulse rounded-xl bg-card" />)}
        </div>
      )}

      {state.status === 'error' && <p className="mt-8 text-sm text-pin">Couldn't reach the routing service. {state.message}</p>}

      {state.status === 'done' && !headlines.length && (
        <div className="mt-10"><p className="font-display text-2xl">No route found</p><p className="mt-2 text-sm text-muted">Turn a mode back on or pick another pair of places.</p></div>
      )}

      {state.status === 'done' && headlines.length > 0 && (
        <>
          <div className="mb-3 mt-7 flex items-baseline justify-between">
            <h2 className="font-display text-xl">Choose a route</h2>
            <span className="text-xs text-muted">{state.data.stats.explored.toLocaleString()} explored · {state.data.stats.ms} ms</span>
          </div>
          {state.data.peak && <p className="mb-3 text-[13px] text-pin">Peak hour: buses and autos run slower.</p>}
          <div className="space-y-2">
            {!headlines.some((h) => h.route.id === selected?.id) && selected && (
              <RouteRow route={selected} tags={['Picked from chart']} selected onSelect={() => {}} depart={query.time} index={0} />
            )}
            {headlines.map((h, i) => (
              <RouteRow key={h.route.id} index={i} route={h.route} tags={h.tags} selected={selected?.id === h.route.id} onSelect={() => onSelect(h.route.id)} depart={query.time} />
            ))}
          </div>
          {selected && (
            <div className="sticky bottom-0 z-10 -mx-5 mt-5 border-t border-line bg-paper/95 px-5 py-3 backdrop-blur">
              <button onClick={() => onStart(selected)} className="h-14 w-full rounded-lg bg-ink text-base font-bold text-paper transition-opacity hover:opacity-90">Start journey · {selected.time} min</button>
            </div>
          )}
          {selected && (
            <div className="mt-8">
              <h2 className="mb-3 font-display text-xl">Your journey</h2>
              <Ticket route={selected} depart={query.time} onFocus={onFocus} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
