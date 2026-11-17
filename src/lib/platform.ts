type ShortcutKey = Pick<KeyboardEvent, 'key' | 'metaKey' | 'ctrlKey' | 'altKey'>;

export function isMacLike(userAgent: string): boolean {
  return /Mac|iPhone|iPad/.test(userAgent);
}

// Cmd+K on Mac, Ctrl+K everywhere else.
export function isPaletteShortcut(e: ShortcutKey, mac: boolean): boolean {
  if (e.altKey || e.key.toLowerCase() !== 'k') return false;
  return mac ? e.metaKey : e.ctrlKey;
}

// "/" opens the palette unless the visitor is typing somewhere.
export function isSlashShortcut(
  e: Pick<KeyboardEvent, 'key'>,
  target: EventTarget | null,
): boolean {
  if (e.key !== '/') return false;
  if (!(target instanceof Element)) return true;
  return !target.closest(
    'input, textarea, select, [contenteditable]:not([contenteditable="false"])',
  );
}
