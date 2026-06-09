import * as SecureStore from 'expo-secure-store';
import { JournalEntry, StepsProgress, SupportContact } from './types';

// Everything this app stores is sensitive (recovery progress, journal
// entries, support contacts), so it all goes through SecureStore and is
// encrypted at rest. Each journal entry lives under its own key to stay
// well under platform value-size limits.

const KEYS = {
  sobrietyDate: 'sobriety.date',
  stepsProgress: 'steps.progress',
  journalIndex: 'journal.index',
  journalEntry: (id: string) => `journal.entry.${id}`,
  contacts: 'support.contacts',
};

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await SecureStore.getItemAsync(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  await SecureStore.setItemAsync(key, JSON.stringify(value));
}

// --- Sobriety date ---

export async function getSobrietyDate(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.sobrietyDate);
}

export async function setSobrietyDate(isoDate: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.sobrietyDate, isoDate);
}

// --- Steps progress ---

export async function getStepsProgress(): Promise<StepsProgress> {
  return readJson<StepsProgress>(KEYS.stepsProgress, {});
}

export async function setStepsProgress(progress: StepsProgress): Promise<void> {
  await writeJson(KEYS.stepsProgress, progress);
}

// --- Journal ---

export async function getJournalEntries(): Promise<JournalEntry[]> {
  const ids = await readJson<string[]>(KEYS.journalIndex, []);
  const entries: JournalEntry[] = [];
  for (const id of ids) {
    const entry = await readJson<JournalEntry | null>(KEYS.journalEntry(id), null);
    if (entry) entries.push(entry);
  }
  return entries.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function saveJournalEntry(entry: JournalEntry): Promise<void> {
  await writeJson(KEYS.journalEntry(entry.id), entry);
  const ids = await readJson<string[]>(KEYS.journalIndex, []);
  if (!ids.includes(entry.id)) {
    ids.push(entry.id);
    await writeJson(KEYS.journalIndex, ids);
  }
}

export async function deleteJournalEntry(id: string): Promise<void> {
  const ids = await readJson<string[]>(KEYS.journalIndex, []);
  await writeJson(
    KEYS.journalIndex,
    ids.filter((existing) => existing !== id),
  );
  await SecureStore.deleteItemAsync(KEYS.journalEntry(id));
}

// --- Support contacts ---

export async function getContacts(): Promise<SupportContact[]> {
  return readJson<SupportContact[]>(KEYS.contacts, []);
}

export async function setContacts(contacts: SupportContact[]): Promise<void> {
  await writeJson(KEYS.contacts, contacts);
}

export function newId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}
