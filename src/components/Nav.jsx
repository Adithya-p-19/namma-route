export default function Nav() {
  const link = 'text-sm font-medium text-muted transition-colors hover:text-ink';
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-5">
        <a href="#app" className="flex items-center gap-2.5" aria-label="Namma Route home">
          <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
            <path d="M2 16h8c6 0 6-9 12-9h6M10 16h18M10 16c6 0 6 9 12 9h6" stroke="rgb(var(--metro))" strokeWidth="3" fill="none" strokeLinecap="round" />
            <circle cx="29" cy="16" r="3" fill="#E11D48" />
          </svg>
          <span className="font-display text-xl leading-none">Namma Route</span>
        </a>
        <nav className="flex items-center gap-6">
          <a className={`${link} hidden sm:inline`} href="#app">Plan</a>
          <a className={`${link} hidden sm:inline`} href="#compare">Compare</a>
          <a className={`${link} hidden md:inline`} href="#how">How it works</a>
          <a className={`${link} hidden md:inline`} href="#next">Roadmap</a>
          <span className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-muted">Prototype</span>
        </nav>
      </div>
    </header>
  );
}
