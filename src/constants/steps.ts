// The Twelve Steps with reflection prompts for guided stepwork.
// Wording is the widely-used common framing; the prompts are original
// journaling questions written for this app.

export interface Step {
  number: number;
  title: string;
  text: string;
  prompts: string[];
}

export const STEPS: Step[] = [
  {
    number: 1,
    title: 'Honesty',
    text: 'We admitted we were powerless over our addiction — that our lives had become unmanageable.',
    prompts: [
      'Where in my life have I tried to control my using and failed?',
      'What has become unmanageable that I have been unwilling to admit?',
      'What does powerlessness mean to me today?',
    ],
  },
  {
    number: 2,
    title: 'Hope',
    text: 'Came to believe that a Power greater than ourselves could restore us to sanity.',
    prompts: [
      'What does "a power greater than myself" look like for me?',
      'Where have I already seen sanity returning, even a little?',
      'What makes it hard for me to believe things can get better?',
    ],
  },
  {
    number: 3,
    title: 'Faith',
    text: 'Made a decision to turn our will and our lives over to the care of God as we understood Him.',
    prompts: [
      'What am I still trying to run on self-will alone?',
      'What would "letting go" actually look like this week?',
      'What am I afraid will happen if I stop controlling?',
    ],
  },
  {
    number: 4,
    title: 'Courage',
    text: 'Made a searching and fearless moral inventory of ourselves.',
    prompts: [
      'Who or what am I resentful toward, and why?',
      'What fears drive my behavior?',
      'Where have I harmed others or myself?',
    ],
  },
  {
    number: 5,
    title: 'Integrity',
    text: 'Admitted to God, to ourselves, and to another human being the exact nature of our wrongs.',
    prompts: [
      'What have I been most afraid to say out loud?',
      'Who is the trusted person I can share my inventory with?',
      'What patterns show up across my wrongs?',
    ],
  },
  {
    number: 6,
    title: 'Willingness',
    text: 'Were entirely ready to have God remove all these defects of character.',
    prompts: [
      'Which character defect still feels useful to me?',
      'What am I not yet willing to let go of?',
      'What would my life feel like without this defect?',
    ],
  },
  {
    number: 7,
    title: 'Humility',
    text: 'Humbly asked Him to remove our shortcomings.',
    prompts: [
      'What does humility mean to me, separate from shame?',
      'Where do I still try to look better than I am?',
      'What shortcoming am I ready to ask help with today?',
    ],
  },
  {
    number: 8,
    title: 'Brotherly Love',
    text: 'Made a list of all persons we had harmed, and became willing to make amends to them all.',
    prompts: [
      'Who is on my amends list, and what did I do?',
      'Whom am I least willing to make amends to, and why?',
      'Am I including myself on this list?',
    ],
  },
  {
    number: 9,
    title: 'Justice',
    text: 'Made direct amends to such people wherever possible, except when to do so would injure them or others.',
    prompts: [
      'What amends can I make directly and safely?',
      'Where would making amends cause more harm than good?',
      'What living amends (changed behavior) can I begin now?',
    ],
  },
  {
    number: 10,
    title: 'Perseverance',
    text: 'Continued to take personal inventory and when we were wrong promptly admitted it.',
    prompts: [
      'What did I do well today, and where did I fall short?',
      'Is there anyone I owe a prompt admission to?',
      'What is my intention for tomorrow?',
    ],
  },
  {
    number: 11,
    title: 'Spiritual Awareness',
    text: 'Sought through prayer and meditation to improve our conscious contact with God as we understood Him.',
    prompts: [
      'How did I make time for quiet or reflection today?',
      'What am I asking for guidance on?',
      'When did I feel most connected to something larger than myself?',
    ],
  },
  {
    number: 12,
    title: 'Service',
    text: 'Having had a spiritual awakening as the result of these steps, we tried to carry this message to others and to practice these principles in all our affairs.',
    prompts: [
      'Anything I did, however small, that counted as service today?',
      'Who did I notice struggling that I might reach out to?',
      'Where did I practice these principles outside of recovery?',
    ],
  },
];
