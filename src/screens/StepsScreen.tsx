import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  TextInput,
  Animated,
  Easing,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import { TWELVE_STEPS, StepDefinition, getRandomStepPrompt } from '../content';
import { getStepsProgress, setStepsProgress, saveJournalEntry, newId } from '../storage';
import { StepsProgress, StepStatus, JournalEntry } from '../types';
import SpeechRecognition from 'expo-speech-recognition';

const STATUS_META: Record<StepStatus, { label: string; color: string; bg: string }> = {
  none: { label: 'Not started', color: colors.textFaint, bg: 'transparent' },
  working: { label: 'Working on it', color: colors.warning, bg: colors.warningSoft },
  done: { label: 'Complete', color: colors.success, bg: colors.successSoft },
};

// Emotional keywords for the rule-based reflection generator.
const EMOTION_KEYWORDS: { word: string; emotion: string }[] = [
  { word: 'grateful', emotion: 'gratitude' },
  { word: 'gratitude', emotion: 'gratitude' },
  { word: 'thankful', emotion: 'gratitude' },
  { word: 'afraid', emotion: 'fear' },
  { word: 'fear', emotion: 'fear' },
  { word: 'scared', emotion: 'fear' },
  { word: 'anxious', emotion: 'fear' },
  { word: 'anxiety', emotion: 'fear' },
  { word: 'angry', emotion: 'anger' },
  { word: 'anger', emotion: 'anger' },
  { word: 'resentful', emotion: 'resentment' },
  { word: 'resentment', emotion: 'resentment' },
  { word: 'bitter', emotion: 'resentment' },
  { word: 'sad', emotion: 'sadness' },
  { word: 'sadness', emotion: 'sadness' },
  { word: 'grief', emotion: 'sadness' },
  { word: 'loss', emotion: 'sadness' },
  { word: 'hopeful', emotion: 'hope' },
  { word: 'hope', emotion: 'hope' },
  { word: 'optimistic', emotion: 'hope' },
  { word: 'lonely', emotion: 'loneliness' },
  { word: 'alone', emotion: 'loneliness' },
  { word: 'ashamed', emotion: 'shame' },
  { word: 'shame', emotion: 'shame' },
  { word: 'guilty', emotion: 'guilt' },
  { word: 'guilt', emotion: 'guilt' },
  { word: 'relieved', emotion: 'relief' },
  { word: 'peace', emotion: 'peace' },
  { word: 'calm', emotion: 'peace' },
  { word: 'proud', emotion: 'pride' },
];

const STEP_QUESTIONS: Record<number, string> = {
  1: 'What does unmanageability look like for you today?',
  2: 'Where do you find hope, even briefly?',
  3: 'What would letting go look like in your life right now?',
  4: 'What pattern keeps showing up across your relationships?',
  5: 'What part of your story is hardest to share?',
  6: 'What would change look like for you?',
  7: 'What are you ready to release?',
  8: 'Who have you harmed, and what was your part?',
  9: 'What amends still need to be made?',
  10: 'What did you notice today that you might have missed before?',
  11: 'What brings you closest to stillness?',
  12: 'How are you carrying this message to others?',
};

function generateReflection(text: string, stepNumber: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const lower = text.toLowerCase();

  const found: string[] = [];
  for (const { word, emotion } of EMOTION_KEYWORDS) {
    if (lower.includes(word) && !found.includes(emotion)) {
      found.push(emotion);
    }
  }

  const emotionPart =
    found.length > 0
      ? `What stands out is ${found.slice(0, 3).join(', ')}.`
      : 'Take a moment to notice what you are really feeling.';

  const stepQuestion = STEP_QUESTIONS[stepNumber] ?? 'What else wants to be said?';

  return `I hear you. You wrote ${wordCount} word${wordCount === 1 ? '' : 's'} about Step ${stepNumber}. ${emotionPart} ${stepQuestion} Take your time with this.`;
}

export default function StepsScreen() {
  const insets = useSafeAreaInsets();
  const [progress, setProgress] = useState<StepsProgress>({});
  const [expanded, setExpanded] = useState<number | null>(null);
  const [promptByStep, setPromptByStep] = useState<Record<number, string>>({});

  // Voice + reflection state per expanded step.
  const [recordingStep, setRecordingStep] = useState<number | null>(null);
  const [voiceText, setVoiceText] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [savedEntryId, setSavedEntryId] = useState<string | null>(null);
  const [aiReflection, setAiReflection] = useState<string | null>(null);
  const [reflectingStep, setReflectingStep] = useState<number | null>(null);

  const recordDotAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      getStepsProgress().then(setProgress);
    }, []),
  );

  // Pulsing red dot when recording.
  useEffect(() => {
    if (recordingStep === null) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(recordDotAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(recordDotAnim, {
          toValue: 0.3,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [recordingStep, recordDotAnim]);

  const setStatus = async (step: number, status: StepStatus) => {
    const next = { ...progress, [step]: status };
    try {
      await setStepsProgress(next);
      setProgress(next);
    } catch {
      Alert.alert('Could not save', 'Your step progress could not be stored. Please try again.');
    }
  };

  const ensurePrompt = (stepNumber: number) => {
    setPromptByStep((prev) =>
      prev[stepNumber] ? prev : { ...prev, [stepNumber]: getRandomStepPrompt(stepNumber) },
    );
  };

  const cyclePrompt = (stepNumber: number) => {
    setPromptByStep((prev) => {
      const current = prev[stepNumber];
      let next = getRandomStepPrompt(stepNumber);
      if (current) {
        const step = TWELVE_STEPS.find((s) => s.number === stepNumber);
        if (step?.aiPrompts && step.aiPrompts.length > 1) {
          let tries = 0;
          while (next === current && tries < 5) {
            next = getRandomStepPrompt(stepNumber);
            tries++;
          }
        }
      }
      return { ...prev, [stepNumber]: next };
    });
  };

  const startRecording = (stepNumber: number) => {
    setVoiceError(null);
    setAiReflection(null);
    setSavedEntryId(null);
    try {
      if (typeof SpeechRecognition?.isAvailable === 'function' && !SpeechRecognition.isAvailable()) {
        setVoiceError('Voice input not available on this device.');
        return;
      }
      SpeechRecognition.startListening({ locale: 'en-US', interimResults: true });

      // Attach result listener (supports both API patterns).
      const handleResult = (event: { result?: { transcript?: string }; transcript?: string }) => {
        const transcript = event?.result?.transcript ?? event?.transcript ?? '';
        if (transcript) setVoiceText(transcript);
      };
      const handleError = () => {
        setVoiceError('Voice input not available on this device.');
        setRecordingStep(null);
      };
      const handleEnd = () => {
        setRecordingStep(null);
      };

      if (typeof SpeechRecognition.setRecognitionListener === 'function') {
        SpeechRecognition.setRecognitionListener(handleResult as never);
      } else if (typeof SpeechRecognition.addEventListener === 'function') {
        SpeechRecognition.addEventListener('result', handleResult as never);
        SpeechRecognition.addEventListener('error', handleError as never);
        SpeechRecognition.addEventListener('end', handleEnd as never);
      }
      setRecordingStep(stepNumber);
    } catch {
      setVoiceError('Voice input not available on this device.');
    }
  };

  const stopRecording = () => {
    try {
      SpeechRecognition.stopListening();
    } catch {
      // ignore
    }
    setRecordingStep(null);
  };

  const saveReflection = async (stepNumber: number) => {
    const trimmed = voiceText.trim();
    if (!trimmed) return;
    const prompt = promptByStep[stepNumber];
    const entry: JournalEntry = {
      id: newId(),
      createdAt: new Date().toISOString(),
      mood: '✍️',
      text: trimmed,
      prompt,
      stepNumber,
    };
    try {
      await saveJournalEntry(entry);
      setSavedEntryId(entry.id);
      setVoiceText('');
    } catch {
      Alert.alert('Could not save', 'Your reflection could not be stored. Please try again.');
    }
  };

  const handleReflect = (stepNumber: number) => {
    const text = voiceText.trim();
    if (!text) return;
    setReflectingStep(stepNumber);
    // Simulate brief on-device processing.
    setTimeout(() => {
      const reflection = generateReflection(text, stepNumber);
      setAiReflection(reflection);
      setReflectingStep(null);
      // Save reflection alongside the journal entry if we have one.
      if (savedEntryId) {
        void saveJournalEntry({
          id: savedEntryId,
          createdAt: new Date().toISOString(),
          mood: '✍️',
          text,
          prompt: promptByStep[stepNumber],
          stepNumber,
          aiReflection: reflection,
        });
      }
    }, 600);
  };

  const doneCount = TWELVE_STEPS.filter((s) => progress[s.number] === 'done').length;

  const renderStep = ({ item }: { item: StepDefinition }) => {
    const status = progress[item.number] ?? 'none';
    const meta = STATUS_META[status];
    const isOpen = expanded === item.number;
    const prompt = promptByStep[item.number];
    const isRecording = recordingStep === item.number;

    return (
      <Pressable
        style={styles.stepCard}
        onPress={() => {
          const nowOpen = !isOpen;
          setExpanded(isOpen ? null : item.number);
          if (nowOpen) {
            ensurePrompt(item.number);
          } else {
            setVoiceText('');
            setVoiceError(null);
            setSavedEntryId(null);
            setAiReflection(null);
          }
        }}
      >
        <View style={styles.stepHeader}>
          <View
            style={[
              styles.stepNumber,
              status === 'done' && { backgroundColor: colors.success },
              status === 'working' && { backgroundColor: colors.warning },
            ]}
          >
            {status === 'done' ? (
              <Ionicons name="checkmark" size={16} color={colors.background} />
            ) : (
              <Text
                style={[
                  styles.stepNumberText,
                  status === 'working' && { color: colors.background },
                ]}
              >
                {item.number}
              </Text>
            )}
          </View>
          <View style={styles.stepHeading}>
            <Text style={styles.stepTitle}>{item.title}</Text>
            <Text style={[styles.statusLabel, { color: meta.color }]}>{meta.label}</Text>
          </View>
          <Ionicons
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.textFaint}
          />
        </View>
        <Text style={styles.stepText} numberOfLines={isOpen ? undefined : 2}>
          {item.text}
        </Text>
        {isOpen && (
          <>
            {/* Reflection prompt */}
            {item.aiPrompts && item.aiPrompts.length > 0 && (
              <View style={styles.promptSection}>
                <Text style={styles.promptLabel}>REFLECTION PROMPT</Text>
                <Text style={styles.promptText}>{prompt}</Text>
                <Pressable style={styles.cycleButton} onPress={() => cyclePrompt(item.number)}>
                  <Ionicons name="refresh" size={14} color={colors.primary} />
                  <Text style={styles.cycleButtonText}>New prompt</Text>
                </Pressable>

                {/* Voice-to-text */}
                <View style={styles.voiceRow}>
                  <Pressable
                    style={[styles.micButton, isRecording && styles.micButtonActive]}
                    onPress={() => (isRecording ? stopRecording() : startRecording(item.number))}
                  >
                    <Ionicons
                      name={isRecording ? 'stop' : 'mic'}
                      size={18}
                      color={isRecording ? '#FFFFFF' : colors.primary}
                    />
                    <Text
                      style={[
                        styles.micButtonText,
                        isRecording && { color: '#FFFFFF' },
                      ]}
                    >
                      {isRecording ? 'Stop' : 'Speak'}
                    </Text>
                  </Pressable>
                  {isRecording && (
                    <Animated.View
                      style={[
                        styles.recordingDot,
                        { opacity: recordDotAnim },
                      ]}
                    />
                  )}
                </View>

                {voiceError && (
                  <Text style={styles.voiceError}>{voiceError}</Text>
                )}

                {(voiceText.length > 0 || isRecording) && (
                  <TextInput
                    style={styles.voiceInput}
                    multiline
                    value={voiceText}
                    onChangeText={setVoiceText}
                    placeholder="Your reflection will appear here…"
                    placeholderTextColor={colors.textFaint}
                    textAlignVertical="top"
                  />
                )}

                {voiceText.trim().length > 0 && (
                  <Pressable
                    style={[styles.saveReflectionButton, !voiceText.trim() && { opacity: 0.4 }]}
                    onPress={() => saveReflection(item.number)}
                    disabled={!voiceText.trim()}
                  >
                    <Ionicons name="book-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.saveReflectionButtonText}>Save as journal entry</Text>
                  </Pressable>
                )}

                {savedEntryId && voiceText.trim().length === 0 && (
                  <Text style={styles.savedHint}>✓ Saved to your journal</Text>
                )}

                {/* AI rule-based reflection */}
                {savedEntryId && (
                  <Pressable
                    style={styles.reflectButton}
                    onPress={() => handleReflect(item.number)}
                  >
                    <Ionicons name="bulb-outline" size={16} color={colors.warning} />
                    <Text style={styles.reflectButtonText}>Reflect</Text>
                  </Pressable>
                )}

                {reflectingStep === item.number && (
                  <Text style={styles.reflectingHint}>Reflecting…</Text>
                )}

                {aiReflection && (
                  <View style={styles.aiCard}>
                    <Text style={styles.aiLabel}>YOUR REFLECTION</Text>
                    <Text style={styles.aiText}>{aiReflection}</Text>
                  </View>
                )}
              </View>
            )}
            {/* Status cycling */}
            <View style={styles.statusRow}>
              {(['working', 'done', 'none'] as StepStatus[]).map((option) => (
                <Pressable
                  key={option}
                  style={[
                    styles.statusButton,
                    status === option && {
                      backgroundColor: STATUS_META[option].bg,
                      borderColor: STATUS_META[option].color,
                    },
                  ]}
                  onPress={() => setStatus(item.number, option)}
                >
                  <Text
                    style={[
                      styles.statusButtonText,
                      status === option && { color: STATUS_META[option].color },
                    ]}
                  >
                    {option === 'none' ? 'Reset' : STATUS_META[option].label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <Text style={styles.kicker}>THE PROGRAM</Text>
      <Text style={styles.title}>The 12 Steps</Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${(doneCount / 12) * 100}%` }]} />
      </View>
      <Text style={styles.progressLabel}>{doneCount} of 12 steps complete</Text>
      <FlatList
        data={TWELVE_STEPS}
        keyExtractor={(item) => String(item.number)}
        renderItem={renderStep}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
  },
  kicker: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
  },
  progressLabel: {
    color: colors.textDim,
    fontSize: 13,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  stepCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 14,
  },
  stepHeading: {
    flex: 1,
  },
  stepTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
  stepText: {
    color: colors.textDim,
    fontSize: 14,
    lineHeight: 21,
    marginTop: spacing.sm,
  },
  promptSection: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
  },
  promptLabel: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  promptText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  cycleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  cycleButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  voiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  micButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
  micButtonActive: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  micButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.danger,
  },
  voiceError: {
    color: colors.danger,
    fontSize: 12,
    marginTop: spacing.sm,
  },
  voiceInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    color: colors.text,
    padding: spacing.md,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 90,
    marginTop: spacing.sm,
    textAlignVertical: 'top',
  },
  saveReflectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 10,
    marginTop: spacing.sm,
  },
  saveReflectionButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  savedHint: {
    color: colors.success,
    fontSize: 13,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  reflectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.warning,
    marginTop: spacing.sm,
  },
  reflectButtonText: {
    color: colors.warning,
    fontWeight: '700',
    fontSize: 14,
  },
  reflectingHint: {
    color: colors.textDim,
    fontSize: 13,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  aiCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.warning,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  aiLabel: {
    color: colors.warning,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  aiText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  statusRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  statusButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },
  statusButtonText: {
    color: colors.textDim,
    fontSize: 13,
    fontWeight: '600',
  },
});