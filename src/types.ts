export type RootTabParamList = {
  Home: undefined;
  Steps: undefined;
  Journal: undefined;
  Sponsor: undefined;
};

export type StepStatus = 'none' | 'working' | 'done';

export type StepsProgress = Record<number, StepStatus>;

export interface JournalEntry {
  id: string;
  createdAt: string; // ISO timestamp
  mood: string; // emoji
  text: string;
  prompt?: string;
}

export interface SupportContact {
  id: string;
  name: string;
  phone: string;
  relation: string; // e.g. "Sponsor", "Friend"
}
