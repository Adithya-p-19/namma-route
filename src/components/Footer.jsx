const team = ['Adithya Patni', 'Aditya Ambaldaghe', 'Aditya GT'];

const stack = [
  ['React and Tailwind CSS', 'Interface'],
  ['Leaflet and OpenStreetMap', 'Map'],
  ['Multi-objective search', 'Routing engine'],
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-raise">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <p className="max-w-4xl font-display text-[clamp(1.8rem,5vw,3.8rem)] leading-[1.05]">Every way home, <span className="text-pin">side by side.</span></p>
        <p className="mt-4 max-w-xl text-muted">Namma Route compares walking, BMTC buses, Namma Metro and autos across Bengaluru, then ranks the options by what matters to you.</p>
        <div className="mt-12 grid gap-10 text-sm md:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-semibold text-muted">Built by</p>
            {team.map((n) => <p key={n} className="border-b border-line py-2 font-semibold">{n}</p>)}
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold text-muted">Built with</p>
            {stack.map(([n, r]) => (
              <p key={n} className="flex justify-between border-b border-line py-2"><span className="font-semibold">{n}</span><span className="text-muted">{r}</span></p>
            ))}
          </div>
        </div>
        <p className="mt-12 text-xs text-muted">Prototype · stops, fares and bus routes are sample data · Map data © OpenStreetMap contributors</p>
      </div>
    </footer>
  );
}
