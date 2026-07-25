/**
 * Gives each medicine a stable colour so a pill's icon chip is recognisable
 * at a glance across the app — the same medicine always lands on the same
 * colour, but different medicines don't collide.
 *
 * Deliberately not tied to meaning (unlike `Badge`'s tones, where rose means
 * "high priority" and gold means "AI"): this palette exists purely to
 * differentiate items in a list, so any medicine can land on any colour.
 */
const medicationPalette = [
  { bg: "bg-clay-100", text: "text-clay-600" },
  { bg: "bg-gold-200", text: "text-gold-600" },
  { bg: "bg-peach-200", text: "text-peach-500" },
  { bg: "bg-olive-100", text: "text-olive-700" },
  { bg: "bg-rose-100", text: "text-rose-500" },
] as const;

export function medicationColor(id: string): { bg: string; text: string } {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return medicationPalette[hash % medicationPalette.length];
}
