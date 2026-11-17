// Open state shared by the page script (shortcuts, Search button) and the React palette.
const listeners = new Set<() => void>();
let open = false;

export const paletteStore = {
  get: () => open,
  set(next: boolean) {
    open = next;
    listeners.forEach((l) => l());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
