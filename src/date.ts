const DAY_MS = 86_400_000;
const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MILESTONES = [1, 7, 30, 60, 90, 180, 365, 730, 1095];

function localMidnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseIsoDate(value: string): Date | null {
  const match = ISO_DATE_RE.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
}

export function isValidPastIsoDate(value: string, today: Date = new Date()): boolean {
  const parsed = parseIsoDate(value);
  if (!parsed) return false;
  return localMidnight(parsed).getTime() <= localMidnight(today).getTime();
}

export function daysSinceIsoDate(isoDate: string, today: Date = new Date()): number {
  const parsed = parseIsoDate(isoDate);
  if (!parsed) throw new Error(`Invalid ISO date: ${isoDate}`);

  const start = localMidnight(parsed);
  const end = localMidnight(today);
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / DAY_MS));
}

export function daysSinceStoredIsoDate(isoDate: string | null, today: Date = new Date()): number | null {
  if (!isoDate || !isValidPastIsoDate(isoDate, today)) return null;
  return daysSinceIsoDate(isoDate, today);
}

export function nextMilestone(days: number): number {
  return MILESTONES.find((m) => m > days) ?? (Math.floor(days / 365) + 1) * 365;
}
