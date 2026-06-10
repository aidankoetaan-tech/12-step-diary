import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import { JOURNAL_PROMPTS } from '../content';
import { deleteJournalEntry, getJournalEntries, newId, saveJournalEntry } from '../storage';
import { JournalEntry } from '../types';

const MOODS = ['😞', '😕', '😐', '🙂', '😄'];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function JournalScreen() {
  const insets = useSafeAreaInsets();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [composing, setComposing] = useState(false);
  const [text, setText] = useState('');
  const [mood, setMood] = useState('🙂');
  const [prompt, setPrompt] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      getJournalEntries().then(setEntries);
    }, []),
  );

  const save = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const entry: JournalEntry = {
      id: newId(),
      createdAt: new Date().toISOString(),
      mood,
      text: trimmed,
      prompt: prompt ?? undefined,
    };
    try {
      await saveJournalEntry(entry);
    } catch {
      Alert.alert('Could not save', 'This entry could not be stored. Try a shorter entry.');
      return;
    }
    setEntries(await getJournalEntries());
    setText('');
    setPrompt(null);
    setMood('🙂');
    setComposing(false);
  };

  const confirmDelete = (entry: JournalEntry) => {
    Alert.alert('Delete entry?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteJournalEntry(entry.id);
          setEntries(await getJournalEntries());
        },
      },
    ]);
  };

  const renderEntry = ({ item }: { item: JournalEntry }) => (
    <View style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <Text style={styles.entryMood}>{item.mood}</Text>
        <Text style={styles.entryDate}>{formatDate(item.createdAt)}</Text>
        <Pressable hitSlop={12} onPress={() => confirmDelete(item)}>
          <Ionicons name="trash-outline" size={16} color={colors.textFaint} />
        </Pressable>
      </View>
      {item.prompt && <Text style={styles.entryPrompt}>{item.prompt}</Text>}
      <Text style={styles.entryText}>{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top + spacing.lg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.titleRow}>
        <View>
          <Text style={styles.kicker}>PRIVATE & ENCRYPTED</Text>
          <Text style={styles.title}>Journal</Text>
        </View>
        <Pressable style={styles.newButton} onPress={() => setComposing(!composing)}>
          <Ionicons name={composing ? 'close' : 'add'} size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      {composing && (
        <View style={styles.composer}>
          <FlatList
            horizontal
            data={JOURNAL_PROMPTS}
            keyExtractor={(p) => p}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing.sm }}
            renderItem={({ item }) => (
              <Pressable
                style={[styles.promptChip, prompt === item && styles.promptChipActive]}
                onPress={() => setPrompt(prompt === item ? null : item)}
              >
                <Text
                  style={[styles.promptChipText, prompt === item && { color: colors.text }]}
                  numberOfLines={1}
                >
                  {item}
                </Text>
              </Pressable>
            )}
          />
          <View style={styles.moodRow}>
            {MOODS.map((m) => (
              <Pressable
                key={m}
                style={[styles.moodButton, mood === m && styles.moodButtonActive]}
                onPress={() => setMood(m)}
              >
                <Text style={styles.moodEmoji}>{m}</Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            style={styles.input}
            multiline
            value={text}
            onChangeText={setText}
            placeholder={prompt ?? 'How are you, honestly?'}
            placeholderTextColor={colors.textFaint}
          />
          <Pressable
            style={[styles.saveButton, !text.trim() && { opacity: 0.4 }]}
            onPress={save}
            disabled={!text.trim()}
          >
            <Text style={styles.saveButtonText}>Save entry</Text>
          </Pressable>
        </View>
      )}

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={renderEntry}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          composing ? null : (
            <View style={styles.empty}>
              <Ionicons name="book-outline" size={36} color={colors.textFaint} />
              <Text style={styles.emptyTitle}>No entries yet</Text>
              <Text style={styles.emptyBody}>
                Your journal stays on this device, encrypted. Tap + to write your first entry.
              </Text>
            </View>
          )
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
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
  newButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  composer: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  promptChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    maxWidth: 240,
  },
  promptChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  promptChipText: {
    color: colors.textDim,
    fontSize: 13,
  },
  moodRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  moodButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  moodButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  moodEmoji: {
    fontSize: 20,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    color: colors.text,
    padding: spacing.md,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 110,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  entryCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  entryMood: {
    fontSize: 18,
  },
  entryDate: {
    flex: 1,
    color: colors.textDim,
    fontSize: 13,
    fontWeight: '600',
  },
  entryPrompt: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  entryText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  empty: {
    alignItems: 'center',
    marginTop: spacing.xl * 2,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  emptyBody: {
    color: colors.textDim,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
