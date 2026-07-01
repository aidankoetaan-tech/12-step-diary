// Program content: step text (adapted, non-affiliated wording) and
// daily reflections. This app is not affiliated with or endorsed by
// Alcoholics Anonymous World Services.

export interface StepDefinition {
  number: number;
  title: string;
  text: string;
  aiPrompts?: string[];
}

export const TWELVE_STEPS: StepDefinition[] = [
  {
    number: 1,
    title: 'Honesty',
    text: 'We admitted we were powerless over our addiction — that our lives had become unmanageable.',
    aiPrompts: [
      'What brought you to this moment? Write freely, without editing yourself.',
      'When did you first realize things were out of your control?',
      'What does ‘unmanageable’ look like in your life right now?',
      'If you could describe your relationship with your addiction in one honest sentence, what would it be?',
    ],
  },
  {
    number: 2,
    title: 'Hope',
    text: 'Came to believe that a Power greater than ourselves could restore us to sanity.',
    aiPrompts: [
      'Can you remember a moment when you felt hope — even briefly — that things could change?',
      'What does ‘restored to sanity’ mean to you personally?',
      'You don’t have to define what this Power is. Just describe what it might feel like to trust something beyond yourself.',
      'What would ‘sanity’ look like in your daily life?',
    ],
  },
  {
    number: 3,
    title: 'Surrender',
    text: 'Made a decision to turn our will and our lives over to the care of a Higher Power, as we understood it.',
    aiPrompts: [
      'What would ‘letting go’ actually look like in your life today?',
      'Write about a time you tried to control everything. How did that work out?',
      'If you could hand over one thing you’ve been carrying, what would it be?',
      'What scares you most about surrendering control?',
    ],
  },
  {
    number: 4,
    title: 'Courage',
    text: 'Made a searching and fearless moral inventory of ourselves.',
    aiPrompts: [
      'Who comes to mind first when you think about resentment? Write about that relationship honestly.',
      'What pattern in your behavior shows up across different relationships?',
      'List the fears that drive your decisions. No judgment — just name them.',
      'What are you afraid someone will find out about you?',
    ],
  },
  {
    number: 5,
    title: 'Integrity',
    text: 'Admitted to ourselves and to another human being the exact nature of our wrongs.',
    aiPrompts: [
      'Read what you wrote in Step 4 aloud here. I’m listening. Take your time.',
      'What part of your inventory was hardest to write? Why do you think that is?',
      'Who would you trust enough to share this with? What makes them safe?',
      'What’s the one thing you’re still holding back? You don’t have to say it — just notice it.',
    ],
  },
  {
    number: 6,
    title: 'Willingness',
    text: 'Were entirely ready to have these defects of character removed.',
    aiPrompts: [
      'Which of the patterns you identified in Step 4 would you most want to change?',
      'What’s the difference between being ‘ready’ and being ‘willing’ to change?',
      'Imagine your life without this defect. Be specific — what’s different?',
      'What are you afraid you’d lose if this part of you changed?',
    ],
  },
  {
    number: 7,
    title: 'Humility',
    text: 'Humbly asked for our shortcomings to be removed.',
    aiPrompts: [
      'Write your own prayer or intention. It doesn’t have to be religious — just honest.',
      'What does humility mean to you, in practical terms?',
      'If these shortcomings were removed tomorrow, what would you do differently?',
      'What are you holding onto that you know you need to let go of?',
    ],
  },
  {
    number: 8,
    title: 'Love',
    text: 'Made a list of all persons we had harmed, and became willing to make amends to them all.',
    aiPrompts: [
      'Start the list. Just names. You can add details later.',
      'Who surprised you by appearing on this list? Who didn’t?',
      'For each name: what happened, and what was your part in it?',
      'Is there someone you’re not ready to include yet? That’s okay — just notice.',
    ],
  },
  {
    number: 9,
    title: 'Responsibility',
    text: 'Made direct amends to such people wherever possible, except when to do so would injure them or others.',
    aiPrompts: [
      'Write an amends letter. You don’t have to send it. Just write it.',
      'For the person who’s hardest to approach — what would you say if there were no consequences?',
      'What does ‘except when to do so would injure them’ mean in your situation?',
      'How would making this amends change your relationship with yourself?',
    ],
  },
  {
    number: 10,
    title: 'Discipline',
    text: 'Continued to take personal inventory and when we were wrong promptly admitted it.',
    aiPrompts: [
      'What did you notice today that you’d normally miss or ignore?',
      'Was there a moment today when you were wrong about something? What happened next?',
      'How did you handle a difficult emotion today? Would you do it differently?',
      'What’s one thing you did today that aligns with the person you want to be?',
    ],
  },
  {
    number: 11,
    title: 'Awareness',
    text: 'Sought through prayer and meditation to improve our conscious contact with our Higher Power, seeking knowledge of its will for us and the power to carry that out.',
    aiPrompts: [
      'Describe what ‘conscious contact’ feels like to you — or what you imagine it could feel like.',
      'What practice — prayer, meditation, nature, music — brings you closest to stillness?',
      'Write about a moment you felt connected to something larger than yourself.',
      'What would a daily spiritual practice look like in your actual life, not an idealized version?',
    ],
  },
  {
    number: 12,
    title: 'Service',
    text: 'Having had a spiritual awakening as the result of these steps, we tried to carry this message to others, and to practice these principles in all our affairs.',
    aiPrompts: [
      'Who could benefit from what you’ve learned this week? How would you reach them?',
      'What does ‘practice these principles in all our affairs’ look like at work? At home? With friends?',
      'Describe your spiritual awakening — even if it was quiet, even if you’re still waiting for it.',
      'If you were to carry this message to someone struggling right now, what would you say?',
    ],
  },
];

export const REFLECTIONS: string[] = [
  // Original reflections
  'One day at a time. Today is the only day you need to get through.',
  'Progress, not perfection.',
  'You can’t change the past, but you can start today and change the ending.',
  'Recovery is not a race. You don’t have to feel guilty for taking your time.',
  'Courage isn’t the absence of fear — it’s reaching out anyway.',
  'The opposite of addiction is connection.',
  'Every day clean is a victory worth celebrating.',
  'You are not your mistakes. You are what you choose next.',
  'Gratitude turns what we have into enough.',
  'Fall seven times, stand up eight.',
  'Healing happens in small, quiet moments, repeated daily.',
  'Asking for help is a sign of strength, not weakness.',
  'Serenity comes from accepting what you cannot change.',
  'Your story isn’t over. This chapter is called recovery.',
  // Sourced recovery quotes (from relapse-prevention-diary)
  'You don’t have to see the whole staircase, just take the first step. — Martin Luther King Jr.',
  'Rock bottom became the solid foundation on which I rebuilt my life. — J.K. Rowling',
  'It does not matter how slowly you go as long as you do not stop. — Confucius',
  'Courage is not the absence of fear but the triumph over it. — Nelson Mandela',
  'The only way out is through. — Robert Frost',
  'You are not your addiction. You are not your relapse. You are a person fighting a disease.',
  'What lies behind us and what lies before us are tiny matters compared to what lies within us. — Ralph Waldo Emerson',
  'I am not what happened to me. I am what I choose to become. — Carl Jung',
  'The best time to plant a tree was 20 years ago. The second best time is now. — Chinese proverb',
  'Rarely have we seen a person fail who has thoroughly followed our path. — Alcoholics Anonymous, Chapter 5',
  'Selfishness — self-centeredness! That, we think, is the root of our troubles. — Alcoholics Anonymous, p. 62',
  'Resentment is the ‘number one’ offender. It destroys more alcoholics than anything else. — Alcoholics Anonymous, p. 64',
];

// Recovery milestones ("chips" / medallions). The day thresholds mirror
// MILESTONES in src/date.ts; this list adds the display metadata used by
// the milestone strip on the Home screen.
export interface MilestoneMeta {
  days: number;
  label: string;
  short: string;
}

export const MILESTONES_META: MilestoneMeta[] = [
  { days: 1, label: '24 hours', short: '1d' },
  { days: 7, label: '1 week', short: '1w' },
  { days: 30, label: '30 days', short: '30d' },
  { days: 60, label: '60 days', short: '60d' },
  { days: 90, label: '90 days', short: '90d' },
  { days: 180, label: '6 months', short: '6mo' },
  { days: 365, label: '1 year', short: '1yr' },
  { days: 730, label: '2 years', short: '2yr' },
  { days: 1095, label: '3 years', short: '3yr' },
];

export function earnedMilestoneCount(days: number | null): number {
  if (days === null) return 0;
  return MILESTONES_META.filter((m) => days >= m.days).length;
}

// Label for an arbitrary milestone-day count, including the yearly
// thresholds beyond the fixed list (e.g. 1460 -> "4 years").
export function milestoneLabel(targetDays: number): string {
  const known = MILESTONES_META.find((m) => m.days === targetDays);
  if (known) return known.label;
  const years = Math.round(targetDays / 365);
  return `${years} year${years === 1 ? '' : 's'}`;
}

export const JOURNAL_PROMPTS: string[] = [
  'What am I grateful for today?',
  'What was hard today, and how did I handle it?',
  'Who did I connect with today?',
  'What do I need to let go of?',
  'What is one thing I did well today?',
  'How am I feeling right now, honestly?',
];

export function reflectionForToday(date: Date = new Date()): string {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86400000);
  return REFLECTIONS[dayOfYear % REFLECTIONS.length];
}

export function getRandomStepPrompt(stepNumber: number): string {
  const step = TWELVE_STEPS.find((s) => s.number === stepNumber);
  if (!step || !step.aiPrompts || step.aiPrompts.length === 0) {
    return 'What’s on your mind today?';
  }
  return step.aiPrompts[Math.floor(Math.random() * step.aiPrompts.length)];
}