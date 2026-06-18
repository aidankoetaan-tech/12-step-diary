import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, PrimaryButton, Screen, Pill } from '../components/ui';
import { colors, radius, spacing } from '../theme';
import { useData } from '../context/DataContext';
import { breakdown, daysSince, formatDateLong, todayISO } from '../lib/date';
import { MILESTONES, milestoneProgress } from '../constants/milestones';

export default function HomeScreen() {
  const { data, setSobrietyDate } = useData();
  const [draft, setDraft] = useState('');

  const days = daysSince(data.sobrietyDate);
  const { years, months, days: rem } = breakdown(days);
  const { reached, next } = milestoneProgress(days);

  if (!data.sobrietyDate) {
    return (
      <Screen title="Welcome" subtitle="Let's mark your start date.">
        <Card>
          <Text style={styles.bodyText}>
            Your sobriety date anchors your day counter and milestones. You can change it anytime.
          </Text>
          <View style={{ height: spacing.md }} />
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textFaint}
            style={styles.input}
            autoCapitalize="none"
          />
          <View style={{ height: spacing.sm }} />
          <PrimaryButton
            label="Set this date"
            onPress={() => /^\d{4}-\d{2}-\d{2}$/.test(draft) && setSobrietyDate(draft)}
          />
          <View style={{ height: spacing.sm }} />
          <PrimaryButton
            label="I'm starting today"
            variant="ghost"
            onPress={() => setSobrietyDate(todayISO())}
          />
        </Card>
      </Screen>
    );
  }

  const progressPct = next && reached
    ? Math.min(100, Math.round(((days - reached.days) / (next.days - reached.days)) * 100))
    : next
      ? Math.min(100, Math.round((days / next.days) * 100))
      : 100;

  return (
    <Screen title="Today" subtitle="One day at a time.">
      <Card style={styles.counterCard}>
        <Text style={styles.counterLabel}>DAYS CLEAN</Text>
        <Text style={styles.counterValue}>{days}</Text>
        {(years > 0 || months > 0) && (
          <Text style={styles.counterBreakdown}>
            {years > 0 ? `${years}y ` : ''}
            {months > 0 ? `${months}m ` : ''}
            {rem}d
          </Text>
        )}
        <Text style={styles.sinceText}>since {formatDateLong(data.sobrietyDate)}</Text>
      </Card>

      <Card>
        <View style={styles.rowBetween}>
          <Text style={styles.cardHeading}>Next milestone</Text>
          {reached ? <Pill text={reached.label} /> : null}
        </View>
        {next ? (
          <>
            <Text style={styles.nextText}>
              {next.label} — {next.days - days} day{next.days - days === 1 ? '' : 's'} to go
            </Text>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${progressPct}%` }]} />
            </View>
          </>
        ) : (
          <Text style={styles.nextText}>You've passed every milestone. Remarkable.</Text>
        )}
      </Card>

      <Card>
        <Text style={styles.cardHeading}>Milestones</Text>
        <View style={{ height: spacing.sm }} />
        {MILESTONES.map((m) => {
          const done = days >= m.days;
          return (
            <View key={m.days} style={styles.mRow}>
              <Ionicons
                name={done ? 'checkmark-circle' : 'ellipse-outline'}
                size={20}
                color={done ? colors.success : colors.textFaint}
              />
              <Text style={[styles.mLabel, !done && { color: colors.textFaint }]}>{m.label}</Text>
              <Text style={[styles.mDays, !done && { color: colors.textFaint }]}>{m.days}d</Text>
            </View>
          );
        })}
      </Card>

      <Card>
        <Text style={styles.cardHeading}>Sobriety date</Text>
        <Text style={styles.bodyText}>{formatDateLong(data.sobrietyDate)}</Text>
        <View style={{ height: spacing.sm }} />
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Change to YYYY-MM-DD"
          placeholderTextColor={colors.textFaint}
          style={styles.input}
          autoCapitalize="none"
        />
        <View style={{ height: spacing.sm }} />
        <PrimaryButton
          label="Update date"
          variant="ghost"
          onPress={() => /^\d{4}-\d{2}-\d{2}$/.test(draft) && setSobrietyDate(draft)}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bodyText: { color: colors.textMuted, fontSize: 14.5, lineHeight: 21 },
  input: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 16,
  },
  counterCard: { alignItems: 'center', paddingVertical: spacing.xl },
  counterLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 2 },
  counterValue: { color: colors.primary, fontSize: 72, fontWeight: '800', lineHeight: 80 },
  counterBreakdown: { color: colors.text, fontSize: 17, fontWeight: '600' },
  sinceText: { color: colors.textFaint, fontSize: 13, marginTop: spacing.xs },
  cardHeading: { color: colors.text, fontSize: 16, fontWeight: '700' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nextText: { color: colors.textMuted, fontSize: 14, marginTop: spacing.sm },
  track: {
    height: 8,
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  fill: { height: 8, backgroundColor: colors.primary, borderRadius: 999 },
  mRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, gap: spacing.sm },
  mLabel: { color: colors.text, fontSize: 14.5, flex: 1 },
  mDays: { color: colors.textMuted, fontSize: 13 },
});
