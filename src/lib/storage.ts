import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppData, emptyAppData } from '../types';

const STORAGE_KEY = 'recovery_companion_v1';

export async function loadAppData(): Promise<AppData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...emptyAppData };
    const parsed = JSON.parse(raw) as Partial<AppData>;
    // Merge defensively so older saves missing keys still load.
    return {
      ...emptyAppData,
      ...parsed,
      journal: parsed.journal ?? [],
      stepWork: parsed.stepWork ?? {},
    };
  } catch {
    return { ...emptyAppData };
  }
}

export async function saveAppData(data: AppData): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Best-effort; persistence failures should not crash the UI.
  }
}
