// Program content: step text (adapted, non-affiliated wording) and
// daily reflections. This app is not affiliated with or endorsed by
// Alcoholics Anonymous World Services.

export interface StepDefinition {
  number: number;
  title: string;
  text: string;
}

export const TWELVE_STEPS: StepDefinition[] = [
  {
    number: 1,
    title: 'Honesty',
    text: 'We admitted we were powerless over our addiction — that our lives had become unmanageable.',
  },
  {
    number: 2,
    title: 'Hope',
    text: 'Came to believe that a Power greater than ourselves could restore us to sanity.',
  },
  {
    number: 3,
    title: 'Surrender',
    text: 'Made a decision to turn our will and our lives over to the care of a Higher Power, as we understood it.',
  },
  {
    number: 4,
    title: 'Courage',
    text: 'Made a searching and fearless moral inventory of ourselves.',
  },
  {
    number: 5,
    title: 'Integrity',
    text: 'Admitted to ourselves and to another human being the exact nature of our wrongs.',
  },
  {
    number: 6,
    title: 'Willingness',
    text: 'Were entirely ready to have these defects of character removed.',
  },
  {
    number: 7,
    title: 'Humility',
    text: 'Humbly asked for our shortcomings to be removed.',
  },
  {
    number: 8,
    title: 'Love',
    text: 'Made a list of all persons we had harmed, and became willing to make amends to them all.',
  },
  {
    number: 9,
    title: 'Responsibility',
    text: 'Made direct amends to such people wherever possible, except when to do so would injure them or others.',
  },
  {
    number: 10,
    title: 'Discipline',
    text: 'Continued to take personal inventory and when we were wrong promptly admitted it.',
  },
  {
    number: 11,
    title: 'Awareness',
    text: 'Sought through prayer and meditation to improve our conscious contact with our Higher Power, seeking knowledge of its will for us and the power to carry that out.',
  },
  {
    number: 12,
    title: 'Service',
    text: 'Having had a spiritual awakening as the result of these steps, we tried to carry this message to others, and to practice these principles in all our affairs.',
  },
];

export const REFLECTIONS: string[] = [
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
];

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
