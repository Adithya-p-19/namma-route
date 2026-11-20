import { legStyle, legTitle } from '../lib/modes';

export default function RouteBar({ legs, h = 12, gap = 3 }) {
  return (
    <div className="flex w-full items-center" style={{ gap, height: h }} role="img" aria-label={legs.map((l) => `${legTitle(l)} ${l.mins} minutes`).join(', ')}>
      {legs.map((l, i) => (
        <div key={i} title={`${legTitle(l)} · ${l.mins} min`} style={{ flexGrow: Math.max(l.mins, 3), flexBasis: 0, height: h, borderRadius: l.mode === 'walk' ? 0 : h / 2, ...legStyle(l) }} />
      ))}
    </div>
  );
}
