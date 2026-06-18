import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients, spacing } from '../theme';
import { MILESTONES_META, MilestoneMeta } from '../content';

interface Props {
  days: number;
  soberDate: string | null;
}

function earnedDateLabel(soberDate: string, addDays: number): string {
  const [year, month, day] = soberDate.split('-').map(Number);
  const earned = new Date(year, month - 1, day + addDays);
  return earned.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function MilestoneStrip({ days, soberDate }: Props) {
  const nextIndex = MILESTONES_META.findIndex((m) => days < m.days);

  const onPress = (m: MilestoneMeta, earned: boolean) => {
    if (earned) {
      const when = soberDate ? ` on ${earnedDateLabel(soberDate, m.days)}` : '';
      Alert.alert('Milestone reached', `You reached ${m.label}${when}. That's real progress — be proud of it.`);
    } else {
      const remaining = m.days - days;
      Alert.alert(
        'Keep going',
        `${remaining} ${remaining === 1 ? 'day' : 'days'} to ${m.label}. One day at a time.`,
      );
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {MILESTONES_META.map((m, index) => {
        const earned = days >= m.days;
        const isNext = index === nextIndex;
        return (
          <Pressable key={m.days} style={styles.item} onPress={() => onPress(m, earned)}>
            {earned ? (
              <LinearGradient
                colors={gradients.gold}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.medallion}
              >
                <Text style={styles.medalShortEarned}>{m.short}</Text>
                <View style={styles.checkBadge}>
                  <Ionicons name="checkmark" size={11} color={colors.onAccent} />
                </View>
              </LinearGradient>
            ) : (
              <View style={[styles.medallion, styles.medallionLocked, isNext && styles.medallionNext]}>
                <Text style={[styles.medalShortLocked, isNext && styles.medalShortNext]}>{m.short}</Text>
              </View>
            )}
            <Text style={[styles.label, earned && styles.labelEarned, isNext && styles.labelNext]}>
              {m.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const SIZE = 62;

const styles = StyleSheet.create({
  row: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingRight: spacing.md,
  },
  item: {
    alignItems: 'center',
    width: 72,
  },
  medallion: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medallionLocked: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  medallionNext: {
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  medalShortEarned: {
    color: colors.onAccent,
    fontSize: 16,
    fontWeight: '800',
  },
  medalShortLocked: {
    color: colors.textFaint,
    fontSize: 15,
    fontWeight: '700',
  },
  medalShortNext: {
    color: colors.primary,
  },
  checkBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: colors.textFaint,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  labelEarned: {
    color: colors.accent,
  },
  labelNext: {
    color: colors.text,
  },
});
