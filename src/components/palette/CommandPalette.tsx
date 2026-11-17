import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { navigate } from 'astro:transitions/client';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { paletteStore } from './store';
import type { PaletteData } from './types';

export default function CommandPalette({ projects, email, resumeHref, links }: PaletteData) {
  const open = useSyncExternalStore(paletteStore.subscribe, paletteStore.get, paletteStore.get);
  const setOpen = paletteStore.set;
  const [status, setStatus] = useState('');
  const statusTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(statusTimer.current), []);

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
      <DialogContent
        showCloseButton={false}
        className="top-1/4 translate-y-0 overflow-hidden p-0"
        onCloseAutoFocus={(e) => {
          // The trigger lives outside React; send focus back to it.
          e.preventDefault();
          document.querySelector<HTMLElement>('[data-palette-trigger]')?.focus();
        }}
      >
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
                  <span className="flex-1">{p.title}</span>
                  <span className="text-[13px] text-muted-foreground">{p.hint}</span>
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
