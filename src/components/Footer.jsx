const team = [
  ['Adithya Patni', '1DS24CS006'],
  ['Aditya Ambaldaghe', '1DS24CS008'],
  ['Aditya GT', '1DS24CS009'],
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-raise">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <p className="max-w-4xl font-display text-[clamp(1.8rem,5vw,3.8rem)] leading-[1.05]">Multi-objective multimodal route optimization <span className="text-pin">for urban commuters.</span></p>
        <div className="mt-12 grid gap-10 text-sm md:grid-cols-3">
          <div>
            <p className="mb-3 text-xs font-semibold text-muted">Team</p>
            {team.map(([n, u]) => <p key={u} className="flex justify-between border-b border-line py-2"><span className="font-semibold">{n}</span><span className="font-mono text-xs text-muted">{u}</span></p>)}
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold text-muted">Guide</p>
            <p className="border-b border-line py-2 font-semibold">Prof Dhananjaya Sharma</p>
            <p className="mb-3 mt-6 text-xs font-semibold text-muted">Course</p>
            <p className="border-b border-line py-2 font-semibold">22CS66 · Mini Project-II · 2026–27</p>
            <p className="py-2 text-muted">Dept. of Computer Science and Engineering</p>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold text-muted">Sustainable development goals</p>
            <div className="flex gap-3">
              <div className="flex-1 rounded-xl bg-card p-4"><p className="font-display text-4xl">11</p><p className="mt-1 text-xs leading-snug text-muted">Sustainable cities and communities</p></div>
              <div className="flex-1 rounded-xl bg-card p-4"><p className="font-display text-4xl">9</p><p className="mt-1 text-xs leading-snug text-muted">Industry, innovation and infrastructure</p></div>
            </div>
          </div>
        </div>
        <p className="mt-12 text-xs text-muted">Review 1 prototype · stops, fares and bus routes are sample data</p>
      </div>
    </footer>
  );
}
