import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme';
import { useEntitlement } from '../context/EntitlementContext';
import { Paywall } from './Paywall';

// Wraps premium-only content. Free users see a locked card that opens the
// paywall; premium users see the children.
export function PremiumGate({
  title,
  description,
  reason,
  children,
}: {
  title: string;
  description: string;
  reason?: string;
  children: React.ReactNode;
}) {
  const { isPremium } = useEntitlement();
  const [paywallOpen, setPaywallOpen] = useState(false);

  if (isPremium) return <>{children}</>;

  return (
    <>
      <Pressable style={styles.lockCard} onPress={() => setPaywallOpen(true)}>
        <View style={styles.iconWrap}>
          <Ionicons name="lock-closed" size={22} color={colors.gold} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.desc}>{description}</Text>
        <View style={styles.cta}>
          <Text style={styles.ctaText}>Unlock with Premium</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.primary} />
        </View>
      </Pressable>
      <Paywall visible={paywallOpen} onClose={() => setPaywallOpen(false)} reason={reason} />
    </>
  );
}

// A small inline lock button (e.g. next to an action like Export).
export function PremiumLockButton({
  label,
  reason,
}: {
  label: string;
  reason?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable style={styles.inline} onPress={() => setOpen(true)}>
        <Ionicons name="lock-closed" size={15} color={colors.gold} />
        <Text style={styles.inlineText}>{label}</Text>
      </Pressable>
      <Paywall visible={open} onClose={() => setOpen(false)} reason={reason} />
    </>
  );
}

const styles = StyleSheet.create({
  lockCard: {
    backgroundColor: colors.card,
    borderColor: 'rgba(231,194,107,0.35)',
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(231,194,107,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: { color: colors.text, fontSize: 17, fontWeight: '700', marginBottom: 4 },
  desc: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
  cta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.md },
  ctaText: { color: colors.primary, fontSize: 14.5, fontWeight: '700' },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(231,194,107,0.4)',
    borderRadius: radius.sm,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  inlineText: { color: colors.gold, fontSize: 13.5, fontWeight: '600' },
});
