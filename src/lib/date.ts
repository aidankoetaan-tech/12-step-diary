// Date helpers for the sobriety day counter.

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Parse a YYYY-MM-DD string into a local Date at midnight.
function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function todayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Whole days between the sobriety date and today (inclusive of day 0).
export function daysSince(sobrietyDate: string | null): number {
  if (!sobrietyDate) return 0;
  const start = parseLocalDate(sobrietyDate).getTime();
  const today = parseLocalDate(todayISO()).getTime();
  const diff = Math.floor((today - start) / MS_PER_DAY);
  return diff < 0 ? 0 : diff;
}

// Break a day count into years / months / days for display.
export function breakdown(days: number): { years: number; months: number; days: number } {
  const years = Math.floor(days / 365);
  const remAfterYears = days - years * 365;
  const months = Math.floor(remAfterYears / 30);
  const remDays = remAfterYears - months * 30;
  return { years, months, days: remDays };
}

export function formatDateLong(iso: string): string {
  return parseLocalDate(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
