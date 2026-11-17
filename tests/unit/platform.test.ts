// @vitest-environment happy-dom
import { expect, test } from 'vitest';
import { isMacLike, isPaletteShortcut, isSlashShortcut } from '@/lib/platform';

test('detects mac-like agents', () => {
  expect(isMacLike('Mozilla/5.0 (Macintosh; Intel Mac OS X 15_0)')).toBe(true);
  expect(isMacLike('Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X)')).toBe(true);
  expect(isMacLike('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')).toBe(false);
});

test('ctrl+k on windows, cmd+k on mac', () => {
  const k = { key: 'k', metaKey: false, ctrlKey: true, altKey: false };
  expect(isPaletteShortcut(k, false)).toBe(true);
  expect(isPaletteShortcut(k, true)).toBe(false);
  expect(isPaletteShortcut({ ...k, ctrlKey: false, metaKey: true }, true)).toBe(true);
  expect(isPaletteShortcut({ ...k, key: 'K' }, false)).toBe(true);
  expect(isPaletteShortcut({ ...k, altKey: true }, false)).toBe(false);
});

test('slash is ignored while typing', () => {
  const input = document.createElement('input');
  const area = document.createElement('textarea');
  const editable = document.createElement('div');
  editable.setAttribute('contenteditable', 'true');
  expect(isSlashShortcut({ key: '/' }, document.body)).toBe(true);
  expect(isSlashShortcut({ key: '/' }, input)).toBe(false);
  expect(isSlashShortcut({ key: '/' }, area)).toBe(false);
  expect(isSlashShortcut({ key: '/' }, editable)).toBe(false);
  expect(isSlashShortcut({ key: 'k' }, document.body)).toBe(false);
});
