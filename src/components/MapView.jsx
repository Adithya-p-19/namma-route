import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { NODES, NODE, METRO, coord } from '../data/network';
import { C, clock } from '../lib/modes';

// Real map: Leaflet + OpenStreetMap data (standard tiles, softened with CSS).
// Route lines join the stops directly for now; swap in road geometry
// (OSRM / Google Directions) when the backend is ready.

const ll = (id) => coord(id);
const icon = (cls, size) => L.divIcon({ className: '', html: `<div class="${cls}"></div>`, iconSize: [size, size], iconAnchor: [size / 2, size / 2] });

export default function MapView({ route, origin: o, dest: d, depart, focus, onFocus, live }) {
  const el = useRef(null);
  const map = useRef(null);
  const layer = useRef(null);
  const marker = useRef(null);
  const follow = useRef(true);
  const lastMode = useRef(null);
  const [free, setFree] = useState(false);

  useEffect(() => {
    const m = L.map(el.current, { zoomControl: false, scrollWheelZoom: true }).setView([12.96, 77.63], 11);
    L.control.zoom({ position: 'bottomright' }).addTo(m);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(m);

    const net = L.layerGroup().addTo(m);
    Object.entries(METRO).forEach(([k, line]) =>
      L.polyline(line.stops.map(ll), { color: C.metro, weight: 4, opacity: 0.35, dashArray: k === 'green' ? '8 6' : null, lineCap: 'round' }).addTo(net)
    );
    NODES.forEach((n) =>
      L.circleMarker(ll(n.id), { radius: n.place ? 4 : 3, color: C.ink, weight: 1.5, opacity: 0.55, fillColor: '#F0ECE2', fillOpacity: 1 })
        .addTo(net)
        .bindTooltip(n.name, { direction: 'top', offset: [0, -4] })
    );

    layer.current = L.layerGroup().addTo(m);
    map.current = m;
    m.on('dragstart', () => { follow.current = false; setFree(true); });
    const ro = new ResizeObserver(() => m.invalidateSize());
    ro.observe(el.current);
    return () => { ro.disconnect(); m.remove(); map.current = null; };
  }, []);

  useEffect(() => {
    const m = map.current;
    const g = layer.current;
    if (!m || !g) return;
    g.clearLayers();

    const origin = route ? route.legs[0].from : o;
    const dest = route ? route.legs[route.legs.length - 1].to : d;
    const oPos = ll(`@${origin}`);
    const dPos = ll(`@${dest}`);
    const bounds = L.latLngBounds([oPos, dPos]);

    if (route) {
      route.legs.forEach((l, idx) => {
        const pts = l.via.map(ll);
        pts.forEach((p) => bounds.extend(p));
        const base = { lineCap: 'round', lineJoin: 'round' };
        if (l.mode === 'walk') {
          L.polyline(pts, { ...base, color: '#F0ECE2', weight: 9, opacity: 0.9 }).addTo(g);
          L.polyline(pts, { ...base, color: C.ink, weight: 5, dashArray: '1 9' }).addTo(g);
          const mid = [(pts[0][0] + pts[pts.length - 1][0]) / 2, (pts[0][1] + pts[pts.length - 1][1]) / 2];
          L.marker(mid, { icon: L.divIcon({ className: '', html: `<div class="nr-walk">Walk ${Math.round(l.meters / 10) * 10} m</div>`, iconSize: [0, 0] }), interactive: false, zIndexOffset: 800 }).addTo(g);
        }
        else if (l.mode === 'auto') {
          L.polyline(pts, { ...base, color: C.autoY, weight: 7 }).addTo(g);
          L.polyline(pts, { color: C.autoG, weight: 7, dashArray: '6 12' }).addTo(g);
        } else L.polyline(pts, { ...base, color: l.mode === 'metro' ? C.metro : C.bus, weight: 7, opacity: 0.95 }).addTo(g);
      });
      const mid = new Set(route.legs.flatMap((l) => [l.from, l.to]));
      mid.delete(origin);
      mid.delete(dest);
      mid.forEach((id) => L.marker(ll(id), { icon: icon('nr-pin-s', 14), interactive: false }).addTo(g).bindTooltip(NODE[id].name, { permanent: true, direction: 'top', offset: [0, -8], className: 'nr-label' }));
    }

    L.marker(oPos, { icon: icon('nr-pin-o', 18), zIndexOffset: 500 }).addTo(g).bindTooltip(NODE[origin].name, { permanent: true, direction: 'left', offset: [-10, 0], className: 'nr-label' });
    L.marker(dPos, { icon: icon('nr-pin-d', 20), zIndexOffset: 500 }).addTo(g).bindTooltip(NODE[dest].name, { permanent: true, direction: 'right', offset: [12, 0], className: 'nr-label nr-dest' });

    m.invalidateSize();
    const leg = route && focus ? route.legs[focus.i] : null;
    if (leg) m.fitBounds(L.latLngBounds(leg.via.map(ll)), { padding: [140, 140], maxZoom: 17 });
    else m.fitBounds(bounds, { padding: [80, 80], maxZoom: 13 });
  }, [route, o, d, focus, !!live]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const m = map.current;
    if (!m) return;
    if (!live) {
      if (marker.current) { marker.current.remove(); marker.current = null; }
      lastMode.current = null;
      follow.current = true;
      setFree(false);
      return;
    }
    if (!marker.current) {
      marker.current = L.marker(live.latlng, { icon: L.divIcon({ className: '', html: '<div class="nr-me"></div>', iconSize: [26, 26], iconAnchor: [13, 13] }), zIndexOffset: 2000, interactive: false }).addTo(m);
    } else marker.current.setLatLng(live.latlng);
    const zoom = live.mode === 'walk' ? 16 : live.mode === 'auto' ? 14 : 13;
    if (lastMode.current !== live.mode) {
      lastMode.current = live.mode;
      if (follow.current) m.setView(live.latlng, zoom, { animate: true });
    } else if (follow.current) m.panTo(live.latlng, { animate: false });
  }, [live]);

  return (
    <figure className="relative h-full w-full">
      <div ref={el} className="absolute inset-0" role="region" aria-label="Map of the selected route" />
      {route && (
        <div className="absolute left-4 top-4 z-[1000] rounded-full bg-ink px-4 py-2 text-sm font-bold text-paper shadow-lg">
          {live && !live.done ? `${Math.ceil(live.minsLeft)} min left` : `${route.time} min`} · arrive {clock(depart, route.time)}
        </div>
      )}
      {focus && (
        <button onClick={() => onFocus(null)} className="absolute right-4 top-4 z-[1000] rounded-full bg-card px-4 py-2 text-sm font-bold shadow-lg transition-colors hover:bg-raise">Show full route</button>
      )}
      {free && live && (
        <button onClick={() => { follow.current = true; setFree(false); map.current.setView(live.latlng, map.current.getZoom(), { animate: true }); }} className="absolute right-4 top-16 z-[1000] rounded-full bg-card px-4 py-2 text-sm font-bold shadow-lg transition-colors hover:bg-raise">Re-centre</button>
      )}
      <figcaption className="absolute bottom-6 left-4 z-[1000] flex flex-wrap gap-x-4 gap-y-1 rounded-full bg-card/95 px-4 py-2 text-xs font-semibold text-muted shadow-md">
        <span><i className="mr-1.5 inline-block h-[3px] w-4 align-middle" style={{ background: C.metro }} />Metro</span>
        <span><i className="mr-1.5 inline-block h-[3px] w-4 align-middle" style={{ background: C.bus }} />Bus</span>
        <span><i className="mr-1.5 inline-block h-[3px] w-4 align-middle" style={{ background: 'linear-gradient(90deg,#F5C400 60%,#1E8E3E 60%)' }} />Auto</span>
        <span>··· Walk</span>
      </figcaption>
    </figure>
  );
}
