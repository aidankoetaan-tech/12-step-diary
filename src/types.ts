export type RootTabParamList = {
  Home: undefined;
  Steps: undefined;
  Tools: undefined;
  Journal: undefined;
  Support: undefined;
};

export type ToolsStackParamList = {
  ToolsMenu: undefined;
  Coping: undefined;
  Triggers: undefined;
  Plan: undefined;
  Meditation: undefined;
  Emergency: undefined;
};

export type StepStatus = 'none' | 'working' | 'done';

export type StepsProgress = Record<number, StepStatus>;

export interface JournalEntry {
  id: string;
  createdAt: string; // ISO timestamp
  mood: string; // emoji
  text: string;
  prompt?: string;
  stepNumber?: number;
  aiReflection?: string;
}

export interface SupportContact {
  id: string;
  name: string;
  phone: string;
  relation: string; // e.g. "Sponsor", "Friend"
}

export interface HaltCheck {
  hungry: boolean;
  angry: boolean;
  lonely: boolean;
  tired: boolean;
}

export interface DailyCheckIn {
  date: string; // YYYY-MM-DD
  mood: number; // 0-10
  craving: number; // 0-10
  halt: HaltCheck;
  notes: string;
  triggersLogged: number;
  skillsUsed: number;
}

export interface TriggerLog {
  id: string;
  categoryId: string;
  intensity: number; // 1-10
  note: string;
  timestamp: string; // ISO
  didUse: boolean;
}

export type PreventionPlan = Record<string, string>;

export interface AppSettings {
  darkMode: boolean;
  notificationsEnabled: boolean;
  checkInReminderTime: string; // 'HH:MM'
}