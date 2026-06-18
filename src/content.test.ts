import { describe, expect, it } from 'vitest';
import {
  earnedMilestoneCount,
  JOURNAL_PROMPTS,
  milestoneLabel,
  MILESTONES_META,
  REFLECTIONS,
  reflectionForToday,
  TWELVE_STEPS,
} from './content';

describe('twelve steps content', () => {
  it('defines all twelve steps in order', () => {
    expect(TWELVE_STEPS).toHaveLength(12);
    TWELVE_STEPS.forEach((step, index) => expect(step.number).toBe(index + 1));
  });

  it('gives every step a title and text', () => {
    for (const step of TWELVE_STEPS) {
      expect(step.title.length).toBeGreaterThan(0);
      expect(step.text.length).toBeGreaterThan(10);
    }
  });
});

describe('reflectionForToday', () => {
  it('is deterministic and returns a known reflection', () => {
    const date = new Date(2026, 5, 10);
    const reflection = reflectionForToday(date);
    expect(REFLECTIONS).toContain(reflection);
    expect(reflectionForToday(date)).toBe(reflection);
  });

  it('rotates between consecutive days', () => {
    const a = reflectionForToday(new Date(2026, 5, 10));
    const b = reflectionForToday(new Date(2026, 5, 11));
    expect(a).not.toBe(b);
  });
});

describe('journal prompts', () => {
  it('are present and non-empty', () => {
    expect(JOURNAL_PROMPTS.length).toBeGreaterThanOrEqual(3);
    for (const prompt of JOURNAL_PROMPTS) {
      expect(prompt.trim().length).toBeGreaterThan(0);
    }
  });
});

describe('milestones', () => {
  it('are ordered by ascending day count', () => {
    for (let i = 1; i < MILESTONES_META.length; i++) {
      expect(MILESTONES_META[i].days).toBeGreaterThan(MILESTONES_META[i - 1].days);
    }
  });

  it('counts only milestones reached', () => {
    expect(earnedMilestoneCount(null)).toBe(0);
    expect(earnedMilestoneCount(0)).toBe(0);
    expect(earnedMilestoneCount(1)).toBe(1);
    expect(earnedMilestoneCount(90)).toBe(5);
    expect(earnedMilestoneCount(5000)).toBe(MILESTONES_META.length);
  });

  it('labels known thresholds and falls back to whole years', () => {
    expect(milestoneLabel(7)).toBe('1 week');
    expect(milestoneLabel(365)).toBe('1 year');
    expect(milestoneLabel(1460)).toBe('4 years');
  });
});
