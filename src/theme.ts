// Deep, calm dark palette shared by every screen.
// Keep in sync with RecoveryTheme in App.tsx.
export const colors = {
  background: '#0D0D2B',
  card: '#16163A',
  cardPressed: '#1C1C45',
  border: '#1E1E3A',
  text: '#EAEAFF',
  textDim: '#8E8EB8',
  textFaint: '#4A4A6A',
  primary: '#7C6FF7',
  primarySoft: '#2A2458',
  success: '#5DD9A7',
  successSoft: '#15392E',
  warning: '#F7C86F',
  warningSoft: '#3A3220',
  danger: '#F76F8E',
  // Warm gold accent for milestones / recovery chips — the medallion
  // colour of 12-step culture, a deliberate contrast to the cool indigo.
  accent: '#F4C56B',
  accentSoft: '#2E2615',
  accentDim: '#6B5A33',
  onAccent: '#2A1E00',
};

// Multi-stop gradients (expo-linear-gradient). Tuples so the colours prop
// type-checks (it requires at least two stops).
export const gradients = {
  hero: ['#322A73', '#191540'],
  primary: ['#8B7CFF', '#6C5CE7'],
  gold: ['#F7D488', '#E5A93F'],
  progress: ['#7C6FF7', '#5DD9A7'],
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
};
