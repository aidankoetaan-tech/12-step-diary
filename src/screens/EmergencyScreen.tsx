import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import { ToolsStackParamList } from '../types';
import { getContacts } from '../storage';
import { SupportContact } from '../types';

type Nav = NativeStackNavigationProp<ToolsStackParamList>;

const CRISIS_LINES = [
  {
    name: 'SAMHSA National Helpline',
    detail: 'Free, confidential, 24/7 treatment referral (US)',
    action: 'tel:18006624357',
    label: '1-800-662-4357',
  },
  {
    name: '988 Suicide & Crisis Lifeline',
    detail: 'Call or text 988, any time (US)',
    action: 'tel:988',
    label: 'Call 988',
  },
  {
    name: 'SADAG',
    detail: 'South African Depression & Anxiety Group (SA)',
    action: 'tel:0112344837',
    label: '011 234 4837',
  },
  {
    name: 'SANCA',
    detail: 'South African National Council on Alcoholism (SA)',
    action: 'tel:0800121212',
    label: '0800 121 212',
  },
  {
    name: 'Lifeline South Africa',
    detail: '24/7 crisis counselling (SA)',
    action: 'tel:0861322322',
    label: '0861 322 322',
  },
];

export default function EmergencyScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [showLines, setShowLines] = useState(false);
  const [contacts, setContacts] = useState<SupportContact[]>([]);
  const sosAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getContacts().then(setContacts);
  }, []);

  // Pulsing SOS button.
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(sosAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(sosAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [sosAnim]);

  const open = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Unavailable', 'Calling is not available on this device.');
    });
  };

  const sponsor = contacts.find((c) =>
    c.relation.toLowerCase().includes('sponsor'),
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: insets.top + spacing.lg,
        paddingBottom: spacing.xl,
      }}
    >
      <Text style={styles.kicker}>EMERGENCY SUPPORT</Text>
      <Text style={styles.title}>I'm struggling right now</Text>
      <Text style={styles.subtitle}>
        You're not alone in this moment. Reach out — help is one tap away.
      </Text>

      {/* SOS button */}
      <View style={styles.sosWrap}>
        <Animated.View
          style={[
            styles.sosRing,
            {
              opacity: sosAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.6, 0],
              }),
              transform: [
                {
                  scale: sosAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.6],
                  }),
                },
              ],
            },
          ]}
        />
        <Pressable
          style={styles.sosButton}
          onPress={() => setShowLines(true)}
        >
          <Text style={styles.sosText}>SOS</Text>
        </Pressable>
      </View>
      <Text style={styles.sosHint}>
        {showLines ? 'Crisis lines below' : 'Tap for crisis lines'}
      </Text>

      {/* Quick links */}
      <Text style={[styles.sectionLabel, { marginTop: spacing.xl }]}>
        QUICK HELP
      </Text>

      <Pressable
        style={styles.quickCard}
        onPress={() => navigation.navigate('Coping')}
      >
        <View style={styles.quickIconWrap}>
          <Ionicons name="shield-checkmark-outline" size={22} color={colors.primary} />
        </View>
        <View style={styles.quickText}>
          <Text style={styles.quickTitle}>Coping Skills</Text>
          <Text style={styles.quickBody}>Urge surfing + 14 techniques</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
      </Pressable>

      {sponsor && (
        <Pressable
          style={styles.quickCard}
          onPress={() => open(`tel:${sponsor.phone}`)}
        >
          <View style={styles.quickIconWrap}>
            <Ionicons name="call-outline" size={22} color={colors.success} />
          </View>
          <View style={styles.quickText}>
            <Text style={styles.quickTitle}>Call your sponsor</Text>
            <Text style={styles.quickBody}>
              {sponsor.name} · {sponsor.phone}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
        </Pressable>
      )}

      {/* Crisis lines */}
      {showLines && (
        <>
          <Text style={[styles.sectionLabel, { marginTop: spacing.xl }]}>
            CRISIS LINES
          </Text>
          {CRISIS_LINES.map((line) => (
            <View key={line.name} style={styles.crisisCard}>
              <View style={styles.crisisInfo}>
                <Text style={styles.crisisName}>{line.name}</Text>
                <Text style={styles.crisisDetail}>{line.detail}</Text>
              </View>
              <Pressable style={styles.crisisButton} onPress={() => open(line.action)}>
                <Ionicons name="call" size={14} color="#FFFFFF" />
                <Text style={styles.crisisButtonText}>{line.label}</Text>
              </Pressable>
            </View>
          ))}
          <Text style={styles.disclaimer}>
            If you are in immediate danger, call your local emergency number.
          </Text>
        </>
      )}
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
    color: colors.danger,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  subtitle: {
    color: colors.textDim,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  sosWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  sosRing: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.danger,
  },
  sosButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  sosText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 2,
  },
  sosHint: {
    color: colors.textDim,
    fontSize: 14,
    textAlign: 'center',
  },
  sectionLabel: {
    color: colors.textFaint,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  quickCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  quickIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickText: {
    flex: 1,
    gap: 2,
  },
  quickTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  quickBody: {
    color: colors.textDim,
    fontSize: 13,
  },
  crisisCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  crisisInfo: {
    flex: 1,
  },
  crisisName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  crisisDetail: {
    color: colors.textDim,
    fontSize: 13,
    marginTop: 1,
  },
  crisisButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  crisisButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  disclaimer: {
    color: colors.textFaint,
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});