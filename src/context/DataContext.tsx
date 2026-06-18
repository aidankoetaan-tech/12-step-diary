import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppData, emptyAppData, JournalEntry, StepWorkEntry } from '../types';
import { loadAppData, saveAppData } from '../lib/storage';
import { todayISO } from '../lib/date';

interface DataContextValue {
  data: AppData;
  ready: boolean;
  setSobrietyDate: (iso: string | null) => void;
  addJournalEntry: (text: string, mood?: number) => void;
  deleteJournalEntry: (id: string) => void;
  saveStepWork: (step: number, answers: Record<number, string>) => void;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(emptyAppData);
  const [ready, setReady] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    loadAppData().then((loaded) => {
      setData(loaded);
      hydrated.current = true;
      setReady(true);
    });
  }, []);

  // Persist on every change once initial hydration is done.
  useEffect(() => {
    if (hydrated.current) {
      saveAppData(data);
    }
  }, [data]);

  const setSobrietyDate = useCallback((iso: string | null) => {
    setData((d) => ({ ...d, sobrietyDate: iso }));
  }, []);

  const addJournalEntry = useCallback((text: string, mood?: number) => {
    const entry: JournalEntry = {
      id: genId(),
      createdAt: new Date().toISOString(),
      text: text.trim(),
      mood,
    };
    setData((d) => ({ ...d, journal: [entry, ...d.journal] }));
  }, []);

  const deleteJournalEntry = useCallback((id: string) => {
    setData((d) => ({ ...d, journal: d.journal.filter((e) => e.id !== id) }));
  }, []);

  const saveStepWork = useCallback(
    (step: number, answers: Record<number, string>) => {
      const entry: StepWorkEntry = { step, answers, updatedAt: new Date().toISOString() };
      setData((d) => ({ ...d, stepWork: { ...d.stepWork, [step]: entry } }));
    },
    [],
  );

  const value = useMemo(
    () => ({
      data,
      ready,
      setSobrietyDate,
      addJournalEntry,
      deleteJournalEntry,
      saveStepWork,
    }),
    [data, ready, setSobrietyDate, addJournalEntry, deleteJournalEntry, saveStepWork],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within a DataProvider');
  return ctx;
}

// Re-export for convenience in screens.
export { todayISO };
