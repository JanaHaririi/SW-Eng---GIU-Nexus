import { useTheme } from '../context/themeContext';
import logoLight from '../assets/logo.svg';
import logoDark from '../assets/logo-dark.svg';

export default function Footer() {
  const { theme } = useTheme();
  const logoUrl = theme === 'dark' ? logoDark : logoLight;

  return (
    <footer className="mt-12 border-t border-line bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-ink-muted sm:flex-row sm:px-6">
        <div className="flex items-center gap-3 text-primary">
          <img src={logoUrl} alt="GIU Nexus" className="h-6 w-auto" />
          <span className="text-ink-subtle">
            © {new Date().getFullYear()} GIU Nexus
          </span>
        </div>
        <p className="text-ink-subtle">
          Built for the GIU Software Engineering course.
        </p>
      </div>
    </footer>
  );
}
