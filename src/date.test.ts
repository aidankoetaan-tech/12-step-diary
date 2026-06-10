import { describe, expect, it } from 'vitest';
import {
  daysSinceIsoDate,
  daysSinceStoredIsoDate,
  isValidPastIsoDate,
  nextMilestone,
} from './date';

const today = new Date(2026, 5, 10); // 2026-06-10 local midnight baseline

describe('isValidPastIsoDate', () => {
  it('accepts real past and current YYYY-MM-DD dates', () => {
    expect(isValidPastIsoDate('2024-02-29', today)).toBe(true);
    expect(isValidPastIsoDate('2026-06-10', today)).toBe(true);
  });

  it('rejects impossible calendar dates instead of allowing JS Date normalization', () => {
    expect(isValidPastIsoDate('2025-02-29', today)).toBe(false);
    expect(isValidPastIsoDate('2025-02-31', today)).toBe(false);
    expect(isValidPastIsoDate('2025-13-01', today)).toBe(false);
    expect(isValidPastIsoDate('2025-00-10', today)).toBe(false);
    expect(isValidPastIsoDate('2025-04-31', today)).toBe(false);
  });

  it('rejects malformed and future dates', () => {
    expect(isValidPastIsoDate('2026-6-10', today)).toBe(false);
    expect(isValidPastIsoDate('not-a-date', today)).toBe(false);
    expect(isValidPastIsoDate('2026-06-11', today)).toBe(false);
  });
});

describe('daysSinceIsoDate', () => {
  it('calculates whole local-calendar days from a valid ISO date', () => {
    expect(daysSinceIsoDate('2026-06-10', today)).toBe(0);
    expect(daysSinceIsoDate('2026-06-09', today)).toBe(1);
    expect(daysSinceIsoDate('2026-06-03', today)).toBe(7);
  });

  it('throws on invalid dates so callers cannot silently display normalized counters', () => {
    expect(() => daysSinceIsoDate('2025-02-31', today)).toThrow(/invalid/i);
  });
});

describe('daysSinceStoredIsoDate', () => {
  it('returns null for missing or legacy-invalid saved dates instead of throwing during render', () => {
    expect(daysSinceStoredIsoDate(null, today)).toBeNull();
    expect(daysSinceStoredIsoDate('2025-02-31', today)).toBeNull();
  });
});

describe('nextMilestone', () => {
  it('returns the next fixed milestone or next full year', () => {
    expect(nextMilestone(0)).toBe(1);
    expect(nextMilestone(1)).toBe(7);
    expect(nextMilestone(365)).toBe(730);
    expect(nextMilestone(1200)).toBe(1460);
  });
});
