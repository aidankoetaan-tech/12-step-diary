import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { JournalEntry, StepsProgress, SupportContact } from './types';

// Everything this app stores is sensitive (recovery progress, journal
// entries, support contacts), so it all goes through SecureStore and is
// encrypted at rest. Each journal entry lives under its own key to stay
// well under platform value-size limits. SecureStore has no web
// implementation, so the web build falls back to localStorage.

const isWeb = Platform.OS === 'web';

async function getRaw(key: string): Promise<string | null> {
  if (isWeb) return globalThis.localStorage?.getItem(key) ?? null;
  return await SecureStore.getItemAsync(key);
}

async function setRaw(key: string, value: string): Promise<void> {
  if (isWeb) {
    globalThis.localStorage?.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function deleteRaw(key: string): Promise<void> {
  if (isWeb) {
    globalThis.localStorage?.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

const KEYS = {
  sobrietyDate: 'sobriety.date',
  stepsProgress: 'steps.progress',
  journalIndex: 'journal.index',
  journalEntry: (id: string) => `journal.entry.${id}`,
  contacts: 'support.contacts',
};

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await getRaw(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  await setRaw(key, JSON.stringify(value));
}

// --- Sobriety date ---

export async function getSobrietyDate(): Promise<string | null> {
  return await getRaw(KEYS.sobrietyDate);
}

export async function setSobrietyDate(isoDate: string): Promise<void> {
  await setRaw(KEYS.sobrietyDate, isoDate);
}

// --- Steps progress ---

export async function getStepsProgress(): Promise<StepsProgress> {
  return await readJson<StepsProgress>(KEYS.stepsProgress, {});
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
  await deleteRaw(KEYS.journalEntry(id));
}

// --- Support contacts ---

export async function getContacts(): Promise<SupportContact[]> {
  return await readJson<SupportContact[]>(KEYS.contacts, []);
}

export async function setContacts(contacts: SupportContact[]): Promise<void> {
  await writeJson(KEYS.contacts, contacts);
}

export function newId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}
