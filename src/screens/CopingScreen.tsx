import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Modal,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import { COPING_SKILLS, CopingSkill } from '../data/copingSkills';

// Map category to a theme-aligned accent color.
const CATEGORY_COLORS: Record<CopingSkill['category'], string> = {
  distraction: colors.primary,
  relaxation: colors.success,
  cognitive: colors.warning,
  physical: colors.danger,
  social: '#EC4899',
  spiritual: '#A78BFA',
};

const CATEGORY_LABELS: Record<CopingSkill['category'], string> = {
  distraction: 'Distraction',
  relaxation: 'Relaxation',
  cognitive: 'Cognitive',
  physical: 'Physical',
  social: 'Social',
  spiritual: 'Spiritual',
};

type TabKey = 'all' | CopingSkill['category'];

export default function CopingScreen() {
  const insets = useSafeAreaInsets();
  const [selectedSkill, setSelectedSkill] = useState<CopingSkill | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => {
        setTimerSeconds((s) => s + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerRunning]);

  const startTimer = () => {
    setTimerSeconds(0);
    setTimerRunning(true);
  };
  const stopTimer = () => setTimerRunning(false);
  const resetTimer = () => {
    setTimerRunning(false);
    setTimerSeconds(0);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const categories: TabKey[] = [
    'all',
    ...new Set(COPING_SKILLS.map((s) => s.category)),
  ];
  const filtered =
    activeTab === 'all' ? COPING_SKILLS : COPING_SKILLS.filter((s) => s.category === activeTab);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: spacing.md,
          paddingBottom: spacing.xl,
        }}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Coping Skills</Text>
            <Text style={styles.subtitle}>Tools for when it gets hard</Text>

            {/* Urge surfing timer */}
            <View style={styles.timerCard}>
              <View style={styles.timerHeader}>
                <Ionicons name="timer-outline" size={20} color={colors.success} />
                <Text style={styles.timerLabel}>URGE SURFING TIMER</Text>
              </View>
              <Text style={styles.timerDisplay}>{formatTime(timerSeconds)}</Text>
              <Text style={styles.timerHint}>
                {timerRunning
                  ? 'The urge will pass. Keep breathing.'
                  : 'Start the timer and ride the wave'}
              </Text>
              <View style={styles.timerButtons}>
                {!timerRunning ? (
                  <Pressable style={styles.timerStart} onPress={startTimer}>
                    <Ionicons name="play" size={16} color="#FFFFFF" />
                    <Text style={styles.timerButtonText}>Start</Text>
                  </Pressable>
                ) : (
                  <Pressable style={styles.timerStop} onPress={stopTimer}>
                    <Ionicons name="pause" size={16} color="#FFFFFF" />
                    <Text style={styles.timerButtonText}>Pause</Text>
                  </Pressable>
                )}
                {timerSeconds > 0 && (
                  <Pressable style={styles.timerReset} onPress={resetTimer}>
                    <Ionicons name="refresh" size={18} color={colors.textDim} />
                  </Pressable>
                )}
              </View>
            </View>

            {/* Category tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tabScroll}
              contentContainerStyle={{ gap: spacing.sm }}
            >
              {categories.map((cat) => (
                <Pressable
                  key={cat}
                  style={[styles.tab, activeTab === cat && styles.tabActive]}
                  onPress={() => setActiveTab(cat)}
                >
                  <Text style={[styles.tabText, activeTab === cat && styles.tabTextActive]}>
                    {cat === 'all' ? 'All' : CATEGORY_LABELS[cat]}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </>
        }
        renderItem={({ item }) => (
          <Pressable style={styles.skillCard} onPress={() => setSelectedSkill(item)}>
            <View style={[styles.skillBar, { backgroundColor: CATEGORY_COLORS[item.category] }]} />
            <View style={styles.skillContent}>
              <View style={styles.skillHeader}>
                <Text style={styles.skillTitle}>{item.title}</Text>
                <View
                  style={[
                    styles.durationBadge,
                    { backgroundColor: `${CATEGORY_COLORS[item.category]}20` },
                  ]}
                >
                  <Ionicons
                    name="time-outline"
                    size={12}
                    color={CATEGORY_COLORS[item.category]}
                  />
                  <Text
                    style={[styles.durationText, { color: CATEGORY_COLORS[item.category] }]}
                  >
                    {item.duration}
                  </Text>
                </View>
              </View>
              <Text style={styles.skillDesc}>{item.description}</Text>
            </View>
          </Pressable>
        )}
      />

      {/* Skill detail modal */}
      <Modal visible={!!selectedSkill} transparent animationType="slide">
        {selectedSkill && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View
                style={[
                  styles.modalBar,
                  { backgroundColor: CATEGORY_COLORS[selectedSkill.category] },
                ]}
              />
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedSkill.title}</Text>
                <Pressable hitSlop={12} onPress={() => setSelectedSkill(null)}>
                  <Ionicons name="close" size={24} color={colors.textDim} />
                </Pressable>
              </View>
              <Text style={styles.modalDesc}>{selectedSkill.description}</Text>

              <Text style={styles.stepsLabel}>STEPS</Text>
              {selectedSkill.steps.map((step, i) => (
                <View key={i} style={styles.stepRow}>
                  <View style={styles.stepNum}>
                    <Text style={styles.stepNumText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}

              <Pressable
                style={styles.startButton}
                onPress={() => {
                  setSelectedSkill(null);
                  startTimer();
                }}
              >
                <Ionicons name="timer-outline" size={18} color="#FFFFFF" />
                <Text style={styles.startText}>Start Urge Surfing Timer</Text>
              </Pressable>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    marginTop: spacing.md,
  },
  subtitle: {
    color: colors.textDim,
    fontSize: 14,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  timerCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.successSoft,
  },
  timerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  timerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.success,
    letterSpacing: 2,
  },
  timerDisplay: {
    fontSize: 48,
    fontWeight: '300',
    color: colors.text,
    fontVariant: ['tabular-nums'],
    marginBottom: spacing.xs,
  },
  timerHint: {
    fontSize: 13,
    color: colors.textDim,
    marginBottom: spacing.md,
  },
  timerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  timerStart: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.success,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
  },
  timerStop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.warning,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
  },
  timerButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  timerReset: {
    padding: 10,
  },
  tabScroll: {
    marginBottom: spacing.md,
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textDim,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  skillCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  skillBar: {
    width: 4,
  },
  skillContent: {
    flex: 1,
    padding: spacing.md,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  skillTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  durationText: {
    fontSize: 11,
    fontWeight: '600',
  },
  skillDesc: {
    fontSize: 13,
    color: colors.textDim,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    maxHeight: '85%',
  },
  modalBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  modalDesc: {
    fontSize: 15,
    color: colors.textDim,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  stepsLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.success,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  startText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});