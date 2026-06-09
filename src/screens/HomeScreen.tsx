import React, { useCallback, useState } from 'react';
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
import { getSobrietyDate, setSobrietyDate } from '../storage';
import { RootTabParamList } from '../types';

const MILESTONES = [1, 7, 30, 60, 90, 180, 365, 730, 1095];

function daysSince(isoDate: string): number {
  const [year, month, day] = isoDate.split('-').map(Number);
  const start = new Date(year, month - 1, day);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.round((today.getTime() - start.getTime()) / 86400000));
}

function nextMilestone(days: number): number {
  const upcoming = MILESTONES.find((m) => m > days);
  if (upcoming) return upcoming;
  return (Math.floor(days / 365) + 1) * 365;
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
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
    const valid =
      /^\d{4}-\d{2}-\d{2}$/.test(trimmed) &&
      !Number.isNaN(new Date(trimmed).getTime()) &&
      new Date(trimmed).getTime() <= Date.now();
    if (!valid) {
      Alert.alert('Invalid date', 'Please enter a past date as YYYY-MM-DD, e.g. 2025-11-03.');
      return;
    }
    await setSobrietyDate(trimmed);
    setSoberDate(trimmed);
    setEditing(false);
  };

  const days = soberDate ? daysSince(soberDate) : null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: insets.top + spacing.lg, paddingBottom: spacing.xl }}
    >
      <Text style={styles.kicker}>RECOVERY COMPANION</Text>
      <Text style={styles.greeting}>{greeting()}.</Text>

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
            <View style={styles.milestonePill}>
              <Ionicons name="flag" size={13} color={colors.primary} />
              <Text style={styles.milestoneText}>
                {nextMilestone(days) - days} days to your next milestone ({nextMilestone(days)})
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today’s reflection</Text>
        <Text style={styles.quote}>“{reflectionForToday()}”</Text>
      </View>

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
        <Pressable style={styles.actionCard} onPress={() => navigation.navigate('Sponsor')}>
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
  milestonePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginTop: spacing.md,
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
});
