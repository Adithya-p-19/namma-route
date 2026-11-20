# Namma Route

**Multi-objective multimodal route optimization for urban commuters in Bengaluru.**

Namma Route compares journeys that mix walking, BMTC buses, Namma Metro and autos. Instead of returning one "best" route, it finds every route that is not beaten on time, fare, walking distance and number of changes, then ranks them by what matters to *you*.

> Mini Project-II (22CS66) · Department of Computer Science and Engineering · 2026-27
> Domain: AI and ML · SDG 11 (Sustainable Cities and Communities) · SDG 9 (Industry, Innovation and Infrastructure)

> **Status: Review 1 prototype.** The stops, metro lines, bus routes and fares are **sample data**, not real BMTC or BMRCL timetables. See the [roadmap](#roadmap).

---

## Features

- **Trip planner** with pickup, drop-off, departure time and mode toggles (walk, bus, metro, auto).
- **Multi-objective routing** over time, fare, walking distance and changes, with Pareto filtering.
- **Personal ranking:** priority presets ("Running late", "Student budget", "Tired feet", "No changes") and four sliders that re-rank instantly, with no new search.
- **Route options** labelled *Best for you*, *Fastest*, *Cheapest*, *Least walking* and *Fewest changes*, each with a coloured leg bar.
- **Real interactive map** (Leaflet and OpenStreetMap) showing the route in mode colours, including walking legs with distances.
- **Step-by-step itinerary** styled as a journey ticket. Click a step to zoom the map to it.
- **Start journey:** a live trip simulation with a moving dot, current-step guidance, minutes left, pause, demo speed and skip controls.
- **Compare view:** put up to three routes head to head with per-metric bars, a plain-English verdict and a match score. All routes can also be explored as a Pareto chart.
- **Peak-hour awareness:** buses and autos run slower and waits are longer at 8 to 11 and 17 to 21.
- Responsive layout, keyboard-accessible controls, reduced-motion support.

Mode colours: **metro** purple, **bus** blue, **auto** yellow and green, **walk** dotted ink, destination rose.

## Tech stack

| Layer | Choice | Status |
|---|---|---|
| Frontend | React 18, Tailwind CSS 3, Vite 5 | Built |
| Map | Leaflet with OpenStreetMap tiles | Built |
| Routing | Custom multi-objective label-setting search (in the browser) | Working |
| Backend | Python, FastAPI | Planned (API contract below) |
| Graph library | NetworkX | Planned |
| Maps platform | Google Maps Platform | Planned |
| Database | PostgreSQL | Planned |

## Getting started

Requires **Node.js 18 or newer**.

```bash
git clone https://github.com/<your-username>/namma-route.git
cd namma-route
npm install
npm run dev
```

Open <http://localhost:5173>. The map needs an internet connection to load tiles.

| Script | What it does |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |

## How routes are decided

1. **Graph.** Stops, stations and places are nodes. Walk, metro, bus and auto hops are edges carrying time, fare and walking distance. Boarding a new service adds a wait and a boarding fare.
2. **Search.** A multi-objective version of Dijkstra's algorithm (label-setting) expands partial journeys from a binary min-heap ordered by time. Each state `(stop, service)` keeps a set of labels with four costs: time, fare, walking and boardings.
3. **Pareto pruning.** A label is discarded when another is at least as good on all four costs, or when a finished journey already dominates it. Hard limits keep the search bounded: 210 minutes, 2.5 km of walking, 5 boardings, 10 labels per state.
4. **Ranking.** The surviving Pareto set is min-max normalised per criterion and combined with the slider weights. The lowest weighted score is *Best for you*. The match percentage is `100 x (1 - score)`.

DSA concepts used: weighted graph (adjacency list), Dijkstra, priority queue (binary heap), Pareto dominance and branch-and-bound pruning, hash maps and sets, parent-pointer path reconstruction, and weighted-sum scalarisation.

## Project structure

```
src/
  api.js                 single seam between the UI and the routing engine
  App.jsx                app state: form, weights, results, selected route, live trip
  data/network.js        sample stops, metro lines, bus routes, doorstep coordinates
  lib/
    router.js            graph building and the multi-objective search
    rank.js              weighted ranking, presets, headline picks
    trip.js              journey timeline and live position simulation
    modes.js             mode colours, labels, formatting helpers
    useReveal.js         scroll-reveal hook
  components/
    Nav.jsx  TripPanel.jsx  RouteRow.jsx  RouteBar.jsx
    MapView.jsx  Ticket.jsx  TripView.jsx
    Compare.jsx  HowItWorks.jsx  Roadmap.jsx  Footer.jsx
```

## Connecting a backend

The UI only talks to `src/api.js`. By default it runs the in-browser solver. To use a backend instead, copy `.env.example` to `.env` and set:

```bash
VITE_API_URL=http://localhost:8000
```

The app then calls `POST {VITE_API_URL}/plan`.

**Request**

```json
{
  "origin": "jayanagar",
  "dest": "whitefield",
  "time": "08:30",
  "modes": { "bus": true, "metro": true, "auto": true }
}
```

**Response**

```json
{
  "routes": [
    {
      "id": "unique signature string",
      "time": 89, "cost": 126, "walk": 1277, "transfers": 1,
      "legs": [
        {
          "mode": "walk | bus | metro | auto",
          "svc": "service id", "svcName": "Purple Line",
          "from": "stop id", "to": "stop id",
          "via": ["stop id", "..."],
          "mins": 8, "wait": 0, "cost": 0, "meters": 650
        }
      ]
    }
  ],
  "peak": true,
  "stats": { "nodes": 29, "edges": 644, "explored": 920, "pareto": 16, "ms": 12 }
}
```

Place ids and coordinates live in `src/data/network.js`. A place's doorstep is written as `@<place id>` in `via`, and `coord()` resolves it to a map position.

## Roadmap

- Replace the sample network with real BMTC and BMRCL data (GTFS).
- FastAPI and NetworkX routing service behind the existing API contract.
- Road-following route geometry (OSRM or Google Directions) and a Google Maps layer.
- PostgreSQL for saved trips and preferences.
- Live traffic and crowding, and real GPS for Start journey.
- Learning-guided transfer search, following the references below.

## References

1. Learning-Guided Transfer Point Search for Efficient Inter-Modal Routing With Mobility-on-Demand Feeders. <https://ieeexplore.ieee.org/abstract/document/11663089>
2. Multi-Objective Optimization for Multimodal Multi-Objective Multi-Point Shortest Path Problem Considering Unforeseeable Road Eventualities. <https://ieeexplore.ieee.org/document/10959009>
3. Dynamic Passenger Route Guidance in the Multimodal Transit System With Graph Representation and Attention Based Deep Reinforcement Learning. <https://ieeexplore.ieee.org/document/10508234>

## Team

- Adithya Patni
- Aditya Ambaldaghe
- Aditya GT

**Guide:** Prof Dhananjaya Sharma

Map data &copy; [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors.
