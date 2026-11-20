import { useReveal } from '../lib/useReveal';

const stack = [
  ['React + Tailwind CSS', 'Frontend', 'Built'],
  ['Multi-objective ranking', 'In-browser solver', 'Working'],
  ['Python + FastAPI', 'Backend service', 'Next'],
  ['NetworkX', 'Graph routing', 'Next'],
  ['Google Maps Platform', 'Real map layer', 'Planned'],
  ['PostgreSQL', 'Saved trips, preferences', 'Planned'],
];

const next = [
  ['Real transit data', 'Replace the sample network with BMTC and BMRCL timetables (GTFS).'],
  ['Backend swap', 'Set one environment variable and src/api.js calls FastAPI instead of the local solver.'],
  ['Live conditions', 'Time-of-day and traffic-aware travel times, crowding on metro and buses.'],
  ['Learning-guided search', 'Reinforcement-learning guidance for transfer points, as in the reference papers.'],
];

const tone = { Built: 'bg-ink text-paper', Working: 'bg-ink text-paper', Next: 'border border-pin text-pin', Planned: 'border border-line text-muted' };

export default function Roadmap() {
  const ref = useReveal();
  return (
    <section id="next" ref={ref} className="reveal scroll-mt-16 border-t border-line">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">05 — Roadmap</p>
        <h2 className="mt-4 max-w-3xl font-display text-[clamp(2rem,5vw,3.6rem)] leading-tight">What's built, and <i className="text-pin">what's next.</i></h2>
        <div className="mt-12 grid gap-12 lg:grid-cols-2">
          <ul className="divide-y divide-line border-y border-line">
            {stack.map(([name, role, status]) => (
              <li key={name} className="flex items-center justify-between gap-4 py-4">
                <div><p className="font-display text-2xl">{name}</p><p className="font-mono text-[11px] uppercase tracking-wider text-muted">{role}</p></div>
                <span className={`rounded px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${tone[status]}`}>{status}</span>
              </li>
            ))}
          </ul>
          <ol className="space-y-6">
            {next.map(([t, d], i) => (
              <li key={t} className="grid grid-cols-[2.5rem_1fr] gap-3">
                <span className="font-mono text-sm text-pin">{String(i + 1).padStart(2, '0')}</span>
                <div><h3 className="font-display text-2xl">{t}</h3><p className="mt-1 text-muted">{d}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
