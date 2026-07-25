/**
 * Minimal class-name joiner. Falsy values drop out so conditional classes can
 * be written inline without pulling in a dependency.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
