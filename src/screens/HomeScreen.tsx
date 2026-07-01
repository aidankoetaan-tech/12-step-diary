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
import { colors, spacing, radius } from '../theme';
import { reflectionForToday } from '../content';
import {
  getSobrietyDate,
  setSobrietyDate,
  getTodayCheckIn,
  addCheckIn,
  getCheckInStreak,
} from '../storage';
import { daysSinceStoredIsoDate, isValidPastIsoDate, nextMilestone } from '../date';
import { HaltCheck, RootTabParamList } from '../types';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

const HALT_META: Array<{ key: keyof HaltCheck; label: string; icon: string }> = [
  { key: 'hungry', label: 'Hungry', icon: 'restaurant-outline' },
  { key: 'angry', label: 'Angry', icon: 'flame-outline' },
  { key: 'lonely', label: 'Lonely', icon: 'person-outline' },
  { key: 'tired', label: 'Tired', icon: 'moon-outline' },
];

const BB_CHECKS = [
  { key: 'resentment', label: 'Am I holding any resentment?', icon: 'flame-outline' },
  { key: 'dishonest', label: 'Am I being honest with myself?', icon: 'eye-outline' },
  { key: 'isolating', label: 'Am I isolating or skipping meetings?', icon: 'person-remove-outline' },
  { key: 'restless', label: 'Do I feel restless or discontent?', icon: 'pulse-outline' },
] as const;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const [soberDate, setSoberDate] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draftDate, setDraftDate] = useState('');

  // Check-in state
  const [mood, setMood] = useState(5);
  const [craving, setCraving] = useState(0);
  const [halt, setHalt] = useState<HaltCheck>({
    hungry: false,
    angry: false,
    lonely: false,
    tired: false,
  });
  const [bbCheck, setBbCheck] = useState({
    resentment: false,
    dishonest: false,
    isolating: false,
    restless: false,
  });
  const [checkedIn, setCheckedIn] = useState(false);
  const [streak, setStreak] = useState(0);

  useFocusEffect(
    useCallback(() => {
      getSobrietyDate().then(setSoberDate);
      getTodayCheckIn().then((today) => {
        if (today) {
          setCheckedIn(true);
          setMood(today.mood);
          setCraving(today.craving);
          setHalt(today.halt);
        } else {
          setCheckedIn(false);
          setMood(5);
          setCraving(0);
          setHalt({ hungry: false, angry: false, lonely: false, tired: false });
        }
      });
      getCheckInStreak().then(setStreak);
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

  const toggleHalt = (key: keyof HaltCheck) => {
    setHalt((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCheckIn = async () => {
    try {
      await addCheckIn({
        mood,
        craving,
        halt,
        notes: '',
        triggersLogged: 0,
        skillsUsed: 0,
      });
      setCheckedIn(true);
      setStreak(await getCheckInStreak());
    } catch {
      Alert.alert('Could not save', 'Your check-in could not be stored. Please try again.');
    }
  };

  const days = daysSinceStoredIsoDate(soberDate);
  const haltCount = Object.values(halt).filter(Boolean).length;
  const haltWarning = haltCount >= 3;
  const bbCount = Object.values(bbCheck).filter(Boolean).length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: insets.top + spacing.lg, paddingBottom: spacing.xl }}
    >
      <Text style={styles.kicker}>RECOVERY COMPANION</Text>
      <Text style={styles.greeting}>{greeting()}.</Text>

      {/* Sobriety counter card */}
      <View style={styles.card}>
        {days === null || editing ? (
          <View>
            <Text style={styles.cardTitle}>
              {editing ? 'Update your sobriety date' : 'Start your counter'}
            </Text>
            <Text style={styles.cardBody}>
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
              <Pressable style={styles.primaryButton} onPress={saveDate}>
                <Text style={styles.primaryButtonText}>Save</Text>
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
              <Text style={styles.cardTitle}>Sober for</Text>
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
            <Text style={styles.dayCount}>{days}</Text>
            <Text style={styles.dayLabel}>{days === 1 ? 'day' : 'days'}</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="flame" size={14} color={colors.warning} />
                <Text style={styles.statValue}>{streak}</Text>
                <Text style={styles.statLabel}>day streak</Text>
              </View>
              <View style={styles.milestonePill}>
                <Ionicons name="flag" size={13} color={colors.primary} />
                <Text style={styles.milestoneText}>
                  {nextMilestone(days) - days} days to {nextMilestone(days)}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Daily check-in */}
      <Text style={styles.sectionLabel}>DAILY CHECK-IN</Text>
      {checkedIn ? (
        <View style={styles.checkedInCard}>
          <Ionicons name="checkmark-circle" size={36} color={colors.success} />
          <Text style={styles.checkedInTitle}>You’re checked in today</Text>
          <Text style={styles.checkedInSub}>
            Mood: {mood}/10 · Craving: {craving}/10 · HALT: {haltCount}/4
          </Text>
          <Text style={styles.checkedInSub}>One day at a time. Keep going.</Text>
        </View>
      ) : (
        <View style={styles.checkInWrap}>
          {/* Mood */}
          <View style={styles.card}>
            <Text style={styles.checkInLabel}>MOOD</Text>
            <View style={styles.sliderRow}>
              <Text style={styles.emoji}>😞</Text>
              <Text style={styles.sliderValue}>{mood}/10</Text>
              <Text style={styles.emoji}>😊</Text>
            </View>
            <View style={styles.sliderTrack}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <Pressable
                  key={n}
                  style={[styles.sliderDot, mood >= n && styles.sliderDotActive]}
                  onPress={() => setMood(n)}
                />
              ))}
            </View>
          </View>

          {/* Craving */}
          <View style={styles.card}>
            <Text style={styles.checkInLabel}>CRAVING INTENSITY</Text>
            <View style={styles.sliderRow}>
              <Text style={styles.sliderLabel}>none</Text>
              <Text style={styles.sliderValue}>{craving}/10</Text>
              <Text style={styles.sliderLabel}>intense</Text>
            </View>
            <View style={styles.sliderTrack}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <Pressable
                  key={n}
                  style={[
                    styles.sliderDot,
                    craving >= n ? styles.sliderDotDanger : styles.sliderDotNeutral,
                  ]}
                  onPress={() => setCraving(n)}
                />
              ))}
            </View>
            {craving >= 7 && (
              <View style={styles.warningBanner}>
                <Ionicons name="warning" size={16} color={colors.warning} />
                <Text style={styles.warningText}>High craving — try urge surfing in Tools</Text>
              </View>
            )}
          </View>

          {/* HALT */}
          <View style={styles.card}>
            <Text style={styles.checkInLabel}>HALT CHECK</Text>
            <Text style={styles.haltSub}>Which of these are you feeling right now?</Text>
            <View style={styles.haltGrid}>
              {HALT_META.map((item) => (
                <Pressable
                  key={item.key}
                  style={[styles.haltButton, halt[item.key] && styles.haltActive]}
                  onPress={() => toggleHalt(item.key)}
                >
                  <Ionicons
                    name={item.icon as keyof typeof Ionicons.glyphMap}
                    size={20}
                    color={halt[item.key] ? '#FFFFFF' : colors.textDim}
                  />
                  <Text style={[styles.haltLabel, halt[item.key] && styles.haltLabelActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            {haltWarning && (
              <View style={styles.warnBanner}>
                <Ionicons name="alert-circle" size={16} color={colors.warning} />
                <Text style={styles.warnText}>
                  {haltCount} HALT triggers active — you’re vulnerable. Be gentle.
                </Text>
              </View>
            )}
          </View>

          {/* Big Book quick check */}
          <View style={styles.card}>
            <Text style={styles.checkInLabel}>BIG BOOK CHECK</Text>
            <Text style={styles.haltSub}>Quick self-check from AA’s Big Book:</Text>
            <View style={styles.bbCheckList}>
              {BB_CHECKS.map((item) => {
                const active = bbCheck[item.key];
                return (
                  <Pressable
                    key={item.key}
                    style={[styles.bbCheckItem, active && styles.bbCheckItemActive]}
                    onPress={() =>
                      setBbCheck((prev) => ({ ...prev, [item.key]: !prev[item.key] }))
                    }
                  >
                    <Ionicons
                      name={item.icon as keyof typeof Ionicons.glyphMap}
                      size={16}
                      color={active ? '#FFFFFF' : colors.textDim}
                    />
                    <Text style={[styles.bbCheckLabel, active && styles.bbCheckLabelActive]}>
                      {item.label}
                    </Text>
                    <Ionicons
                      name={active ? 'checkmark-circle' : 'ellipse-outline'}
                      size={16}
                      color={active ? colors.success : colors.textDim}
                    />
                  </Pressable>
                );
              })}
            </View>
            {bbCount >= 2 && (
              <View style={styles.warnBanner}>
                <Ionicons name="book" size={16} color={colors.warning} />
                <Text style={styles.warnText}>
                  Multiple Big Book warning signs — these are predictors from “How It Works.” Talk to
                  your sponsor.
                </Text>
              </View>
            )}
          </View>

          <Pressable style={styles.checkInButton} onPress={handleCheckIn}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
            <Text style={styles.checkInButtonText}>Complete Check-In</Text>
          </Pressable>
        </View>
      )}

      {/* Reflection */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today’s reflection</Text>
        <Text style={styles.quote}>“{reflectionForToday()}”</Text>
      </View>

      {/* Quick actions */}
      <Text style={styles.sectionLabel}>JUST FOR TODAY</Text>
      <View style={styles.actionsRow}>
        <Pressable style={styles.actionCard} onPress={() => navigation.navigate('Journal')}>
          <Ionicons name="book" size={22} color={colors.primary} />
          <Text style={styles.actionTitle}>Write</Text>
          <Text style={styles.actionBody}>Put today into words</Text>
        </Pressable>
        <Pressable style={styles.actionCard} onPress={() => navigation.navigate('Steps')}>
          <Ionicons name="footsteps" size={22} color={colors.primary} />
          <Text style={styles.actionTitle}>Work a step</Text>
          <Text style={styles.actionBody}>Keep moving forward</Text>
        </Pressable>
        <Pressable style={styles.actionCard} onPress={() => navigation.navigate('Support')}>
          <Ionicons name="call" size={22} color={colors.primary} />
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
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardTitle: {
    color: colors.textDim,
    fontSize: 14,
    fontWeight: '600',
  },
  cardBody: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  counterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayCount: {
    color: colors.text,
    fontSize: 64,
    fontWeight: '800',
    marginTop: spacing.sm,
  },
  dayLabel: {
    color: colors.textDim,
    fontSize: 16,
    marginTop: -spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  statLabel: {
    color: colors.textDim,
    fontSize: 12,
  },
  milestonePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  milestoneText: {
    color: colors.text,
    fontSize: 13,
  },
  quote: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 27,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: colors.background,
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
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  ghostButton: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
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
    marginTop: spacing.sm,
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
    gap: 6,
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
  // Check-in
  checkInWrap: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  checkInLabel: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  sliderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  emoji: {
    fontSize: 22,
  },
  sliderValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  sliderLabel: {
    color: colors.textDim,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  sliderTrack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  sliderDot: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primarySoft,
  },
  sliderDotActive: {
    backgroundColor: colors.primary,
  },
  sliderDotDanger: {
    backgroundColor: colors.danger,
  },
  sliderDotNeutral: {
    backgroundColor: colors.primarySoft,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.warningSoft,
    borderRadius: radius.sm,
  },
  warningText: {
    color: colors.warning,
    fontSize: 13,
    flex: 1,
  },
  haltSub: {
    color: colors.textDim,
    fontSize: 13,
    marginBottom: spacing.md,
  },
  haltGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  haltButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  haltActive: {
    backgroundColor: colors.primary,
  },
  haltLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textDim,
  },
  haltLabelActive: {
    color: '#FFFFFF',
  },
  warnBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.warningSoft,
    borderRadius: radius.sm,
  },
  warnText: {
    color: colors.warning,
    fontSize: 13,
    flex: 1,
    lineHeight: 19,
  },
  bbCheckList: {
    gap: spacing.sm,
  },
  bbCheckItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  bbCheckItemActive: {
    backgroundColor: colors.primary,
  },
  bbCheckLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: colors.textDim,
  },
  bbCheckLabelActive: {
    color: '#FFFFFF',
  },
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    gap: spacing.sm,
  },
  checkInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  checkedInCard: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    marginBottom: spacing.md,
  },
  checkedInTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  checkedInSub: {
    color: colors.textDim,
    fontSize: 14,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});