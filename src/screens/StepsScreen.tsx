import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import { TWELVE_STEPS, StepDefinition } from '../content';
import { getStepsProgress, setStepsProgress } from '../storage';
import { StepsProgress, StepStatus } from '../types';

const STATUS_META: Record<StepStatus, { label: string; color: string; bg: string }> = {
  none: { label: 'Not started', color: colors.textFaint, bg: 'transparent' },
  working: { label: 'Working on it', color: colors.warning, bg: colors.warningSoft },
  done: { label: 'Complete', color: colors.success, bg: colors.successSoft },
};

export default function StepsScreen() {
  const insets = useSafeAreaInsets();
  const [progress, setProgress] = useState<StepsProgress>({});
  const [expanded, setExpanded] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      getStepsProgress().then(setProgress);
    }, []),
  );

  const setStatus = async (step: number, status: StepStatus) => {
    const next = { ...progress, [step]: status };
    setProgress(next);
    await setStepsProgress(next);
  };

  const doneCount = TWELVE_STEPS.filter((s) => progress[s.number] === 'done').length;

  const renderStep = ({ item }: { item: StepDefinition }) => {
    const status = progress[item.number] ?? 'none';
    const meta = STATUS_META[status];
    const isOpen = expanded === item.number;
    return (
      <Pressable
        style={styles.stepCard}
        onPress={() => setExpanded(isOpen ? null : item.number)}
      >
        <View style={styles.stepHeader}>
          <View
            style={[
              styles.stepNumber,
              status === 'done' && { backgroundColor: colors.success },
              status === 'working' && { backgroundColor: colors.warning },
            ]}
          >
            {status === 'done' ? (
              <Ionicons name="checkmark" size={16} color={colors.background} />
            ) : (
              <Text
                style={[styles.stepNumberText, status === 'working' && { color: colors.background }]}
              >
                {item.number}
              </Text>
            )}
          </View>
          <View style={styles.stepHeading}>
            <Text style={styles.stepTitle}>{item.title}</Text>
            <Text style={[styles.statusLabel, { color: meta.color }]}>{meta.label}</Text>
          </View>
          <Ionicons
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.textFaint}
          />
        </View>
        <Text style={styles.stepText} numberOfLines={isOpen ? undefined : 2}>
          {item.text}
        </Text>
        {isOpen && (
          <View style={styles.statusRow}>
            {(['working', 'done', 'none'] as StepStatus[]).map((option) => (
              <Pressable
                key={option}
                style={[
                  styles.statusButton,
                  status === option && {
                    backgroundColor: STATUS_META[option].bg,
                    borderColor: STATUS_META[option].color,
                  },
                ]}
                onPress={() => setStatus(item.number, option)}
              >
                <Text
                  style={[
                    styles.statusButtonText,
                    status === option && { color: STATUS_META[option].color },
                  ]}
                >
                  {option === 'none' ? 'Reset' : STATUS_META[option].label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <Text style={styles.kicker}>THE PROGRAM</Text>
      <Text style={styles.title}>The 12 Steps</Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${(doneCount / 12) * 100}%` }]} />
      </View>
      <Text style={styles.progressLabel}>{doneCount} of 12 steps complete</Text>
      <FlatList
        data={TWELVE_STEPS}
        keyExtractor={(item) => String(item.number)}
        renderItem={renderStep}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        showsVerticalScrollIndicator={false}
      />
    </View>
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
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
  },
  progressLabel: {
    color: colors.textDim,
    fontSize: 13,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  stepCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 14,
  },
  stepHeading: {
    flex: 1,
  },
  stepTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
  stepText: {
    color: colors.textDim,
    fontSize: 14,
    lineHeight: 21,
    marginTop: spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  statusButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },
  statusButtonText: {
    color: colors.textDim,
    fontSize: 13,
    fontWeight: '600',
  },
});
