import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import {
  AppSettings,
  DailyCheckIn,
  JournalEntry,
  PreventionPlan,
  StepsProgress,
  SupportContact,
  TriggerLog,
} from './types';

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
  checkIns: 'check.ins',
  triggerLogs: 'trigger.logs',
  preventionPlan: 'prevention.plan',
  settings: 'app.settings',
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

// --- Daily check-ins ---

export async function getCheckIns(): Promise<DailyCheckIn[]> {
  return await readJson<DailyCheckIn[]>(KEYS.checkIns, []);
}

export async function addCheckIn(
  checkIn: Omit<DailyCheckIn, 'date'>,
): Promise<DailyCheckIn> {
  const checkIns = await getCheckIns();
  const today = new Date().toISOString().split('T')[0];
  const entry: DailyCheckIn = { ...checkIn, date: today };
  const existing = checkIns.findIndex((c) => c.date === today);
  if (existing >= 0) {
    checkIns[existing] = entry;
  } else {
    checkIns.unshift(entry);
  }
  await writeJson(KEYS.checkIns, checkIns);
  return entry;
}

export async function getTodayCheckIn(): Promise<DailyCheckIn | null> {
  const checkIns = await getCheckIns();
  const today = new Date().toISOString().split('T')[0];
  return checkIns.find((c) => c.date === today) ?? null;
}

export async function getCheckInStreak(): Promise<number> {
  const checkIns = await getCheckIns();
  if (checkIns.length === 0) return 0;
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    if (checkIns.some((c) => c.date === dateStr)) {
      streak++;
    } else if (i > 0) {
      break; // gap in streak
    }
  }
  return streak;
}

// --- Trigger logs ---

export async function getTriggerLogs(): Promise<TriggerLog[]> {
  return await readJson<TriggerLog[]>(KEYS.triggerLogs, []);
}

export async function addTriggerLog(log: TriggerLog): Promise<void> {
  const logs = await getTriggerLogs();
  logs.unshift(log);
  await writeJson(KEYS.triggerLogs, logs);
}

// --- Prevention plan ---

export async function getPreventionPlan(): Promise<PreventionPlan | null> {
  return await readJson<PreventionPlan | null>(KEYS.preventionPlan, null);
}

export async function savePreventionPlan(plan: PreventionPlan): Promise<void> {
  await writeJson(KEYS.preventionPlan, plan);
}

// --- Settings ---

const DEFAULT_SETTINGS: AppSettings = {
  darkMode: true,
  notificationsEnabled: true,
  checkInReminderTime: '09:00',
};

export async function getSettings(): Promise<AppSettings> {
  const stored = await readJson<Partial<AppSettings> | null>(KEYS.settings, null);
  return stored ? { ...DEFAULT_SETTINGS, ...stored } : DEFAULT_SETTINGS;
}

export async function saveSettings(settings: Partial<AppSettings>): Promise<void> {
  const current = await getSettings();
  await writeJson(KEYS.settings, { ...current, ...settings });
}

// --- Export ---

export async function exportAllData(): Promise<string> {
  const [sobrietyDate, checkIns, triggers, plan] = await Promise.all([
    getSobrietyDate(),
    getCheckIns(),
    getTriggerLogs(),
    getPreventionPlan(),
  ]);

  let report = `12-STEP DIARY — DATA EXPORT\n`;
  report += `Generated: ${new Date().toLocaleString()}\n\n`;
  report += `Sobriety Date: ${sobrietyDate ?? 'Not set'}\n\n`;

  report += `=== PREVENTION PLAN ===\n`;
  if (plan) {
    const labels: Record<string, string> = {
      triggers: 'My Triggers',
      warning_signs: 'Early Warning Signs',
      coping_strategies: 'My Coping Strategies',
      support_network: 'My Support Network',
      reasons: 'My Reasons to Stay Sober',
      emergency_plan: 'Emergency Plan',
      big_book_signs: 'My Big Book Warning Signs',
      big_book_antidote: 'My Big Book Antidote',
      if_i_relapse: 'If I Relapse',
    };
    for (const [key, label] of Object.entries(labels)) {
      if (plan[key]) {
        report += `\n${label}:\n${plan[key]}\n`;
      }
    }
  } else {
    report += `(Not yet completed)\n`;
  }

  report += `\n=== RECENT CHECK-INS (last 30) ===\n`;
  for (const c of checkIns.slice(0, 30)) {
    report += `\n${c.date} | Mood: ${c.mood}/10 | Craving: ${c.craving}/10 | HALT: ${
      c.halt.hungry ? 'H' : ''
    }${c.halt.angry ? 'A' : ''}${c.halt.lonely ? 'L' : ''}${c.halt.tired ? 'T' : ''}`;
  }

  report += `\n\n=== RECENT TRIGGERS (last 50) ===\n`;
  for (const t of triggers.slice(0, 50)) {
    report += `\n${new Date(t.timestamp).toLocaleString()} | ${t.categoryId} | Intensity: ${
      t.intensity
    }/10 | Used: ${t.didUse ? 'Yes' : 'No'}`;
    if (t.note) report += ` | "${t.note}"`;
  }

  return report;
}

export async function __resetStorageForTests(): Promise<void> {
  await deleteRaw(KEYS.sobrietyDate);
  await deleteRaw(KEYS.stepsProgress);
  const ids = await readJson<string[]>(KEYS.journalIndex, []);
  await deleteRaw(KEYS.journalIndex);
  await Promise.all(ids.map((id) => deleteRaw(KEYS.journalEntry(id))));
  await deleteRaw(KEYS.contacts);
}

export function newId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}