// Relapse Predictors distilled from Alcoholics Anonymous (Big Book)
// Chapters 3, 5, 6, and 11

export interface BigBookSign {
  id: string;
  label: string;
  category: 'spiritual_malady' | 'self_will' | 'dishonesty' | 'isolation' | 'complacency';
  quote: string;
  description: string;
  pageRef: string;
}

export const BIG_BOOK_SIGNS: BigBookSign[] = [
  // Spiritual Malady (the deepest layer — when active, relapse is inevitable without correction)
  {
    id: 'restless',
    label: 'Restless, Irritable, Discontented',
    category: 'spiritual_malady',
    quote: '"restless, irritable and discontented"',
    description: 'The classic pre-relapse emotional state. When you feel uneasy in your own skin, agitated for no reason, and nothing satisfies — the spiritual malady is active.',
    pageRef: 'p. xxvi',
  },
  {
    id: 'fear',
    label: 'Full of Fear',
    category: 'spiritual_malady',
    quote: '"full of fear"',
    description: 'When fear dominates your thinking — fear of the future, fear of people, fear of failure. Fear is the opposite of faith and blocks the sunlight of the Spirit.',
    pageRef: 'p. 52',
  },
  {
    id: 'misery',
    label: 'Prey to Misery & Depression',
    category: 'spiritual_malady',
    quote: '"prey to misery and depression"',
    description: 'A persistent low mood that nothing seems to lift. When you can\'t shake the darkness, the spiritual malady has taken hold.',
    pageRef: 'p. 52',
  },
  {
    id: 'uselessness',
    label: 'Feelings of Uselessness',
    category: 'spiritual_malady',
    quote: '"a feeling of uselessness"',
    description: 'When you feel you have nothing to offer, no purpose. This is the opposite of Step 12 — the antidote is being of service to another alcoholic.',
    pageRef: 'p. 52',
  },
  {
    id: 'unhappiness',
    label: 'Chronic Unhappiness',
    category: 'spiritual_malady',
    quote: '"unhappiness"',
    description: 'A baseline of dissatisfaction with life. Not acute depression, but a persistent gray fog where nothing brings joy.',
    pageRef: 'p. 52',
  },

  // Self-Will (the root — selfishness/self-centeredness)
  {
    id: 'selfishness',
    label: 'Selfishness & Self-Centeredness',
    category: 'self_will',
    quote: '"Selfishness — self-centeredness! That, we think, is the root of our troubles."',
    description: 'The Big Book identifies this as THE root cause. When everything revolves around you — your needs, your feelings, your way — you are in danger.',
    pageRef: 'p. 62',
  },
  {
    id: 'playing_god',
    label: 'Playing God',
    category: 'self_will',
    quote: '"First of all, we had to quit playing God. It didn\'t work."',
    description: 'Trying to control outcomes, people, and situations. The actor who wants to run the whole show. When you catch yourself directing everyone else\'s life, you\'ve taken back the reins.',
    pageRef: 'p. 62',
  },
  {
    id: 'self_delusion',
    label: 'Self-Delusion & Self-Pity',
    category: 'self_will',
    quote: '"Driven by a hundred forms of fear, self-delusion, self-seeking, and self-pity"',
    description: 'Believing your own lies about why you deserve to drink/use. The "poor me" narrative. "I\'ve earned this." "No one understands."',
    pageRef: 'p. 62',
  },

  // Dishonesty (the barrier to recovery)
  {
    id: 'dishonesty',
    label: 'Incapacity for Honesty',
    category: 'dishonesty',
    quote: '"Those who do not recover are people who cannot or will not completely give themselves to this simple program, usually men and women who are constitutionally incapable of being honest with themselves."',
    description: 'The #1 predictor of failure in the Big Book. Self-deception, minimizing, rationalizing, omitting the truth in your inventory. If you catch yourself lying to yourself, the program has stopped working.',
    pageRef: 'p. 58',
  },
  {
    id: 'double_life',
    label: 'Leading a Double Life',
    category: 'dishonesty',
    quote: '"leading a double life"',
    description: 'Presenting one version of yourself to AA/your sponsor and another version to the world. Living a secret life — even small secrets create cracks that widen into relapse.',
    pageRef: 'p. 73',
  },
  {
    id: 'half_measures',
    label: 'Half Measures',
    category: 'dishonesty',
    quote: '"Half measures availed us nothing."',
    description: 'Doing the minimum. Going to meetings but not working steps. Praying but not making amends. "I\'ll do Step 4... eventually." Half measures = half recovery = no recovery.',
    pageRef: 'p. 59',
  },

  // Isolation (cutting off the lifeline)
  {
    id: 'isolation',
    label: 'Isolating from the Fellowship',
    category: 'isolation',
    quote: '"inability to be of real help to other people"',
    description: 'Stopping meetings, not calling your sponsor, avoiding fellow alcoholics. The opposite of addiction is connection. Isolation is the disease reasserting itself.',
    pageRef: 'p. 52',
  },
  {
    id: 'relationships',
    label: 'Trouble with Personal Relationships',
    category: 'isolation',
    quote: '"having trouble with personal relationships"',
    description: 'Constant conflict with others. If everyone around you seems to be the problem, you may be the common denominator. Unresolved conflict breeds resentment.',
    pageRef: 'p. 52',
  },
  {
    id: 'no_service',
    label: 'Not Working with Others',
    category: 'isolation',
    quote: '"For if an alcoholic failed to perfect and enlarge his spiritual life through work and self-sacrifice for others, he could not survive the certain trials and low spots ahead."',
    description: 'The surest predictor of relapse in the Big Book. When you stop carrying the message, you stop staying sober. Service is not optional — it is the maintenance dose.',
    pageRef: 'p. 14-15',
  },

  // Complacency (the silent killer)
  {
    id: 'resentment',
    label: 'Resentment',
    category: 'complacency',
    quote: '"Resentment is the \'number one\' offender. It destroys more alcoholics than anything else."',
    description: 'THE most dangerous emotion in AA. Holding onto anger at a person, institution, or principle. Resentment shuts off the sunlight of the Spirit. Left unprocessed, it WILL lead to drinking.',
    pageRef: 'p. 64',
  },
  {
    id: 'emotional',
    label: 'Inability to Control Emotions',
    category: 'complacency',
    quote: '"inability to control our emotional natures"',
    description: 'When your emotions run the show — anger outbursts, emotional volatility, swinging between extremes. The 12 Steps provide emotional regulation; without them, you\'re defenseless.',
    pageRef: 'p. 52',
  },
  {
    id: 'no_inventory',
    label: 'Stopped Taking Inventory',
    category: 'complacency',
    quote: '"Continued to take personal inventory and when we were wrong promptly admitted it."',
    description: 'Skipping Step 10. Not reviewing your day. Letting wrongs pile up unadmitted. When you stop looking at yourself honestly every day, the defects creep back in.',
    pageRef: 'p. 84',
  },
  {
    id: 'no_connection',
    label: 'No Conscious Contact',
    category: 'complacency',
    quote: '"Sought through prayer and meditation to improve our conscious contact with God"',
    description: 'Skipping Step 11. No prayer, no meditation, no quiet time. When you stop seeking spiritual connection, the spiritual malady returns — and the physical follows.',
    pageRef: 'p. 85',
  },
];

// The antidote for each category
export const BIG_BOOK_ANTIDOTES: Record<string, string> = {
  spiritual_malady: 'Work Steps 10, 11, 12 immediately. Call your sponsor. Pray. Help another alcoholic TODAY.',
  self_will: 'Step 3: Turn it over. Say the Third Step Prayer. "Relieve me of the bondage of self."',
  dishonesty: 'Step 4 & 5: Inventory and confession. Tell someone the exact truth TODAY.',
  isolation: 'Go to a meeting. Call someone. Be of service. Connection is the opposite of addiction.',
  complacency: 'Steps 10 & 11: Resume daily inventory and meditation. Review where you stopped working.',
};

// Weekly Big Book self-check questions
export const BIG_BOOK_SELF_CHECK = [
  'Have I been restless, irritable, or discontented this week?',
  'Am I harboring any resentment right now?',
  'Have I been honest with myself and others?',
  'Have I skipped any meetings or avoided calling my sponsor?',
  'Am I working with another alcoholic / addict?',
  'Have I done my daily inventory (Step 10) this week?',
  'Have I prayed or meditated (Step 11) today?',
  'Is there something I am not facing or making right?',
];