import { NODE } from '../data/network';
import { clock, fmtWalk, legStyle, legTitle } from '../lib/modes';

function detail(l) {
  const stops = l.via.length - 1;
  if (l.mode === 'walk') return `${fmtWalk(l.meters)} to ${NODE[l.to].name}`;
  if (l.mode === 'auto') return `${NODE[l.from].name} to ${NODE[l.to].name}`;
  return `Board at ${NODE[l.from].name}, ride ${stops} stop${stops > 1 ? 's' : ''} to ${NODE[l.to].name}`;
}

export default function Ticket({ route, depart, onFocus }) {
  const origin = NODE[route.legs[0].from].name;
  const dest = NODE[route.legs[route.legs.length - 1].to].name;
  let t = 0;
  const no = String(Math.abs([...route.id].reduce((a, c) => a * 31 + c.charCodeAt(0), 7)) % 900000 + 100000);

  return (
    <article className="relative rounded-2xl border border-line bg-card" aria-label="Itinerary">
      <span className="absolute -left-[9px] top-[78px] h-4 w-4 rounded-full border border-line bg-paper" aria-hidden="true" />
      <span className="absolute -right-[9px] top-[78px] h-4 w-4 rounded-full border border-line bg-paper" aria-hidden="true" />
      <header className="p-5 pb-6">
        <div className="flex justify-between text-[11px] font-semibold text-muted"><span>Journey ticket</span><span>No. {no}</span></div>
        <p className="mt-2 font-display text-2xl leading-tight">{origin} <span className="text-pin">→</span> {dest}</p>
      </header>
      <div className="border-t-2 border-dashed border-line p-5">
        <ol className="space-y-5">
          {route.legs.map((l, i) => {
            const at = clock(depart, t);
            t += l.mins;
            return (
              <li key={i} className="grid grid-cols-[3rem_10px_1fr] gap-3">
                <span className="pt-0.5 text-[13px] font-semibold text-muted">{at}</span>
                <span className="w-[10px] rounded-full" style={{ ...legStyle(l), backgroundSize: l.mode === 'walk' ? '8px 8px' : undefined, minHeight: 44 }} />
                <button onClick={() => onFocus?.(i)} className="-m-1 rounded-lg p-1 text-left transition-colors hover:bg-raise" title="Zoom to this step on the map">
                  <p className="text-sm font-medium">{legTitle(l)}</p>
                  <p className="mt-0.5 font-sans text-[13px] text-muted">{detail(l)}</p>
                  <p className="mt-1 text-xs font-semibold text-muted">
                    {l.mins} min{l.wait > 0 ? ` (incl. ${Math.round(l.wait)} wait)` : ''}{l.cost > 0 ? ` · ₹${l.cost}` : ''}
                  </p>
                </button>
              </li>
            );
          })}
          <li className="grid grid-cols-[3rem_10px_1fr] gap-3">
            <span className="pt-0.5 text-[13px] font-semibold text-pin">{clock(depart, route.time)}</span>
            <span className="mt-1 h-[10px] w-[10px] rounded-full bg-pin" />
            <p className="font-sans text-sm font-medium">Arrive at {dest}</p>
          </li>
        </ol>
      </div>
      <footer className="grid grid-cols-4 border-t border-line text-center">
        {[['Time', `${route.time}m`], ['Fare', `₹${route.cost}`], ['Walk', route.walk ? fmtWalk(route.walk) : '—'], ['Changes', route.transfers]].map(([k, v], i) => (
          <div key={k} className={`py-3 ${i ? 'border-l border-line' : ''}`}>
            <p className="text-[11px] font-semibold text-muted">{k}</p>
            <p className="mt-0.5 text-sm font-bold">{v}</p>
          </div>
        ))}
      </footer>
    </article>
  );
}
