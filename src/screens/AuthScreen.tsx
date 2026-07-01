import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

const DEMO_PIN = '1234';
const REMEMBER_KEY = 'auth.remembered';

// Web fallback — SecureStore is not available on web.
async function getRemembered(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return globalThis.localStorage?.getItem(REMEMBER_KEY) === 'true';
  }
  const val = await SecureStore.getItemAsync(REMEMBER_KEY);
  return val === 'true';
}

async function setRemembered(value: boolean): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(REMEMBER_KEY, String(value));
    return;
  }
  await SecureStore.setItemAsync(REMEMBER_KEY, String(value));
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<'fingerprint' | 'pin'>('fingerprint');
  const [pin, setPin] = useState('');
  const [remember, setRemember] = useState(false);
  const [fpScanning, setFpScanning] = useState(false);
  const [fpSuccess, setFpSuccess] = useState(false);

  // Animations
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const ring3 = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const recordDot = useRef(new Animated.Value(0)).current;

  // On mount, check if remembered → auto-success.
  useEffect(() => {
    let cancelled = false;
    getRemembered().then((isRemembered) => {
      if (isRemembered && !cancelled) {
        onAuthSuccess();
      }
    });
    return () => {
      cancelled = true;
    };
  }, [onAuthSuccess]);

  // Pulsing rings for fingerprint.
  useEffect(() => {
    if (mode !== 'fingerprint') return;
    const makeLoop = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, {
            toValue: 1,
            duration: 2200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      );
    const l1 = makeLoop(ring1, 0);
    const l2 = makeLoop(ring2, 700);
    const l3 = makeLoop(ring3, 1400);
    l1.start();
    l2.start();
    l3.start();
    return () => {
      l1.stop();
      l2.stop();
      l3.stop();
    };
  }, [mode, ring1, ring2, ring3]);

  // Pulsing dot animation (reused for recording states).
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(recordDot, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(recordDot, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [recordDot]);

  const handleFingerprintScan = () => {
    if (fpScanning || fpSuccess) return;
    setFpScanning(true);
    // Simulate scan delay then success.
    setTimeout(() => {
      setFpScanning(false);
      setFpSuccess(true);
      setTimeout(() => {
        if (remember) void setRemembered(true);
        onAuthSuccess();
      }, 1000);
    }, 1200);
  };

  const handlePinKey = (key: string) => {
    if (pin.length >= 4) return;
    const next = pin + key;
    setPin(next);
    if (next.length === 4) {
      if (next === DEMO_PIN) {
        if (remember) void setRemembered(true);
        setTimeout(onAuthSuccess, 200);
      } else {
        // Wrong PIN — shake.
        setPin('');
        Animated.sequence([
          Animated.timing(shakeAnim, {
            toValue: -12,
            duration: 60,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(shakeAnim, {
            toValue: 12,
            duration: 80,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(shakeAnim, {
            toValue: -8,
            duration: 80,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(shakeAnim, {
            toValue: 0,
            duration: 60,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ]).start();
        Alert.alert('Incorrect PIN', 'Try again. Demo PIN is 1234.');
      }
    }
  };

  const handlePinDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const ringStyle = (val: Animated.Value, baseSize: number) => ({
    width: baseSize,
    height: baseSize,
    borderRadius: baseSize / 2,
    borderWidth: 2,
    borderColor: colors.primary,
    position: 'absolute' as const,
    opacity: val.interpolate({
      inputRange: [0, 1],
      outputRange: [0.7, 0],
    }),
    transform: [
      {
        scale: val.interpolate({
          inputRange: [0, 1],
          outputRange: [0.6, 1.5],
        }),
      },
    ],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.xl }]}>
      <View style={styles.header}>
        <Text style={styles.kicker}>SOBER STEPS</Text>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Choose how to unlock your private journal.</Text>
      </View>

      {/* Mode toggle */}
      <View style={styles.modeRow}>
        <Pressable
          style={[styles.modeButton, mode === 'fingerprint' && styles.modeButtonActive]}
          onPress={() => setMode('fingerprint')}
        >
          <Ionicons
            name="finger-print"
            size={18}
            color={mode === 'fingerprint' ? colors.text : colors.textDim}
          />
          <Text
            style={[
              styles.modeText,
              mode === 'fingerprint' && { color: colors.text },
            ]}
          >
            Fingerprint
          </Text>
        </Pressable>
        <Pressable
          style={[styles.modeButton, mode === 'pin' && styles.modeButtonActive]}
          onPress={() => setMode('pin')}
        >
          <Ionicons
            name="keypad-outline"
            size={18}
            color={mode === 'pin' ? colors.text : colors.textDim}
          />
          <Text style={[styles.modeText, mode === 'pin' && { color: colors.text }]}>
            PIN
          </Text>
        </Pressable>
      </View>

      {mode === 'fingerprint' ? (
        <View style={styles.fingerprintWrap}>
          <Pressable style={styles.fingerprintButton} onPress={handleFingerprintScan}>
            <View style={styles.ringsContainer}>
              <Animated.View style={ringStyle(ring1, 130)} />
              <Animated.View style={ringStyle(ring2, 130)} />
              <Animated.View style={ringStyle(ring3, 130)} />
            </View>
            {fpSuccess ? (
              <View style={styles.fpIconCircle}>
                <Ionicons name="checkmark-circle" size={64} color={colors.success} />
              </View>
            ) : (
              <View
                style={[
                  styles.fpIconCircle,
                  fpScanning && { backgroundColor: colors.primarySoft },
                ]}
              >
                <Ionicons
                  name="finger-print"
                  size={64}
                  color={fpScanning ? colors.primary : colors.textDim}
                />
              </View>
            )}
          </Pressable>
          <Text style={styles.fpHint}>
            {fpSuccess
              ? 'Unlocked'
              : fpScanning
                ? 'Scanning…'
                : 'Tap to scan your fingerprint'}
          </Text>
        </View>
      ) : (
        <Animated.View style={[styles.pinWrap, { transform: [{ translateX: shakeAnim }] }]}>
          {/* PIN dots */}
          <View style={styles.pinDots}>
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={[
                  styles.pinDot,
                  pin.length > i && styles.pinDotFilled,
                ]}
              />
            ))}
          </View>
          <Text style={styles.pinHint}>Enter your 4-digit PIN (demo: 1234)</Text>

          {/* Keypad */}
          <View style={styles.keypad}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((k) => (
              <Pressable
                key={k}
                style={styles.key}
                onPress={() => handlePinKey(k)}
              >
                <Text style={styles.keyText}>{k}</Text>
              </Pressable>
            ))}
            <View style={styles.keyPlaceholder} />
            <Pressable style={styles.key} onPress={() => handlePinKey('0')}>
              <Text style={styles.keyText}>0</Text>
            </Pressable>
            <Pressable style={styles.key} onPress={handlePinDelete}>
              <Ionicons name="backspace-outline" size={22} color={colors.textDim} />
            </Pressable>
          </View>
        </Animated.View>
      )}

      {/* Remember me */}
      <View style={styles.rememberRow}>
        <Pressable
          style={styles.toggleSwitch}
          onPress={() => setRemember(!remember)}
        >
          <View style={[styles.toggleTrack, remember && styles.toggleTrackOn]}>
            <View style={[styles.toggleThumb, remember && styles.toggleThumbOn]} />
          </View>
        </Pressable>
        <Text style={styles.rememberText}>Remember me</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  kicker: {
    color: colors.primary,
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
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  modeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  modeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  modeText: {
    color: colors.textDim,
    fontSize: 14,
    fontWeight: '600',
  },
  fingerprintWrap: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  fingerprintButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 140,
    height: 140,
  },
  ringsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fpIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  fpHint: {
    color: colors.textDim,
    fontSize: 14,
    marginTop: spacing.lg,
  },
  pinWrap: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  pinDots: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.textFaint,
  },
  pinDotFilled: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pinHint: {
    color: colors.textDim,
    fontSize: 13,
    marginBottom: spacing.lg,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    maxWidth: 260,
  },
  key: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '500',
  },
  keyPlaceholder: {
    width: 72,
    height: 72,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 'auto',
    marginBottom: spacing.xl,
    alignSelf: 'center',
  },
  toggleSwitch: {
    padding: spacing.xs,
  },
  toggleTrack: {
    width: 46,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.border,
    padding: 2,
    justifyContent: 'center',
  },
  toggleTrackOn: {
    backgroundColor: colors.primary,
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.textDim,
    alignSelf: 'flex-start',
  },
  toggleThumbOn: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-end',
  },
  rememberText: {
    color: colors.textDim,
    fontSize: 14,
  },
});