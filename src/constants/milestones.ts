// Sobriety milestones celebrated on the Home screen (free tier).

export interface Milestone {
  days: number;
  label: string;
}

export const MILESTONES: Milestone[] = [
  { days: 1, label: '24 Hours' },
  { days: 7, label: '1 Week' },
  { days: 14, label: '2 Weeks' },
  { days: 30, label: '1 Month' },
  { days: 60, label: '2 Months' },
  { days: 90, label: '90 Days' },
  { days: 180, label: '6 Months' },
  { days: 270, label: '9 Months' },
  { days: 365, label: '1 Year' },
  { days: 547, label: '18 Months' },
  { days: 730, label: '2 Years' },
  { days: 1095, label: '3 Years' },
  { days: 1825, label: '5 Years' },
  { days: 3650, label: '10 Years' },
];

// The most recent milestone reached, and the next one to aim for.
export function milestoneProgress(daysSober: number): {
  reached: Milestone | null;
  next: Milestone | null;
} {
  let reached: Milestone | null = null;
  let next: Milestone | null = null;
  for (const m of MILESTONES) {
    if (daysSober >= m.days) {
      reached = m;
    } else {
      next = m;
      break;
    }
  }
  return { reached, next };
}
