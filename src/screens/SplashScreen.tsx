import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';

interface SplashScreenProps {
  onDone: () => void;
}

// 12 dots in a ring — like the app icon.
const DOT_COUNT = 12;
const RING_RADIUS = 46;
const DOT_SIZE = 10;

export default function SplashScreen({ onDone }: SplashScreenProps) {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.55,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    const timer = setTimeout(() => {
      onDone();
    }, 3000);

    return () => clearTimeout(timer);
  }, [fadeAnim, onDone]);

  // Pre-compute dot positions around the ring.
  const dots = Array.from({ length: DOT_COUNT }, (_, i) => {
    const angle = (i / DOT_COUNT) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angle) * RING_RADIUS;
    const y = Math.sin(angle) * RING_RADIUS;
    return { x, y, key: i };
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.center}>
        <Animated.View style={[styles.logoWrap, { opacity: fadeAnim }]}>
          <View style={styles.ring}>
            {dots.map((dot) => (
              <View
                key={dot.key}
                style={[
                  styles.dot,
                  {
                    transform: [
                      { translateX: dot.x },
                      { translateY: dot.y },
                    ],
                  },
                ]}
              />
            ))}
            <View style={styles.innerDot} />
          </View>
        </Animated.View>

        <Text style={styles.appName}>Sober Steps</Text>
        <Text style={styles.subtitle}>One day at a time</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoWrap: {
    marginBottom: spacing.lg,
  },
  ring: {
    width: RING_RADIUS * 2 + DOT_SIZE,
    height: RING_RADIUS * 2 + DOT_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: colors.primary,
  },
  innerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primarySoft,
  },
  appName: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: colors.textDim,
    fontSize: 16,
    marginTop: spacing.xs,
  },
});