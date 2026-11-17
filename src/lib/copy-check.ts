export type Rule = { pathIncludes?: string; pattern: RegExp };
export type Violation = { path: string; line: number; match: string };

// Built from its code point so this file never contains the character itself.
const EM_DASH: Rule = { pattern: new RegExp(String.fromCharCode(0x2014)) };

// One rule per line: "regex", or "path-fragment :: regex" to scope it.
// Blank lines and lines starting with # are ignored. Patterns are case-insensitive.
export function parseTermsFile(text: string): Rule[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => {
      const [scope, pattern] = l.includes(' :: ') ? l.split(' :: ', 2) : [undefined, l];
      return { pathIncludes: scope?.trim(), pattern: new RegExp(pattern.trim(), 'i') };
    });
}

export function findCopyViolations(path: string, text: string, rules: Rule[]): Violation[] {
  const active = [EM_DASH, ...rules].filter(
    (r) => !r.pathIncludes || path.includes(r.pathIncludes),
  );
  const found: Violation[] = [];
  text.split('\n').forEach((lineText, i) => {
    for (const rule of active) {
      const m = lineText.match(rule.pattern);
      if (m) found.push({ path, line: i + 1, match: m[0] });
    }
  });
  return found;
}

// Rules can come from the local file and from the COPY_RULES secret in CI.
export function loadRules(sources: (string | null | undefined)[]): Rule[] {
  return sources.filter((s): s is string => !!s).flatMap(parseTermsFile);
}
