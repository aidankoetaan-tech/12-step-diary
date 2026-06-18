import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, spacing, radius } from '../theme';
import {
  earnedMilestoneCount,
  milestoneLabel,
  MILESTONES_META,
  reflectionForToday,
} from '../content';
import { getSobrietyDate, setSobrietyDate } from '../storage';
import { daysSinceStoredIsoDate, isValidPastIsoDate, nextMilestone } from '../date';
import { RootTabParamList } from '../types';
import MilestoneStrip from '../components/MilestoneStrip';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

// Anchor and target for the progress bar toward the next milestone.
function milestoneBounds(days: number): { prev: number; next: number } {
  const next = nextMilestone(days);
  const listPrev = [0, ...MILESTONES_META.map((m) => m.days)].filter((d) => d <= days).pop() ?? 0;
  const yearPrev = days >= 365 ? Math.floor(days / 365) * 365 : 0;
  return { prev: Math.max(listPrev, yearPrev), next };
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const [soberDate, setSoberDate] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draftDate, setDraftDate] = useState('');

  useFocusEffect(
    useCallback(() => {
      getSobrietyDate().then(setSoberDate);
    }, []),
  );

  const saveDate = async () => {
    const trimmed = draftDate.trim();
    if (!isValidPastIsoDate(trimmed)) {
      Alert.alert('Invalid date', 'Please enter a past date as YYYY-MM-DD, e.g. 2025-11-03.');
      return;
    }
    try {
      await setSobrietyDate(trimmed);
      setSoberDate(trimmed);
      setEditing(false);
    } catch {
      Alert.alert('Could not save', 'Your sobriety date could not be stored. Please try again.');
    }
  };

  const days = daysSinceStoredIsoDate(soberDate);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: insets.top + spacing.lg, paddingBottom: spacing.xl }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.kicker}>RECOVERY COMPANION</Text>
      <Text style={styles.greeting}>{greeting()}.</Text>

      <LinearGradient
        colors={gradients.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        {days === null || editing ? (
          <View>
            <Text style={styles.heroKicker}>{editing ? 'UPDATE DATE' : 'WELCOME'}</Text>
            <Text style={styles.heroSetupTitle}>
              {editing ? 'Update your sobriety date' : 'Start your counter'}
            </Text>
            <Text style={styles.heroBody}>
              Enter the first day of your sobriety and we’ll keep count with you.
            </Text>
            <TextInput
              style={styles.input}
              value={draftDate}
              onChangeText={setDraftDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textFaint}
              keyboardType="numbers-and-punctuation"
              maxLength={10}
            />
            <View style={styles.row}>
              <Pressable style={styles.flex1} onPress={saveDate}>
                <LinearGradient
                  colors={gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryButton}
                >
                  <Text style={styles.primaryButtonText}>Save</Text>
                </LinearGradient>
              </Pressable>
              {editing && (
                <Pressable style={styles.ghostButton} onPress={() => setEditing(false)}>
                  <Text style={styles.ghostButtonText}>Cancel</Text>
                </Pressable>
              )}
            </View>
          </View>
        ) : (
          <View>
            <View style={styles.counterHeader}>
              <Text style={styles.heroKicker}>SOBER FOR</Text>
              <Pressable
                hitSlop={12}
                onPress={() => {
                  setDraftDate(soberDate ?? '');
                  setEditing(true);
                }}
              >
                <Ionicons name="pencil" size={16} color={colors.textDim} />
              </Pressable>
            </View>
            <View style={styles.countRow}>
              <Text style={styles.dayCount}>{days}</Text>
              <Text style={styles.dayLabel}>{days === 1 ? 'day' : 'days'}</Text>
            </View>
            {(() => {
              const { prev, next } = milestoneBounds(days);
              const pct = next > prev ? Math.min(100, ((days - prev) / (next - prev)) * 100) : 0;
              return (
                <View style={styles.progressBlock}>
                  <View style={styles.progressTrack}>
                    <LinearGradient
                      colors={gradients.progress}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.progressFill, { width: `${pct}%` }]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {next - days} {next - days === 1 ? 'day' : 'days'} to {milestoneLabel(next)}
                  </Text>
                </View>
              );
            })()}
          </View>
        )}
      </LinearGradient>

      {days !== null && (
        <View style={styles.milestoneSection}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionLabel}>MILESTONES</Text>
            <Text style={styles.sectionMeta}>{earnedMilestoneCount(days)} earned</Text>
          </View>
          <MilestoneStrip days={days} soberDate={soberDate} />
        </View>
      )}

      <View style={styles.card}>
        <View style={styles.reflectionHeader}>
          <Ionicons name="sparkles" size={14} color={colors.accent} />
          <Text style={styles.cardTitle}>TODAY’S REFLECTION</Text>
        </View>
        <Text style={styles.quote}>“{reflectionForToday()}”</Text>
      </View>

      <Text style={styles.sectionLabel}>JUST FOR TODAY</Text>
      <View style={styles.actionsRow}>
        <Pressable style={styles.actionCard} onPress={() => navigation.navigate('Journal')}>
          <View style={styles.actionIcon}>
            <Ionicons name="book" size={20} color={colors.primary} />
          </View>
          <Text style={styles.actionTitle}>Write</Text>
          <Text style={styles.actionBody}>Put today into words</Text>
        </Pressable>
        <Pressable style={styles.actionCard} onPress={() => navigation.navigate('Steps')}>
          <View style={styles.actionIcon}>
            <Ionicons name="footsteps" size={20} color={colors.primary} />
          </View>
          <Text style={styles.actionTitle}>Work a step</Text>
          <Text style={styles.actionBody}>Keep moving forward</Text>
        </Pressable>
        <Pressable style={styles.actionCard} onPress={() => navigation.navigate('Sponsor')}>
          <View style={styles.actionIcon}>
            <Ionicons name="call" size={20} color={colors.primary} />
          </View>
          <Text style={styles.actionTitle}>Reach out</Text>
          <Text style={styles.actionBody}>Connection is strength</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
  },
  kicker: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  greeting: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  hero: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  heroKicker: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  heroSetupTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  heroBody: {
    color: colors.textDim,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.xs,
  },
  counterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  dayCount: {
    color: colors.text,
    fontSize: 68,
    fontWeight: '800',
    letterSpacing: -1,
  },
  dayLabel: {
    color: colors.textDim,
    fontSize: 18,
    fontWeight: '600',
  },
  progressBlock: {
    marginTop: spacing.md,
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  progressText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  milestoneSection: {
    marginBottom: spacing.md,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  sectionMeta: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  reflectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardTitle: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  quote: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 27,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 16,
    marginTop: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  flex1: {
    flex: 1,
  },
  primaryButton: {
    borderRadius: radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  ghostButton: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
  },
  ghostButtonText: {
    color: colors.textDim,
    fontWeight: '600',
    fontSize: 15,
  },
  sectionLabel: {
    color: colors.textFaint,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 8,
  },
  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  actionBody: {
    color: colors.textDim,
    fontSize: 12,
    lineHeight: 16,
  },
});
