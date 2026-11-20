import { useEffect, useMemo, useState } from 'react';
import Nav from './components/Nav';
import TripPanel from './components/TripPanel';
import MapView from './components/MapView';
import Compare from './components/Compare';
import HowItWorks from './components/HowItWorks';
import Roadmap from './components/Roadmap';
import Footer from './components/Footer';
import { planRoutes } from './api';
import { buildTimeline, stateAt } from './lib/trip';
import { pickHeadlines, scoreRoutes, PRESETS } from './lib/rank';

export default function App() {
  const [form, setForm] = useState({
    origin: 'jayanagar',
    dest: 'whitefield',
    time: '08:30',
    modes: { bus: true, metro: true, auto: true },
  });
  const [weights, setWeights] = useState(PRESETS[0].w);
  const [state, setState] = useState({ status: 'idle' });
  const [picked, setPicked] = useState(null);
  const [view, setView] = useState('plan');
  const [focus, setFocus] = useState(null);
  const [trip, setTrip] = useState(null);
  const pick = (id) => { setPicked(id); setFocus(null); setTrip(null); };

  useEffect(() => {
    if (!trip?.running) return undefined;
    const id = setInterval(() => setTrip((t) => {
      if (!t || !t.running) return t;
      const e = t.elapsed + t.speed * 0.1;
      return e >= t.tl.total ? { ...t, elapsed: t.tl.total, running: false } : { ...t, elapsed: e };
    }), 100);
    return () => clearInterval(id);
  }, [trip?.running]);

  const live = useMemo(() => (trip ? stateAt(trip.tl, trip.elapsed) : null), [trip]);
  const tripCtl = {
    onToggle: () => setTrip((t) => ({ ...t, running: !t.running })),
    onSpeed: (v) => setTrip((t) => ({ ...t, speed: v })),
    onSkip: () => setTrip((t) => {
      const x = t.tl.legs[stateAt(t.tl, t.elapsed).i];
      return { ...t, elapsed: Math.min(x.end + 0.01, t.tl.total), running: true };
    }),
    onEnd: () => setTrip(null),
    onReplay: () => setTrip((t) => ({ ...t, elapsed: 0, running: true })),
    onNew: () => { setTrip(null); setView('plan'); },
  };
  const start = (route) => setTrip({ route, tl: buildTimeline(route), elapsed: 0, running: true, speed: 3 });

  const search = async (show = true) => {
    setState((s) => ({ ...s, status: 'loading' }));
    setPicked(null);
    setFocus(null);
    setTrip(null);
    if (show) setView('routes');
    try {
      const data = await planRoutes(form);
      setState({ status: 'done', data, query: { ...form } });
    } catch (e) {
      setState({ status: 'error', message: e.message });
    }
  };

  useEffect(() => { search(false); /* eslint-disable-next-line */ }, []);

  const routes = state.data?.routes ?? [];
  const headlines = useMemo(() => pickHeadlines(routes, weights), [routes, weights]);
  const scores = useMemo(() => (routes.length ? scoreRoutes(routes, weights) : new Map()), [routes, weights]);
  const selected = routes.find((r) => r.id === picked) ?? headlines[0]?.route ?? null;
  const q = state.query ?? form;

  return (
    <>
      <Nav />
      <main>
        <section id="app" className="mx-auto grid max-w-[1600px] scroll-mt-14 grid-cols-[minmax(0,1fr)] lg:h-[calc(100vh-56px)] lg:grid-cols-[minmax(400px,470px)_minmax(0,1fr)]">
          <div className="order-2 border-line lg:order-1 lg:overflow-y-auto lg:border-r">
            <TripPanel view={view} setView={setView} form={form} setForm={setForm} weights={weights} setWeights={setWeights} state={state} headlines={headlines} selected={selected} onSelect={pick} onSearch={() => search(true)} onFocus={(i) => setFocus({ i })} trip={trip} live={live} tripCtl={tripCtl} onStart={start} />
          </div>
          <div className="order-1 h-[48vh] min-h-[320px] lg:order-2 lg:h-full">
            <MapView route={view === 'routes' || state.status === 'done' ? selected : null} origin={q.origin} dest={q.dest} depart={q.time} focus={focus} onFocus={setFocus} live={live ? { latlng: live.latlng, mode: trip.tl.legs[live.i].leg.mode, minsLeft: live.minsLeft, done: live.done } : null} />
          </div>
        </section>

        {state.status === 'done' && routes.length > 1 && (
          <Compare key={JSON.stringify(state.query)} headlines={headlines} routes={routes} selected={selected} bestId={headlines[0]?.route.id} scores={scores} onSelect={(id) => { pick(id); setView('routes'); document.getElementById('app')?.scrollIntoView({ behavior: 'smooth' }); }} />
        )}
        <HowItWorks stats={state.data?.stats} />
        <Roadmap />
      </main>
      <Footer />
    </>
  );
}
