// Helpers for the site's terminal look.
import { createHash } from 'node:crypto';

// The headline in two tones: up to and including the first colon, then the rest.
export function splitHero(hero: string): { lead: string; rest: string } {
  const i = hero.indexOf(':');
  return i === -1
    ? { lead: hero, rest: '' }
    : { lead: hero.slice(0, i + 1), rest: hero.slice(i + 1) };
}

// A short, git-style hash for a line of the experience log. Made up, but the same every build.
export function shortHash(text: string): string {
  return createHash('sha1').update(text).digest('hex').slice(0, 7);
}
