// Deno tests for the dependency-free program content.
// Run with: deno test -A
import {
  JOURNAL_PROMPTS,
  REFLECTIONS,
  reflectionForToday,
  TWELVE_STEPS,
} from '../src/content.ts';

function assert(condition: unknown, message = 'assertion failed'): asserts condition {
  if (!condition) throw new Error(message);
}

function assertEquals<T>(actual: T, expected: T): void {
  if (actual !== expected) {
    throw new Error(`expected ${String(expected)}, got ${String(actual)}`);
  }
}

Deno.test('twelve steps are defined in order', () => {
  assertEquals(TWELVE_STEPS.length, 12);
  TWELVE_STEPS.forEach((step, index) => assertEquals(step.number, index + 1));
});

Deno.test('every step has a title and text', () => {
  for (const step of TWELVE_STEPS) {
    assert(step.title.length > 0, `step ${step.number} missing title`);
    assert(step.text.length > 10, `step ${step.number} missing text`);
  }
});

Deno.test('reflectionForToday is deterministic and valid', () => {
  const date = new Date(2026, 5, 10);
  const reflection = reflectionForToday(date);
  assert(REFLECTIONS.includes(reflection));
  assertEquals(reflectionForToday(date), reflection);
});

Deno.test('consecutive days rotate through reflections', () => {
  const a = reflectionForToday(new Date(2026, 5, 10));
  const b = reflectionForToday(new Date(2026, 5, 11));
  assert(a !== b);
});

Deno.test('journal prompts are present and non-empty', () => {
  assert(JOURNAL_PROMPTS.length >= 3);
  for (const prompt of JOURNAL_PROMPTS) {
    assert(prompt.trim().length > 0);
  }
});
