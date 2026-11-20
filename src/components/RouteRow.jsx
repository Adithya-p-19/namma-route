import RouteBar from './RouteBar';
import { clock, fmtWalk, legTitle } from '../lib/modes';

export default function RouteRow({ route, tags, selected, onSelect, depart, index }) {
  const summary = route.legs.map((l) => (l.mode === 'walk' ? 'Walk' : legTitle(l).replace('Metro · ', ''))).join(' › ');
  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      className={`rise block w-full rounded-xl border p-4 text-left transition-colors ${selected ? 'border-ink bg-raise' : 'border-transparent bg-card hover:bg-raise'}`}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            {tags.map((t, i) => (
              <span key={t} className={i === 0 && t === 'Best for you' ? 'rounded bg-pin px-1.5 py-0.5 text-[11px] font-bold text-white' : 'rounded bg-line px-1.5 py-0.5 text-[11px] font-semibold text-ink'}>{t}</span>
            ))}
          </div>
          <p className="mt-2 font-display text-2xl leading-none">{route.time} min</p>
          <p className="mt-1.5 text-[13px] text-muted">Arrive {clock(depart, route.time)}</p>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl leading-none">₹{route.cost}</p>
          <p className="mt-1.5 text-[13px] text-muted">{route.transfers} change{route.transfers === 1 ? '' : 's'}</p>
        </div>
      </div>
      <div className="mt-4"><RouteBar legs={route.legs} h={8} gap={2} /></div>
      <p className="mt-2.5 truncate text-[12.5px] text-muted">{summary} · {route.walk ? `${fmtWalk(route.walk)} walk` : 'no walking'}</p>
    </button>
  );
}
