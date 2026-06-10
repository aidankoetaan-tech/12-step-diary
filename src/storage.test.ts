import { beforeEach, describe, expect, it, vi } from 'vitest';

const secureStore = new Map<string, string>();

vi.mock('react-native', () => ({
  Platform: { OS: 'android' },
}));

vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(async (key: string) => secureStore.get(key) ?? null),
  setItemAsync: vi.fn(async (key: string, value: string) => {
    secureStore.set(key, value);
  }),
  deleteItemAsync: vi.fn(async (key: string) => {
    secureStore.delete(key);
  }),
}));

import {
  deleteJournalEntry,
  getJournalEntries,
  saveJournalEntry,
  __resetStorageForTests,
} from './storage';

describe('journal storage', () => {
  beforeEach(async () => {
    secureStore.clear();
    await __resetStorageForTests();
  });

  it('saves entries separately, returns newest first, and deletes from index plus entry key', async () => {
    await saveJournalEntry({
      id: 'old',
      createdAt: '2026-06-09T10:00:00.000Z',
      mood: '🙂',
      text: 'older entry',
    });
    await saveJournalEntry({
      id: 'new',
      createdAt: '2026-06-10T10:00:00.000Z',
      mood: '😄',
      text: 'newer entry',
    });

    expect((await getJournalEntries()).map((entry) => entry.id)).toEqual(['new', 'old']);

    await deleteJournalEntry('new');

    expect((await getJournalEntries()).map((entry) => entry.id)).toEqual(['old']);
    expect(secureStore.has('journal.entry.new')).toBe(false);
  });
});
