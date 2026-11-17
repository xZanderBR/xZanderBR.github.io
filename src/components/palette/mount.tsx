// Loaded on first use only, so React never runs during page load.
import { createRoot } from 'react-dom/client';
import CommandPalette from './CommandPalette';
import { paletteStore } from './store';
import type { PaletteData } from './types';

export function mountPalette(data: PaletteData, container: HTMLElement) {
  createRoot(container).render(<CommandPalette {...data} />);
  return {
    open: () => paletteStore.set(true),
    toggle: () => paletteStore.set(!paletteStore.get()),
  };
}
