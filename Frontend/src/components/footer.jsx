export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-sm text-slate-500 sm:flex-row">
        <p>© {new Date().getFullYear()} GIU Nexus</p>
        <p>Built for the GIU Software Engineering course.</p>
      </div>
    </footer>
  );
}
