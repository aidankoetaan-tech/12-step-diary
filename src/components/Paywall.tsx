import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../theme';
import { PlanKey, PREMIUM_FEATURES } from '../constants/products';
import { planRows, useEntitlement } from '../context/EntitlementContext';
import { PrimaryButton } from './ui';

export function Paywall({
  visible,
  onClose,
  reason,
}: {
  visible: boolean;
  onClose: () => void;
  reason?: string;
}) {
  const insets = useSafeAreaInsets();
  const { packages, purchase, restore, storeReady } = useEntitlement();
  const [selected, setSelected] = useState<PlanKey>('annual');
  const [busy, setBusy] = useState(false);

  const rows = planRows(packages);

  async function onPurchase() {
    setBusy(true);
    const ok = await purchase(selected);
    setBusy(false);
    if (ok) onClose();
  }

  async function onRestore() {
    setBusy(true);
    const ok = await restore();
    setBusy(false);
    if (ok) onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
          <Pressable style={styles.close} onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={24} color={colors.textMuted} />
          </Pressable>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.kicker}>RECOVERY COMPANION PREMIUM</Text>
            <Text style={styles.heading}>Unlock the full stepwork</Text>
            {reason ? <Text style={styles.reason}>{reason}</Text> : null}

            <View style={styles.features}>
              {PREMIUM_FEATURES.map((f) => (
                <View key={f} style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </View>

            {rows.map((row) => {
              const isSel = selected === row.key;
              return (
                <Pressable
                  key={row.key}
                  onPress={() => setSelected(row.key)}
                  style={[styles.plan, isSel && styles.planSelected]}
                >
                  <View style={styles.planRadioWrap}>
                    <Ionicons
                      name={isSel ? 'radio-button-on' : 'radio-button-off'}
                      size={22}
                      color={isSel ? colors.primary : colors.textFaint}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.planTitleRow}>
                      <Text style={styles.planName}>{row.name}</Text>
                      {row.recommended ? (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>POPULAR</Text>
                        </View>
                      ) : null}
                    </View>
                    {row.highlight ? <Text style={styles.planHint}>{row.highlight}</Text> : null}
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.planPrice}>{row.priceString}</Text>
                    <Text style={styles.planCadence}>{row.cadence}</Text>
                  </View>
                </Pressable>
              );
            })}

            <View style={{ height: spacing.md }} />
            <PrimaryButton
              label={selected === 'lifetime' ? 'Buy Lifetime Access' : 'Start Premium'}
              onPress={onPurchase}
              loading={busy}
              disabled={!storeReady}
            />
            {!storeReady ? (
              <Text style={styles.notice}>
                Purchasing requires a production build connected to the store. Pricing shown is
                indicative.
              </Text>
            ) : null}

            <Pressable onPress={onRestore} style={styles.restore} disabled={busy}>
              <Text style={styles.restoreText}>Restore purchases</Text>
            </Pressable>

            <Text style={styles.legal}>
              Subscriptions renew automatically until cancelled. Lifetime is a one-time purchase.
              Manage or cancel anytime in your store account.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    maxHeight: '92%',
    borderTopWidth: 1,
    borderColor: colors.cardBorder,
  },
  close: { position: 'absolute', right: spacing.md, top: spacing.md, zIndex: 2, padding: 4 },
  kicker: {
    color: colors.primary,
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  heading: { color: colors.text, fontSize: 25, fontWeight: '700', marginBottom: 6 },
  reason: { color: colors.textMuted, fontSize: 14, marginBottom: spacing.md },
  features: { marginVertical: spacing.md, gap: 10 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText: { color: colors.text, fontSize: 14.5, flex: 1 },
  plan: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  planSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  planRadioWrap: { width: 24 },
  planTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  planName: { color: colors.text, fontSize: 16, fontWeight: '700' },
  planHint: { color: colors.textMuted, fontSize: 12.5, marginTop: 2 },
  planPrice: { color: colors.text, fontSize: 16, fontWeight: '700' },
  planCadence: { color: colors.textFaint, fontSize: 11.5 },
  badge: { backgroundColor: colors.primary, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { color: '#fff', fontSize: 9.5, fontWeight: '800', letterSpacing: 0.6 },
  notice: { color: colors.warn, fontSize: 12, textAlign: 'center', marginTop: spacing.sm },
  restore: { alignItems: 'center', paddingVertical: spacing.md },
  restoreText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  legal: { color: colors.textFaint, fontSize: 11, lineHeight: 16, textAlign: 'center' },
});
