// Single seam between the UI and the routing engine.
//
// Prototype: runs the in-browser solver (src/lib/router.js).
// Later: set VITE_API_URL=http://localhost:8000 and the same call goes to the
// FastAPI + NetworkX backend. Expected response shape:
//   { routes: Route[], peak: boolean, stats: { nodes, edges, explored, pareto, ms } }

import { solve } from './lib/router';

const API = import.meta.env.VITE_API_URL;

export async function planRoutes({ origin, dest, time, modes }) {
  if (API) {
    const res = await fetch(`${API}/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin, dest, time, modes }),
    });
    if (!res.ok) throw new Error(`Backend returned ${res.status}`);
    return res.json();
  }
  await new Promise((r) => setTimeout(r, 650));
  return solve(origin, dest, { time, modes });
}
