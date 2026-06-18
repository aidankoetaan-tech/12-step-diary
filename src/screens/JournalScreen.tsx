import React, { useState } from 'react';
import { Pressable, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, PrimaryButton, Screen } from '../components/ui';
import { PremiumLockButton } from '../components/PremiumGate';
import { colors, radius, spacing } from '../theme';
import { useData } from '../context/DataContext';
import { useEntitlement } from '../context/EntitlementContext';
import { STEPS } from '../constants/steps';

export default function JournalScreen() {
  const { data, addJournalEntry, deleteJournalEntry } = useData();
  const { isPremium } = useEntitlement();
  const [text, setText] = useState('');

  function onAdd() {
    if (!text.trim()) return;
    addJournalEntry(text);
    setText('');
  }

  async function onExport() {
    await Share.share({ message: buildExport(data) });
  }

  return (
    <Screen title="Journal" subtitle="A private space to reflect.">
      <Card>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="What's on your mind today?"
          placeholderTextColor={colors.textFaint}
          multiline
          style={styles.input}
        />
        <View style={{ height: spacing.sm }} />
        <PrimaryButton label="Add entry" onPress={onAdd} disabled={!text.trim()} />
      </Card>

      <View style={styles.exportRow}>
        <Text style={styles.sectionLabel}>
          {data.journal.length} {data.journal.length === 1 ? 'entry' : 'entries'}
        </Text>
        {isPremium ? (
          <Pressable style={styles.exportBtn} onPress={onExport}>
            <Ionicons name="share-outline" size={16} color={colors.primary} />
            <Text style={styles.exportText}>Export</Text>
          </Pressable>
        ) : (
          <PremiumLockButton
            label="Export"
            reason="Exporting your journal and stepwork is a Premium feature."
          />
        )}
      </View>

      {data.journal.length === 0 ? (
        <Card>
          <Text style={styles.empty}>Your entries will appear here. Even a sentence counts.</Text>
        </Card>
      ) : (
        data.journal.map((entry) => (
          <Card key={entry.id}>
            <View style={styles.entryHeader}>
              <Text style={styles.entryDate}>
                {new Date(entry.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
                {'  ·  '}
                {new Date(entry.createdAt).toLocaleTimeString(undefined, {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </Text>
              <Pressable hitSlop={10} onPress={() => deleteJournalEntry(entry.id)}>
                <Ionicons name="trash-outline" size={17} color={colors.textFaint} />
              </Pressable>
            </View>
            <Text style={styles.entryText}>{entry.text}</Text>
          </Card>
        ))
      )}
    </Screen>
  );
}

function buildExport(data: ReturnType<typeof useData>['data']): string {
  let out = 'RECOVERY COMPANION — Export\n';
  out += `Generated: ${new Date().toLocaleString()}\n\n`;

  out += '== JOURNAL ==\n';
  if (data.journal.length === 0) out += '(no entries)\n';
  for (const e of data.journal) {
    out += `\n[${new Date(e.createdAt).toLocaleString()}]\n${e.text}\n`;
  }

  out += '\n\n== STEPWORK ==\n';
  for (const step of STEPS) {
    const work = data.stepWork[step.number];
    if (!work) continue;
    const answered = step.prompts
      .map((p, i) => ({ p, a: work.answers[i] }))
      .filter((x) => x.a && x.a.trim());
    if (answered.length === 0) continue;
    out += `\nStep ${step.number} — ${step.title}\n`;
    for (const { p, a } of answered) out += `  • ${p}\n    ${a}\n`;
  }
  return out;
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    color: colors.text,
    padding: spacing.md,
    fontSize: 15.5,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  exportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  sectionLabel: { color: colors.textMuted, fontSize: 13.5, fontWeight: '600' },
  exportBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12 },
  exportText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  empty: { color: colors.textFaint, fontSize: 14, lineHeight: 20 },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  entryDate: { color: colors.textMuted, fontSize: 12.5, fontWeight: '600' },
  entryText: { color: colors.text, fontSize: 15, lineHeight: 21 },
});
