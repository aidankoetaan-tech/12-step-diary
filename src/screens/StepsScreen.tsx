import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, PrimaryButton, Screen } from '../components/ui';
import { PremiumGate } from '../components/PremiumGate';
import { colors, radius, spacing } from '../theme';
import { STEPS } from '../constants/steps';
import { useData } from '../context/DataContext';
import { useEntitlement } from '../context/EntitlementContext';

export default function StepsScreen() {
  const { isPremium } = useEntitlement();
  const { data } = useData();
  const [expanded, setExpanded] = useState<number | null>(null);

  const completedCount = useMemo(
    () =>
      Object.values(data.stepWork).filter(
        (w) => Object.values(w.answers).some((a) => a.trim().length > 0),
      ).length,
    [data.stepWork],
  );

  return (
    <Screen title="The 12 Steps" subtitle="Guided stepwork, at your own pace.">
      {!isPremium ? (
        <PremiumGate
          title="Guided stepwork is a Premium feature"
          description="Work through all twelve steps with reflection prompts, save your answers privately, and pick up where you left off. The free plan includes your day counter, journal, and milestones."
          reason="Guided stepwork — all 12 steps with prompts — is part of Premium."
        >
          <View />
        </PremiumGate>
      ) : (
        <Card>
          <Text style={styles.progressText}>
            {completedCount} of {STEPS.length} steps started
          </Text>
          <View style={styles.track}>
            <View
              style={[styles.fill, { width: `${(completedCount / STEPS.length) * 100}%` }]}
            />
          </View>
        </Card>
      )}

      {STEPS.map((step) => {
        const isOpen = expanded === step.number;
        const work = data.stepWork[step.number];
        const started = work && Object.values(work.answers).some((a) => a.trim().length > 0);
        return (
          <Card key={step.number} style={{ paddingVertical: spacing.md }}>
            <Pressable
              style={styles.stepHeader}
              onPress={() => setExpanded(isOpen ? null : step.number)}
            >
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{step.number}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepText} numberOfLines={isOpen ? undefined : 2}>
                  {step.text}
                </Text>
              </View>
              <View style={{ alignItems: 'center', gap: 4 }}>
                {isPremium && started ? (
                  <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                ) : null}
                <Ionicons
                  name={isOpen ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={colors.textMuted}
                />
              </View>
            </Pressable>

            {isOpen ? (
              isPremium ? (
                <StepWorkEditor step={step.number} />
              ) : (
                <Text style={styles.lockedHint}>
                  Unlock Premium above to answer the prompts for this step and save your work.
                </Text>
              )
            ) : null}
          </Card>
        );
      })}
    </Screen>
  );
}

function StepWorkEditor({ step }: { step: number }) {
  const { data, saveStepWork } = useData();
  const stepDef = STEPS.find((s) => s.number === step)!;
  const existing = data.stepWork[step]?.answers ?? {};
  const [answers, setAnswers] = useState<Record<number, string>>(existing);
  const [saved, setSaved] = useState(false);

  function update(i: number, text: string) {
    setAnswers((a) => ({ ...a, [i]: text }));
    setSaved(false);
  }

  return (
    <View style={styles.editor}>
      {stepDef.prompts.map((prompt, i) => (
        <View key={i} style={{ marginBottom: spacing.md }}>
          <Text style={styles.prompt}>{prompt}</Text>
          <TextInput
            value={answers[i] ?? ''}
            onChangeText={(t) => update(i, t)}
            placeholder="Write your reflection…"
            placeholderTextColor={colors.textFaint}
            multiline
            style={styles.answerInput}
          />
        </View>
      ))}
      <PrimaryButton
        label={saved ? 'Saved ✓' : 'Save stepwork'}
        onPress={() => {
          saveStepWork(step, answers);
          setSaved(true);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  progressText: { color: colors.text, fontSize: 14.5, fontWeight: '600' },
  track: {
    height: 8,
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  fill: { height: 8, backgroundColor: colors.primary, borderRadius: 999 },
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stepNumber: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: { color: colors.primary, fontSize: 15, fontWeight: '800' },
  stepTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  stepText: { color: colors.textMuted, fontSize: 13.5, lineHeight: 19, marginTop: 2 },
  lockedHint: { color: colors.textFaint, fontSize: 13.5, marginTop: spacing.md, lineHeight: 19 },
  editor: { marginTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.cardBorder, paddingTop: spacing.md },
  prompt: { color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: 6 },
  answerInput: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    color: colors.text,
    padding: spacing.md,
    fontSize: 14.5,
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
