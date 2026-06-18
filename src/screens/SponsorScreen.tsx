import React, { useState } from 'react';
import { Pressable, Share, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, PrimaryButton, Screen } from '../components/ui';
import { PremiumGate } from '../components/PremiumGate';
import { Paywall } from '../components/Paywall';
import { colors, radius, spacing } from '../theme';
import { useData } from '../context/DataContext';
import { useEntitlement } from '../context/EntitlementContext';
import { STEPS } from '../constants/steps';

export default function SponsorScreen() {
  const { data } = useData();
  const { isPremium, storeReady, restore, devPremium, toggleDevPremium } = useEntitlement();
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [restoreMsg, setRestoreMsg] = useState<string | null>(null);

  async function shareWithSponsor() {
    await Share.share({ message: buildSponsorSummary(data) });
  }

  async function createBackup() {
    // Backup payload the user can save to their own secure storage / cloud.
    await Share.share({ message: JSON.stringify(data, null, 2) });
  }

  async function onRestore() {
    const ok = await restore();
    setRestoreMsg(ok ? 'Purchases restored.' : 'No previous purchases found.');
  }

  return (
    <Screen title="Sponsor & Backup" subtitle="Share your progress and keep it safe.">
      <PremiumGate
        title="Sponsor sharing & encrypted backup"
        description="Share a clean summary of your stepwork and journal with your sponsor, and create a portable backup of everything you've recorded."
        reason="Sponsor sharing and backup are Premium features."
      >
        <Card>
          <Text style={styles.cardHeading}>Share with your sponsor</Text>
          <Text style={styles.body}>
            Sends a readable summary of your recent journal entries and stepwork.
          </Text>
          <View style={{ height: spacing.md }} />
          <PrimaryButton label="Share summary" onPress={shareWithSponsor} />
        </Card>

        <Card>
          <Text style={styles.cardHeading}>Backup</Text>
          <Text style={styles.body}>
            Export a full copy of your data that you can store privately and restore later.
          </Text>
          <View style={{ height: spacing.md }} />
          <PrimaryButton label="Create backup" variant="ghost" onPress={createBackup} />
        </Card>
      </PremiumGate>

      {/* Account / membership */}
      <Card>
        <View style={styles.rowBetween}>
          <Text style={styles.cardHeading}>Membership</Text>
          <View style={[styles.statusPill, isPremium && styles.statusPremium]}>
            <Text style={[styles.statusText, isPremium && { color: colors.background }]}>
              {isPremium ? 'PREMIUM' : 'FREE'}
            </Text>
          </View>
        </View>
        {!isPremium ? (
          <>
            <Text style={styles.body}>
              Unlock guided stepwork, exports, sponsor sharing, and backup.
            </Text>
            <View style={{ height: spacing.md }} />
            <PrimaryButton label="See Premium plans" onPress={() => setPaywallOpen(true)} />
          </>
        ) : (
          <Text style={styles.body}>Thank you for supporting your recovery with Premium.</Text>
        )}
        <Pressable onPress={onRestore} style={styles.restore} disabled={!storeReady}>
          <Text style={[styles.restoreText, !storeReady && { color: colors.textFaint }]}>
            Restore purchases
          </Text>
        </Pressable>
        {restoreMsg ? <Text style={styles.restoreMsg}>{restoreMsg}</Text> : null}
      </Card>

      {__DEV__ ? (
        <Card>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardHeading}>Dev: simulate Premium</Text>
              <Text style={styles.body}>Preview premium screens without a store build.</Text>
            </View>
            <Switch
              value={devPremium}
              onValueChange={toggleDevPremium}
              trackColor={{ true: colors.primary, false: colors.cardBorder }}
            />
          </View>
        </Card>
      ) : null}

      <Paywall visible={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </Screen>
  );
}

function buildSponsorSummary(data: ReturnType<typeof useData>['data']): string {
  let out = 'My recovery check-in\n\n';
  const recent = data.journal.slice(0, 5);
  if (recent.length) {
    out += 'Recent journal:\n';
    for (const e of recent) {
      out += `• ${new Date(e.createdAt).toLocaleDateString()}: ${e.text}\n`;
    }
    out += '\n';
  }
  const startedSteps = STEPS.filter((s) => {
    const w = data.stepWork[s.number];
    return w && Object.values(w.answers).some((a) => a.trim());
  });
  if (startedSteps.length) {
    out += `Stepwork in progress: ${startedSteps.map((s) => `Step ${s.number}`).join(', ')}\n`;
  }
  return out.trim() || 'Just checking in.';
}

const styles = StyleSheet.create({
  cardHeading: { color: colors.text, fontSize: 16, fontWeight: '700' },
  body: { color: colors.textMuted, fontSize: 14, lineHeight: 20, marginTop: 4 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusPill: {
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statusPremium: { backgroundColor: colors.gold },
  statusText: { color: colors.textMuted, fontSize: 11.5, fontWeight: '800', letterSpacing: 0.8 },
  restore: { paddingTop: spacing.md },
  restoreText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  restoreMsg: { color: colors.textMuted, fontSize: 13, marginTop: 6 },
});
