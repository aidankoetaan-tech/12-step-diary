// Marlatt's Relapse Prevention Model — High-Risk Situation Taxonomy
export interface TriggerCategory {
  id: string;
  label: string;
  icon: string;
  description: string;
}

export const TRIGGER_CATEGORIES: TriggerCategory[] = [
  { id: 'negative_emotional', label: 'Negative Emotions', icon: 'sad-outline', description: 'Anger, frustration, sadness, anxiety, boredom' },
  { id: 'interpersonal_conflict', label: 'Conflict', icon: 'people-outline', description: 'Arguments, tension with family/friends/coworkers' },
  { id: 'social_pressure', label: 'Social Pressure', icon: 'wine-outline', description: 'Others using around you, being offered substances' },
  { id: 'positive_emotional', label: 'Positive Emotions', icon: 'happy-outline', description: 'Celebrating, excitement — wanting to enhance the feeling' },
  { id: 'physical_discomfort', label: 'Physical Discomfort', icon: 'fitness-outline', description: 'Pain, withdrawal, illness, fatigue' },
  { id: 'cravings_urges', label: 'Cravings & Urges', icon: 'flame-outline', description: 'Sudden intense desire to use' },
  { id: 'environmental', label: 'Environmental Cues', icon: 'location-outline', description: 'Places, people, objects associated with past use' },
  { id: 'testing_control', label: 'Testing Control', icon: 'speedometer-outline', description: '"I can handle just one" — trying to use moderately' },
  { id: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline', description: 'Something else triggered me' },
];