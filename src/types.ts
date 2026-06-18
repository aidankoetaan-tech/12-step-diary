// Navigation
export type RootTabParamList = {
  Home: undefined;
  Steps: undefined;
  Journal: undefined;
  Sponsor: undefined;
};

// A single free-form journal entry (free tier).
export interface JournalEntry {
  id: string;
  createdAt: string; // ISO timestamp
  text: string;
  mood?: number; // optional 1-5 self-rating
}

// Saved work against one of the 12 steps (premium tier).
export interface StepWorkEntry {
  step: number; // 1-12
  // Answers keyed by prompt index for that step.
  answers: Record<number, string>;
  updatedAt: string; // ISO timestamp
}

// The full persisted app state.
export interface AppData {
  // ISO date (YYYY-MM-DD) the user marked as their sobriety / clean date.
  sobrietyDate: string | null;
  journal: JournalEntry[];
  stepWork: Record<number, StepWorkEntry>;
}

export const emptyAppData: AppData = {
  sobrietyDate: null,
  journal: [],
  stepWork: {},
};
