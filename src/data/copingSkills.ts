export interface CopingSkill {
  id: string;
  title: string;
  category: 'distraction' | 'relaxation' | 'cognitive' | 'physical' | 'social' | 'spiritual';
  duration: string; // e.g. '5 min', '15 min'
  description: string;
  steps: string[];
}

export const COPING_SKILLS: CopingSkill[] = [
  // Distraction
  { id: 'urge_surf', title: 'Urge Surfing', category: 'distraction', duration: '10-20 min',
    description: 'Ride the wave of craving without acting on it. Urges typically peak and fade within 20 minutes.',
    steps: ['Find a quiet place and sit comfortably', 'Close your eyes and focus on your breath', 'Notice where you feel the urge in your body', 'Observe it like a wave — rising, peaking, falling', 'Keep breathing. You are not your craving.'] },
  { id: '5_senses', title: '5-4-3-2-1 Grounding', category: 'distraction', duration: '5 min',
    description: 'Ground yourself in the present moment using all five senses.',
    steps: ['Name 5 things you can SEE', 'Name 4 things you can FEEL', 'Name 3 things you can HEAR', 'Name 2 things you can SMELL', 'Name 1 thing you can TASTE'] },
  { id: 'cold_water', title: 'Cold Water Reset', category: 'distraction', duration: '2 min',
    description: 'Splash cold water on your face or hold ice cubes. Activates the dive reflex — instantly lowers heart rate.',
    steps: ['Go to a sink', 'Splash cold water on your face for 30 seconds', 'Or hold an ice cube in each hand', 'Focus on the sensation. Breathe slowly.'] },

  // Relaxation
  { id: 'box_breathing', title: 'Box Breathing', category: 'relaxation', duration: '4 min',
    description: 'Navy SEAL technique — 4 seconds in, hold, out, hold. Calms the nervous system.',
    steps: ['Inhale through nose: 4 seconds', 'Hold: 4 seconds', 'Exhale through mouth: 4 seconds', 'Hold: 4 seconds', 'Repeat 4-5 cycles'] },
  { id: 'progressive_relax', title: 'Progressive Relaxation', category: 'relaxation', duration: '10 min',
    description: 'Tense and release each muscle group. Releases physical tension from cravings.',
    steps: ['Start with your feet — tense for 5 sec, release', 'Move up: calves, thighs, stomach, chest', 'Hands, arms, shoulders, neck, face', 'Notice the difference between tension and relaxation'] },

  // Cognitive
  { id: 'play_tape', title: 'Play the Tape Through', category: 'cognitive', duration: '5 min',
    description: 'Visualize what happens AFTER you use — not just the relief, but the consequences.',
    steps: ['Picture using right now. What happens next?', 'And then? Where are you in an hour?', 'Tonight? Tomorrow morning?', 'Who gets hurt? What do you lose?', 'Now picture NOT using. What does tomorrow look like sober?'] },
  { id: 'reframe', title: 'Cognitive Reframe', category: 'cognitive', duration: '5 min',
    description: 'Challenge the thoughts driving the craving. "I need this" → "I want this, but I don\'t need it."',
    steps: ['Identify the thought: "I need a drink/use"', 'Challenge: Is this true? Will I die without it?', 'Reframe: "This is a craving. It will pass. I am safe."', 'Repeat the reframe out loud if needed'] },
  { id: 'pros_cons', title: 'Pros & Cons', category: 'cognitive', duration: '5 min',
    description: 'Write out the short-term and long-term consequences of using vs. not using.',
    steps: ['Pros of using (short-term relief, escape...)', 'Cons of using (shame, health, relationships, money...)', 'Pros of staying sober (pride, health, freedom...)', 'Cons of staying sober (sitting with discomfort — temporary)'] },

  // Physical
  { id: 'exercise', title: 'Move Your Body', category: 'physical', duration: '15-30 min',
    description: 'Exercise releases endorphins — natural mood lifters. Breaks the craving cycle.',
    steps: ['Do something physical RIGHT NOW', 'Push-ups, jumping jacks, a walk, run, stretch', 'Keep going until you feel the craving shift', 'Notice how your body feels after'] },
  { id: 'deep_stretch', title: 'Deep Stretching', category: 'physical', duration: '5 min',
    description: 'Simple stretches while breathing deeply. Releases physical tension.',
    steps: ['Stand up. Reach for the ceiling — hold 10 sec.', 'Touch your toes — hold 10 sec.', 'Roll your shoulders back 5 times', 'Stretch your neck gently side to side'] },

  // Social
  { id: 'call_someone', title: 'Call Someone', category: 'social', duration: 'varies',
    description: 'Connection is the opposite of addiction. Reach out NOW.',
    steps: ['Call your sponsor or a trusted friend', 'Tell them: "I\'m having a craving"', "You don't need advice — just say it out loud", 'If no one answers, call another person. Keep calling.'] },
  { id: 'meeting', title: 'Go to a Meeting', category: 'social', duration: '1 hour',
    description: 'In-person or online. Being in a room with people who understand.',
    steps: ['Find the nearest meeting (in-person or Zoom)', 'Go. Sit. Listen.', 'Share if you feel ready', 'Stay after and talk to someone'] },

  // Spiritual
  { id: 'serenity', title: 'Serenity Prayer', category: 'spiritual', duration: '1 min',
    description: 'The most powerful 30 words in recovery.',
    steps: ['"God, grant me the serenity"', '"To accept the things I cannot change"', '"Courage to change the things I can"', '"And wisdom to know the difference"'] },
  { id: 'gratitude', title: 'Gratitude List', category: 'spiritual', duration: '5 min',
    description: 'Write down 5 things you\'re grateful for. Shifts focus from what you\'re missing to what you have.',
    steps: ['Open your notes or grab paper', 'Write "I am grateful for..."', 'List 5 specific things — no repeats from yesterday', 'Read them out loud'] },
];