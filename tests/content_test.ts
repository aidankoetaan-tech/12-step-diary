// Tests for the dependency-free program content.
// Run with: node --experimental-strip-types --test tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  JOURNAL_PROMPTS,
  REFLECTIONS,
  reflectionForToday,
  TWELVE_STEPS,
} from '../src/content.ts';

test('twelve steps are defined in order', () => {
  assert.equal(TWELVE_STEPS.length, 12);
  TWELVE_STEPS.forEach((step, index) => assert.equal(step.number, index + 1));
});

test('every step has a title and text', () => {
  for (const step of TWELVE_STEPS) {
    assert.ok(step.title.length > 0, `step ${step.number} missing title`);
    assert.ok(step.text.length > 10, `step ${step.number} missing text`);
  }
});

test('reflectionForToday is deterministic and valid', () => {
  const date = new Date(2026, 5, 10);
  const reflection = reflectionForToday(date);
  assert.ok(REFLECTIONS.includes(reflection));
  assert.equal(reflectionForToday(date), reflection);
});

test('consecutive days rotate through reflections', () => {
  const a = reflectionForToday(new Date(2026, 5, 10));
  const b = reflectionForToday(new Date(2026, 5, 11));
  assert.notEqual(a, b);
});

test('journal prompts are present and non-empty', () => {
  assert.ok(JOURNAL_PROMPTS.length >= 3);
  for (const prompt of JOURNAL_PROMPTS) {
    assert.ok(prompt.trim().length > 0);
  }
});
