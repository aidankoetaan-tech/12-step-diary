import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import { getPreventionPlan, savePreventionPlan } from '../storage';
import { PreventionPlan } from '../types';

const SECTIONS = [
  {
    id: 'triggers',
    title: 'My Triggers',
    icon: 'warning-outline',
    hint: 'What situations, feelings, or people make you want to use? Be specific.',
    placeholder:
      'e.g., Payday. Being alone on weekends. Arguments with my partner. Walking past the old bar.',
  },
  {
    id: 'warning_signs',
    title: 'Early Warning Signs',
    icon: 'eye-outline',
    hint: 'What thoughts or behaviors come BEFORE a relapse? These are the red flags.',
    placeholder:
      'e.g., Isolating from friends. Skipping meetings. Thinking "I can handle just one." Romanticizing past use.',
  },
  {
    id: 'coping_strategies',
    title: 'My Coping Strategies',
    icon: 'shield-checkmark-outline',
    hint: 'What healthy things can you do INSTEAD when triggered? List at least 5.',
    placeholder:
      'e.g., 1. Call my sponsor. 2. Go for a run. 3. Box breathing for 4 min. 4. Go to a meeting. 5. Play music.',
  },
  {
    id: 'support_network',
    title: 'My Support Network',
    icon: 'people-outline',
    hint: 'Who can you call, day or night? List names and numbers.',
    placeholder:
      'e.g., Sponsor: John (555-0123)\nTherapist: Dr. Smith (555-0456)\nBest friend: Sarah (555-0789)\nMom: (555-0321)',
  },
  {
    id: 'reasons',
    title: 'My Reasons to Stay Sober',
    icon: 'heart-outline',
    hint: 'Why are you doing this? Who and what matters most? Write this when you feel strong.',
    placeholder:
      'e.g., My daughter. Being present for her graduation. Waking up without shame. My health. My career.',
  },
  {
    id: 'emergency_plan',
    title: 'Emergency Plan',
    icon: 'alert-circle-outline',
    hint: 'If you feel like you\'re about to relapse RIGHT NOW, what do you do? Step by step.',
    placeholder:
      'e.g., 1. Stop. Breathe. 2. Call sponsor immediately. 3. Go to nearest meeting. 4. If still unsafe, go to ER or call crisis line.',
  },
  {
    id: 'big_book_signs',
    title: 'My Big Book Warning Signs',
    icon: 'book-outline',
    hint: 'Which of the Big Book predictors do you most need to watch for? These are YOUR personal red flags. Check all that apply.',
    placeholder:
      'e.g., Restless/irritable/discontented. Resentment toward my ex. Isolating — skipping meetings. Not calling sponsor. Feeling useless at work. Half measures in my step work.',
  },
  {
    id: 'big_book_antidote',
    title: 'My Big Book Antidote',
    icon: 'medkit-outline',
    hint: 'What specific actions will you take when you notice your warning signs? Write YOUR personal response plan.',
    placeholder:
      'e.g., 1. Call sponsor immediately — DO NOT WAIT. 2. Go to a meeting that day. 3. Re-read pp. 60-63 (self-will). 4. Find someone to help TODAY. 5. Resume Step 10 nightly inventory.',
  },
  {
    id: 'if_i_relapse',
    title: 'If I Relapse',
    icon: 'refresh-outline',
    hint: 'A lapse is not a relapse. If it happens, what\'s your plan to get back on track immediately?',
    placeholder:
      'e.g., 1. Do not hide it or lie. 2. Tell my sponsor within 24 hours. 3. Go to a meeting that day. 4. Identify what led to it without shame. 5. Reset — not restart. My sobriety journey continues.',
  },
] as const;

export default function PlanScreen() {
  const insets = useSafeAreaInsets();
  const [answers, setAnswers] = useState<PreventionPlan>({});
  const [saved, setSaved] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getPreventionPlan().then((plan) => {
        if (plan) {
          setAnswers(plan);
          setSaved(true);
        }
      });
    }, []),
  );

  const handleSave = async () => {
    const filled = SECTIONS.filter((s) => answers[s.id]?.trim()).length;
    if (filled < 5) {
      Alert.alert(
        'Keep going',
        `You've filled ${filled} of ${SECTIONS.length} sections. Try to complete at least 5 before saving.`,
      );
      return;
    }
    try {
      await savePreventionPlan(answers);
      setSaved(true);
    } catch {
      Alert.alert('Could not save', 'Your plan could not be stored. Please try again.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={{
          padding: spacing.md,
          paddingBottom: spacing.xl,
        }}
      >
        <Text style={styles.title}>Your Prevention Plan</Text>
        <Text style={styles.subtitle}>
          Fill this out when you’re feeling strong. It’s your map for when things get dark.
        </Text>

        {saved && (
          <View style={styles.savedBanner}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.savedText}>Plan saved — review and update it regularly</Text>
          </View>
        )}

        {SECTIONS.map((section, idx) => (
          <View key={section.id} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons
                  name={section.icon as keyof typeof Ionicons.glyphMap}
                  size={22}
                  color={colors.primary}
                />
              </View>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionNumber}>
                  Part {idx + 1} of {SECTIONS.length}
                </Text>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
            </View>
            <Text style={styles.sectionHint}>{section.hint}</Text>
            <TextInput
              style={styles.sectionInput}
              placeholder={section.placeholder}
              placeholderTextColor={colors.textFaint}
              multiline
              textAlignVertical="top"
              value={answers[section.id] ?? ''}
              onChangeText={(text) =>
                setAnswers((prev) => ({ ...prev, [section.id]: text }))
              }
            />
          </View>
        ))}

        {!saved && (
          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Ionicons name="lock-closed-outline" size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Save My Plan</Text>
          </Pressable>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This plan is stored locally on your device. Review and update it whenever something
            changes.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    marginTop: spacing.md,
  },
  subtitle: {
    color: colors.textDim,
    fontSize: 14,
    marginTop: spacing.xs,
    lineHeight: 22,
  },
  savedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.successSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  savedText: {
    flex: 1,
    fontSize: 14,
    color: colors.success,
  },
  sectionCard: {
    marginTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionNumber: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  sectionHint: {
    fontSize: 14,
    color: colors.textDim,
    lineHeight: 20,
    marginBottom: spacing.md,
    marginLeft: 58,
  },
  sectionInput: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 15,
    color: colors.text,
    minHeight: 120,
    lineHeight: 22,
    marginLeft: 58,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.xl,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    fontSize: 12,
    color: colors.textFaint,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
});