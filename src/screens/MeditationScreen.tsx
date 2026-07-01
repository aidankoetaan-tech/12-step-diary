import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';

type Phase = 'in' | 'hold' | 'out';

const DURATIONS = [
  { label: '3 min', seconds: 180 },
  { label: '5 min', seconds: 300 },
  { label: '10 min', seconds: 600 },
];

const SERENITY_PRAYER = `God, grant me the serenity
to accept the things I cannot change,
the courage to change the things I can,
and the wisdom to know the difference.`;

const PHASE_TEXT: Record<Phase, string> = {
  in: 'Breathe in…',
  hold: 'Hold…',
  out: 'Breathe out…',
};

export default function MeditationScreen() {
  const insets = useSafeAreaInsets();
  const [duration, setDuration] = useState(300);
  const [remaining, setRemaining] = useState(300);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [phase, setPhase] = useState<Phase>('in');

  const breathAnim = useRef(new Animated.Value(0.3)).current;
  const phaseRef = useRef<Phase>('in');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown timer.
  useEffect(() => {
    if (!running) return;
    timerRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false);
          setFinished(true);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running]);

  // Breathing animation cycle: 4s in, 4s hold, 4s out.
  useEffect(() => {
    if (!running) return;

    let cancelled = false;

    const runCycle = () => {
      if (cancelled) return;
      phaseRef.current = 'in';
      setPhase('in');
      Animated.timing(breathAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }).start(() => {
        if (cancelled) return;
        phaseRef.current = 'hold';
        setPhase('hold');
        Animated.timing(breathAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.linear,
          useNativeDriver: false,
        }).start(() => {
          if (cancelled) return;
          phaseRef.current = 'out';
          setPhase('out');
          Animated.timing(breathAnim, {
            toValue: 0.3,
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }).start(() => {
            if (cancelled) return;
            runCycle();
          });
        });
      });
    };

    runCycle();

    return () => {
      cancelled = true;
    };
  }, [running, breathAnim]);

  const handleStart = () => {
    setFinished(false);
    setRemaining(duration);
    setRunning(true);
  };

  const handleStop = () => {
    setRunning(false);
    setRemaining(duration);
    setFinished(false);
  };

  const handleClose = () => {
    setRunning(false);
    setFinished(false);
    setRemaining(duration);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const circleSize = breathAnim.interpolate({
    inputRange: [0.3, 1],
    outputRange: [120, 240],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerRow}>
        <Pressable hitSlop={12} onPress={handleStop}>
          <Ionicons name="arrow-back" size={24} color={colors.textDim} />
        </Pressable>
        <Text style={styles.title}>Morning Meditation</Text>
        <View style={{ width: 24 }} />
      </View>

      {!running && !finished && (
        <ScrollView
          contentContainerStyle={styles.setupContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.introCard}>
            <Ionicons name="sunny-outline" size={36} color={colors.warning} />
            <Text style={styles.introTitle}>Guided Breathing</Text>
            <Text style={styles.introBody}>
              Follow the circle. Breathe in for 4 seconds, hold for 4, breathe out
              for 4. A calm start to your day.
            </Text>
          </View>

          <Text style={styles.sectionLabel}>CHOOSE DURATION</Text>
          <View style={styles.durationRow}>
            {DURATIONS.map((d) => (
              <Pressable
                key={d.label}
                style={[
                  styles.durationButton,
                  duration === d.seconds && styles.durationButtonActive,
                ]}
                onPress={() => {
                  setDuration(d.seconds);
                  setRemaining(d.seconds);
                }}
              >
                <Text
                  style={[
                    styles.durationText,
                    duration === d.seconds && { color: colors.text },
                  ]}
                >
                  {d.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable style={styles.startButton} onPress={handleStart}>
            <Ionicons name="play" size={18} color="#FFFFFF" />
            <Text style={styles.startButtonText}>Begin Meditation</Text>
          </Pressable>
        </ScrollView>
      )}

      {running && (
        <View style={styles.breathContainer}>
          <Text style={styles.timerText}>{formatTime(remaining)}</Text>
          <View style={styles.breathCircleWrap}>
            <Animated.View
              style={[
                styles.breathCircle,
                {
                  width: circleSize,
                  height: circleSize,
                  borderRadius: 120,
                },
              ]}
            />
          </View>
          <Text style={styles.phaseText}>{PHASE_TEXT[phase]}</Text>
          <Pressable style={styles.stopButton} onPress={handleStop}>
            <Text style={styles.stopButtonText}>End session</Text>
          </Pressable>
        </View>
      )}

      {finished && (
        <View style={styles.finishedContainer}>
          <Ionicons name="checkmark-circle" size={56} color={colors.success} />
          <Text style={styles.finishedTitle}>Session complete</Text>
          <View style={styles.prayerCard}>
            <Text style={styles.prayerLabel}>SERENITY PRAYER</Text>
            <Text style={styles.prayerText}>{SERENITY_PRAYER}</Text>
          </View>
          <Pressable style={styles.startButton} onPress={handleStart}>
            <Ionicons name="refresh" size={18} color="#FFFFFF" />
            <Text style={styles.startButtonText}>Meditate again</Text>
          </Pressable>
          <Pressable style={styles.doneButton} onPress={handleClose}>
            <Text style={styles.doneButtonText}>Done</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B26',
    paddingHorizontal: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  setupContent: {
    paddingBottom: spacing.xl,
    paddingTop: spacing.lg,
  },
  introCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  introTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  introBody: {
    color: colors.textDim,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  sectionLabel: {
    color: colors.textFaint,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  durationRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  durationButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  durationButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  durationText: {
    color: colors.textDim,
    fontSize: 14,
    fontWeight: '600',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  breathContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  timerText: {
    color: colors.textDim,
    fontSize: 36,
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
  },
  breathCircleWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 280,
  },
  breathCircle: {
    backgroundColor: colors.primary,
    opacity: 0.35,
  },
  phaseText: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '600',
  },
  stopButton: {
    paddingVertical: 10,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stopButtonText: {
    color: colors.textDim,
    fontSize: 14,
    fontWeight: '600',
  },
  finishedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  finishedTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  prayerCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  prayerLabel: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
  prayerText: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  doneButton: {
    paddingVertical: 10,
    paddingHorizontal: spacing.xl,
  },
  doneButtonText: {
    color: colors.textDim,
    fontSize: 15,
    fontWeight: '600',
  },
});