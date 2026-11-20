export const C = {
  metro: '#7B2D8E',
  bus: '#1F5FBF',
  autoY: '#F5C400',
  autoG: '#1E8E3E',
  ink: '#14121C',
  pin: '#E11D48',
};

export const AUTO_BG = 'repeating-linear-gradient(90deg,#F5C400 0 9px,#1E8E3E 9px 13px)';

export function legStyle(leg) {
  switch (leg.mode) {
    case 'metro': return { background: C.metro };
    case 'bus': return { background: C.bus };
    case 'auto': return { background: AUTO_BG };
    default:
      return {
        background: 'radial-gradient(circle, rgb(var(--ink)) 1.5px, transparent 1.9px)',
        backgroundSize: '8px 100%',
        backgroundRepeat: 'repeat-x',
        backgroundPosition: 'center',
      };
  }
}

export function legTitle(leg) {
  if (leg.mode === 'walk') return 'Walk';
  if (leg.mode === 'bus') return `Bus ${leg.svcName}`;
  if (leg.mode === 'metro') return `Metro · ${leg.svcName}`;
  return 'Auto';
}

export function dominantMode(route) {
  const rides = route.legs.filter((l) => l.mode !== 'walk');
  if (!rides.length) return 'walk';
  return rides.sort((a, b) => b.mins - a.mins)[0].mode;
}

export function modeColor(mode) {
  return { metro: C.metro, bus: C.bus, auto: C.autoY, walk: C.ink }[mode];
}

export function clock(base, addMinutes) {
  const [h, m] = base.split(':').map(Number);
  const total = (h * 60 + m + Math.round(addMinutes)) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export const fmtWalk = (m) => (m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m / 10) * 10} m`);
