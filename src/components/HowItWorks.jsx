import { useReveal } from '../lib/useReveal';

const ink = { stroke: 'rgb(var(--ink))' };

const Graph = () => (
  <svg viewBox="0 0 200 110" className="h-28 w-full" aria-hidden="true">
    <g fill="none" strokeWidth="3" strokeLinecap="round">
      <path d="M20 80 L70 30 L130 55 L180 20" style={{ stroke: 'rgb(var(--metro))' }} />
      <path d="M20 80 L70 90 L130 55" style={{ stroke: 'rgb(var(--bus))' }} />
      <path d="M70 90 L170 85" style={{ stroke: '#F5C400' }} />
      <path d="M130 55 L170 85" strokeDasharray="0.1 7" style={ink} />
    </g>
    {[[20, 80], [70, 30], [130, 55], [180, 20], [70, 90], [170, 85]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="6" strokeWidth="2.5" style={{ ...ink, fill: 'rgb(var(--paper))' }} />)}
  </svg>
);
const Search = () => (
  <svg viewBox="0 0 200 110" className="h-28 w-full" aria-hidden="true">
    <g fill="none" strokeWidth="2.5" strokeLinecap="round" style={ink}>
      <path d="M15 55 H55 C80 55 80 20 110 20 H150" style={{ stroke: 'rgb(var(--bus))' }} />
      <path d="M55 55 H150" style={{ stroke: 'rgb(var(--metro))' }} />
      <path d="M55 55 C80 55 80 90 110 90 H150" style={{ stroke: '#F5C400' }} />
      <path d="M150 20 L185 55 M150 55 H185 M150 90 L185 55" strokeOpacity=".3" />
    </g>
    <circle cx="15" cy="55" r="6" style={{ fill: 'rgb(var(--ink))' }} /><circle cx="185" cy="55" r="7" fill="#E11D48" />
  </svg>
);
const Pareto = () => (
  <svg viewBox="0 0 200 110" className="h-28 w-full" aria-hidden="true">
    <path d="M20 10 V95 H185" fill="none" strokeWidth="1.5" style={ink} />
    <polyline points="30,25 55,45 90,60 130,72 175,82" fill="none" strokeWidth="1.5" strokeDasharray="4 4" style={ink} />
    {[[30, 25], [55, 45], [90, 60], [130, 72], [175, 82]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="6" style={{ fill: 'rgb(var(--metro))' }} />)}
    {[[70, 35], [110, 45], [150, 55], [60, 75], [120, 85]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="5" fill="none" strokeWidth="1.5" strokeOpacity=".4" style={ink} />)}
  </svg>
);
const Rank = () => (
  <svg viewBox="0 0 200 110" className="h-28 w-full" aria-hidden="true">
    {[[25, 60], [50, 30], [75, 80], [100, 45]].map(([y, v], i) => (
      <g key={i}>
        <line x1="20" x2="180" y1={y - 8 + i * 0} y2={y - 8} strokeWidth="3" strokeOpacity=".2" style={ink} />
        <line x1="20" x2={20 + v * 1.6} y1={y - 8} y2={y - 8} strokeWidth="3" stroke="#E11D48" />
        <circle cx={20 + v * 1.6} cy={y - 8} r="7" strokeWidth="3" style={{ ...ink, fill: 'rgb(var(--paper))' }} />
      </g>
    ))}
  </svg>
);

export default function HowItWorks({ stats }) {
  const ref = useReveal();
  const steps = [
    { n: '01', t: 'Model the city as a graph', Art: Graph, d: `Stops and stations become nodes. Walking, bus, metro and auto links become edges carrying time, fare and walking distance.${stats ? ` Right now: ${stats.nodes} nodes, ${stats.edges.toLocaleString()} edges.` : ''}` },
    { n: '02', t: 'Search for every sensible journey', Art: Search, d: `A label-setting search grows journeys outwards, adding a boarding wait and fare whenever you change service.${stats ? ` Last query explored ${stats.explored.toLocaleString()} partial journeys.` : ''}` },
    { n: '03', t: 'Drop the dominated', Art: Pareto, d: `If another route is better or equal on time, fare, walking and changes, it is thrown away. What remains is the Pareto front.${stats ? ` ${stats.pareto} routes survived.` : ''}` },
    { n: '04', t: 'Rank by what you care about', Art: Rank, d: 'Each objective is normalised, then combined using your four sliders. Move a slider and the order changes instantly, with no new search.' },
  ];
  return (
    <section id="how" ref={ref} className="reveal scroll-mt-16 border-t border-line bg-card">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">04 — How it works</p>
        <h2 className="mt-4 max-w-3xl font-display text-[clamp(2rem,5vw,3.6rem)] leading-tight">Four steps between <i className="text-pin">“where?”</i> and <i className="text-pin">“this one”.</i></h2>
        <div className="mt-14 grid gap-px bg-line md:grid-cols-2">
          {steps.map(({ n, t, Art, d }) => (
            <article key={n} className="bg-paper p-7">
              <div className="flex items-start justify-between">
                <span className="font-display text-6xl leading-none text-transparent" style={{ WebkitTextStroke: '1px rgb(var(--ink))' }}>{n}</span>
                <div className="w-44"><Art /></div>
              </div>
              <h3 className="mt-4 font-display text-3xl">{t}</h3>
              <p className="mt-2 max-w-md text-muted">{d}</p>
            </article>
          ))}
        </div>
        {stats && (
          <dl className="mt-10 grid grid-cols-2 gap-4 font-mono md:grid-cols-4">
            {[['Nodes', stats.nodes], ['Edges', stats.edges.toLocaleString()], ['Explored', stats.explored.toLocaleString()], ['Solve time', `${stats.ms} ms`]].map(([k, v]) => (
              <div key={k} className="border-t-[1.5px] border-ink pt-2"><dt className="text-[10px] uppercase tracking-widest text-muted">{k}</dt><dd className="mt-1 text-2xl">{v}</dd></div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}
