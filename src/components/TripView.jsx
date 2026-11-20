import { NODE } from '../data/network';
import RouteBar from './RouteBar';
import { clock, fmtWalk, legStyle, legTitle } from '../lib/modes';

const SPEEDS = [[1, '1 min/s'], [3, '3 min/s'], [10, '10 min/s']];
const name = (id) => NODE[id.replace('@', '')].name;

function now(trip, live) {
  const L = trip.tl.legs[live.i];
  const leg = L.leg;
  if (live.done) return { title: "You've arrived", detail: `Welcome to ${name(leg.to)}.` };
  if (live.phase === 'waiting')
    return { title: `Wait for ${legTitle(leg)}`, detail: `Board at ${name(leg.from)} in about ${Math.max(1, Math.ceil(live.waitLeft))} min` };
  if (leg.mode === 'walk')
    return { title: `Walk to ${name(leg.to)}`, detail: `${fmtWalk(Math.max(10, (1 - live.f) * leg.meters))} to go` };
  if (leg.mode === 'auto')
    return { title: `In the auto to ${name(leg.to)}`, detail: `About ${Math.max(1, Math.ceil(live.legLeft))} min left` };
  return {
    title: `On ${legTitle(leg)}`,
    detail: `Next stop ${name(live.nextStopId)} · ${live.stopsLeft} stop${live.stopsLeft === 1 ? '' : 's'} to ${name(leg.to)}`,
  };
}

export default function TripView({ trip, live, depart, onToggle, onSpeed, onSkip, onEnd, onReplay, onNew }) {
  const { route, tl } = trip;
  const cur = now(trip, live);
  const dest = name(route.legs[route.legs.length - 1].to);
  const mins = Math.ceil(live.minsLeft);

  return (
    <div className="px-5 pb-10 pt-5">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-bold">
          <span className={`h-2.5 w-2.5 rounded-full ${live.done ? 'bg-autog' : trip.running ? 'animate-pulse bg-pin' : 'bg-muted'}`} />
          {live.done ? 'Journey complete' : trip.running ? 'Journey in progress' : 'Paused'}
        </p>
        {!live.done && <button onClick={onEnd} className="text-sm font-bold text-pin hover:underline">End journey</button>}
      </div>

      <div className="mt-4 rounded-2xl bg-ink p-5 text-paper">
        <p className="text-xs font-semibold opacity-70">{live.done ? 'Arrived at' : `Heading to ${dest}`}</p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <p className="font-display text-4xl leading-none">{live.done ? clock(depart, route.time) : `${mins} min`}</p>
          <p className="text-right text-sm opacity-80">{live.done ? `${route.time} min total` : `Arrive ${clock(depart, route.time)}`}</p>
        </div>
        <div className="relative mt-5">
          <div className="rounded-full bg-paper/15 p-1.5"><RouteBar legs={route.legs} h={8} gap={2} /></div>
          <span className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-ink bg-pin shadow transition-[left] duration-100" style={{ left: `${live.pos * 100}%` }} />
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-ink bg-card p-5" aria-live="polite">
        <p className="text-xs font-semibold text-muted">{live.done ? 'Done' : `Now · ${clock(depart, trip.elapsed)}`}</p>
        <p className="mt-1 font-display text-2xl leading-tight">{cur.title}</p>
        <p className="mt-1 text-[15px] text-muted">{cur.detail}</p>
      </div>

      {live.done ? (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button onClick={onNew} className="h-12 rounded-lg bg-ink text-sm font-bold text-paper hover:opacity-90">Plan another trip</button>
          <button onClick={onReplay} className="h-12 rounded-lg bg-raise text-sm font-bold hover:bg-line">Replay</button>
        </div>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button onClick={onToggle} className="h-12 rounded-lg bg-ink text-sm font-bold text-paper hover:opacity-90">{trip.running ? 'Pause' : 'Resume'}</button>
            <button onClick={onSkip} className="h-12 rounded-lg bg-raise text-sm font-bold hover:bg-line">Skip to next step</button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs font-semibold text-muted">Demo speed</span>
            {SPEEDS.map(([v, label]) => (
              <button key={v} onClick={() => onSpeed(v)} aria-pressed={trip.speed === v} className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${trip.speed === v ? 'bg-ink text-paper' : 'bg-raise hover:bg-line'}`}>{label}</button>
            ))}
          </div>
        </>
      )}

      <h2 className="mb-3 mt-8 font-display text-xl">Steps</h2>
      <ol className="space-y-1">
        {tl.legs.map((x, i) => {
          const state = live.done || i < live.i ? 'done' : i === live.i ? 'now' : 'next';
          const l = x.leg;
          return (
            <li key={i} className={`grid grid-cols-[2.5rem_10px_1fr_auto] items-start gap-3 rounded-lg p-2.5 transition-colors ${state === 'now' ? 'bg-raise' : ''} ${state === 'done' ? 'opacity-50' : ''}`}>
              <span className="pt-0.5 text-[13px] font-semibold text-muted">{clock(depart, x.start)}</span>
              <span className="mt-0.5 w-[10px] self-stretch rounded-full" style={{ ...legStyle(l), minHeight: 32, backgroundSize: l.mode === 'walk' ? '8px 8px' : undefined }} />
              <div>
                <p className="text-sm font-semibold">{legTitle(l)}</p>
                <p className="text-[13px] text-muted">{l.mode === 'walk' ? `${fmtWalk(l.meters)} to ${name(l.to)}` : `${name(l.from)} → ${name(l.to)}`} · {l.mins} min</p>
              </div>
              <span className="pt-0.5 text-xs font-bold text-muted">
                {state === 'done' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-label="Done"><path d="m5 12 5 5 9-10" /></svg>
                ) : state === 'now' ? 'Now' : ''}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
