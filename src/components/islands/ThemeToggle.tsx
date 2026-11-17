import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

function isDark() {
  return document.documentElement.classList.contains('dark');
}

export default function ThemeToggle() {
  // Unknown until mounted: the server can't know the visitor's theme.
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    setDark(isDark());
  }, []);

  function toggle() {
    const next = !isDark();
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {
      // Storage can be blocked; the choice still applies to this page.
    }
    setDark(next);
  }

  const label =
    dark === null ? 'Toggle theme' : dark ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-ink"
    >
      <Sun aria-hidden="true" className="hidden size-4 dark:block" />
      <Moon aria-hidden="true" className="block size-4 dark:hidden" />
    </button>
  );
}
