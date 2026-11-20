// Sample transport network for Bengaluru.
// Coordinates and bus routes are approximate/illustrative — swap with real
// BMRCL / BMTC (GTFS) data once the backend is ready.

// [id, name, lat, lng, selectable as origin/destination]
const RAW = [
  ['majestic', 'Majestic', 12.9767, 77.5713, true],
  ['krmarket', 'KR Market', 12.9657, 77.5775, false],
  ['lalbagh', 'Lalbagh', 12.9507, 77.583, false],
  ['jayanagar', 'Jayanagar', 12.9296, 77.58, true],
  ['banashankari', 'Banashankari', 12.9157, 77.5737, true],
  ['jpnagar', 'JP Nagar', 12.906, 77.577, true],
  ['yelachenahalli', 'Yelachenahalli', 12.8955, 77.57, false],
  ['malleshwaram', 'Malleshwaram', 12.9988, 77.5707, true],
  ['rajajinagar', 'Rajajinagar', 12.9916, 77.5546, false],
  ['yeshwanthpur', 'Yeshwanthpur', 13.0231, 77.5503, true],
  ['hebbal', 'Hebbal', 13.0358, 77.597, true],
  ['vijayanagar', 'Vijayanagar', 12.9712, 77.53, true],
  ['hosahalli', 'Hosahalli', 12.9747, 77.5448, false],
  ['kengeri', 'Kengeri', 12.9177, 77.4837, true],
  ['cubbon', 'Cubbon Park', 12.981, 77.597, false],
  ['mgroad', 'MG Road', 12.9757, 77.6068, true],
  ['trinity', 'Trinity', 12.9731, 77.6174, false],
  ['halasuru', 'Halasuru', 12.9764, 77.626, false],
  ['indiranagar', 'Indiranagar', 12.9784, 77.6408, true],
  ['baiyappanahalli', 'Baiyappanahalli', 12.9906, 77.6521, false],
  ['krpuram', 'KR Puram', 13.0004, 77.6959, true],
  ['hoodi', 'Hoodi', 12.9917, 77.716, false],
  ['whitefield', 'Whitefield', 12.9962, 77.7579, true],
  ['marathahalli', 'Marathahalli', 12.9591, 77.6974, true],
  ['koramangala', 'Koramangala', 12.9352, 77.6245, true],
  ['silkboard', 'Silk Board', 12.9177, 77.6233, true],
  ['hsr', 'HSR Layout', 12.9116, 77.6389, true],
  ['bellandur', 'Bellandur', 12.9304, 77.6784, true],
  ['ecity', 'Electronic City', 12.8452, 77.6602, true],
];

export const NODES = RAW.map(([id, name, lat, lng, place]) => ({ id, name, lat, lng, place }));
export const NODE = Object.fromEntries(NODES.map((n) => [n.id, n]));

export const METRO = {
  purple: {
    name: 'Purple Line',
    stops: ['kengeri', 'vijayanagar', 'hosahalli', 'majestic', 'cubbon', 'mgroad', 'trinity', 'halasuru', 'indiranagar', 'baiyappanahalli', 'krpuram', 'hoodi', 'whitefield'],
  },
  green: {
    name: 'Green Line',
    stops: ['yeshwanthpur', 'rajajinagar', 'malleshwaram', 'majestic', 'krmarket', 'lalbagh', 'jayanagar', 'banashankari', 'jpnagar', 'yelachenahalli'],
  },
};

export const BUSES = [
  { id: '335E', stops: ['majestic', 'mgroad', 'indiranagar', 'marathahalli', 'hoodi', 'whitefield'], ac: false },
  { id: '500D', stops: ['hebbal', 'mgroad', 'koramangala', 'silkboard', 'ecity'], ac: true },
  { id: '500K', stops: ['hsr', 'koramangala', 'mgroad', 'majestic'], ac: true },
  { id: 'G-4', stops: ['silkboard', 'bellandur', 'marathahalli', 'krpuram'], ac: false },
  { id: '356', stops: ['ecity', 'silkboard', 'jayanagar', 'krmarket', 'majestic'], ac: false },
  { id: '258', stops: ['hebbal', 'malleshwaram', 'majestic'], ac: false },
  { id: '45A', stops: ['banashankari', 'jayanagar', 'koramangala', 'indiranagar'], ac: false },
  { id: 'G-9', stops: ['hsr', 'bellandur', 'marathahalli'], ac: false },
  { id: '201', stops: ['yeshwanthpur', 'malleshwaram', 'majestic'], ac: false },
  { id: 'V-365', stops: ['kengeri', 'vijayanagar', 'majestic'], ac: false },
];

export const PLACES = NODES.filter((n) => n.place).sort((a, b) => a.name.localeCompare(b.name));

// Deterministic 250-800 m walk between a place's doorstep ("@id") and its nearest stop.
export function accessWalk(id) {
  let h = 7;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 1000;
  return 250 + (h % 550);
}

// [lat, lng] for a stop, or for a place's doorstep ("@id"), offset from the stop
// by the access-walk distance in a fixed direction so walking legs have real length.
export function coord(id) {
  if (id[0] !== '@') return [NODE[id].lat, NODE[id].lng];
  const key = id.slice(1);
  const n = NODE[key];
  let h = 3;
  for (const ch of key) h = (h * 17 + ch.charCodeAt(0)) % 360;
  const a = (h * Math.PI) / 180;
  const m = accessWalk(key);
  return [n.lat + (m * Math.cos(a)) / 111320, n.lng + (m * Math.sin(a)) / (111320 * Math.cos((n.lat * Math.PI) / 180))];
}
