import { useEffect, useRef, useState } from 'react';
import { navigate } from 'astro:transitions/client';
import { Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { isMacLike, isPaletteShortcut, isSlashShortcut } from '@/lib/platform';

export interface Props {
  projects: { title: string; href: string; hint: string }[];
  email: string;
  resumeHref: string;
  links: { label: string; href: string }[];
}

export default function CommandPalette({ projects, email, resumeHref, links }: Props) {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState('');
  const statusTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const mac = isMacLike(navigator.userAgent);
    const onKey = (e: KeyboardEvent) => {
      if (isPaletteShortcut(e, mac)) {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (isSlashShortcut(e, e.target)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    setReady(true);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(statusTimer.current);
    };
  }, []);

  function go(href: string) {
    setOpen(false);
    navigate(href);
  }

  function leave(href: string) {
    setOpen(false);
    window.location.assign(href);
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      leave(`mailto:${email}`);
      return;
    }
    setStatus('Email copied');
    window.clearTimeout(statusTimer.current);
    statusTimer.current = window.setTimeout(() => setStatus(''), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-keyshortcuts="Control+K Meta+K /"
          data-palette-ready={ready ? '' : undefined}
          className="inline-flex h-8 items-center gap-2 rounded-md border border-rule px-2 text-[13px] text-muted-foreground hover:bg-muted hover:text-ink"
        >
          <Search aria-hidden="true" className="size-4" />
          <span className="sr-only">Search</span>
          <span className="hidden sm:inline-flex">
            <kbd data-kbd="mac" className="font-sans">
              ⌘K
            </kbd>
            <kbd data-kbd="other" className="font-sans">
              Ctrl K
            </kbd>
          </span>
        </button>
      </DialogTrigger>
      <DialogContent showCloseButton={false} className="top-1/4 translate-y-0 overflow-hidden p-0">
        <DialogTitle className="sr-only">Search the site</DialogTitle>
        <DialogDescription className="sr-only">
          Jump to a project, copy my email, or open my resume.
        </DialogDescription>
        <Command>
          <CommandInput placeholder="Search projects and links" />
          <CommandList>
            <CommandEmpty>Nothing matches that.</CommandEmpty>
            <CommandGroup heading="Projects">
              {projects.map((p) => (
                <CommandItem
                  key={p.href}
                  value={p.title}
                  keywords={[p.hint]}
                  onSelect={() => go(p.href)}
                >
                  <span>{p.title}</span>
                  <span className="ml-auto text-[13px] text-muted-foreground">{p.hint}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Links">
              {email && (
                <CommandItem value="Copy email" onSelect={copyEmail}>
                  Copy email
                </CommandItem>
              )}
              <CommandItem value="Resume" onSelect={() => leave(resumeHref)}>
                Resume (PDF)
              </CommandItem>
              {links.map((l) => (
                <CommandItem key={l.href} value={l.label} onSelect={() => leave(l.href)}>
                  {l.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
        <p role="status" aria-live="polite" className="px-3 pb-2 text-[13px] text-muted-foreground">
          {status}
        </p>
      </DialogContent>
    </Dialog>
  );
}
