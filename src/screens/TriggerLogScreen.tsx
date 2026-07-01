import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Modal,
  TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import { TRIGGER_CATEGORIES, TriggerCategory } from '../data/triggers';
import { getTriggerLogs, addTriggerLog, newId } from '../storage';
import { TriggerLog } from '../types';

export default function TriggerLogScreen() {
  const insets = useSafeAreaInsets();
  const [logs, setLogs] = useState<TriggerLog[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<TriggerCategory | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [note, setNote] = useState('');
  const [didUse, setDidUse] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getTriggerLogs().then(setLogs);
    }, []),
  );

  const openLogModal = (category: TriggerCategory) => {
    setSelectedCategory(category);
    setIntensity(5);
    setNote('');
    setDidUse(false);
    setModalVisible(true);
  };

  const handleLog = async () => {
    if (!selectedCategory) return;
    const newLog: TriggerLog = {
      id: newId(),
      categoryId: selectedCategory.id,
      intensity,
      note: note.trim(),
      timestamp: new Date().toISOString(),
      didUse,
    };
    setLogs((prev) => [newLog, ...prev]);
    try {
      await addTriggerLog(newLog);
    } catch {
      // ignore — optimistic update already shown
    }
    setModalVisible(false);
  };

  const getCategoryById = (id: string) => TRIGGER_CATEGORIES.find((c) => c.id === id);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: spacing.md,
          paddingBottom: spacing.xl,
        }}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Trigger Log</Text>
            <Text style={styles.subtitle}>
              What triggered you? Log it to understand your patterns.
            </Text>

            <View style={styles.grid}>
              {TRIGGER_CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.id}
                  style={styles.triggerButton}
                  onPress={() => openLogModal(cat)}
                >
                  <Ionicons
                    name={cat.icon as keyof typeof Ionicons.glyphMap}
                    size={22}
                    color={colors.primary}
                  />
                  <Text style={styles.triggerLabel}>{cat.label}</Text>
                </Pressable>
              ))}
            </View>

            {logs.length > 0 && (
              <Text style={styles.historyTitle}>RECENT LOGS</Text>
            )}
          </>
        }
        renderItem={({ item }) => {
          const cat = getCategoryById(item.categoryId);
          return (
            <View style={styles.logCard}>
              <View style={styles.logHeader}>
                <Ionicons
                  name={(cat?.icon ?? 'ellipsis') as keyof typeof Ionicons.glyphMap}
                  size={18}
                  color={colors.primary}
                />
                <Text style={styles.logCategory}>{cat?.label ?? item.categoryId}</Text>
                <View style={styles.intensityBadge}>
                  <Text style={styles.intensityText}>{item.intensity}/10</Text>
                </View>
                {item.didUse && (
                  <View style={styles.usedBadge}>
                    <Text style={styles.usedText}>used</Text>
                  </View>
                )}
              </View>
              {item.note ? <Text style={styles.logNote}>{item.note}</Text> : null}
              <Text style={styles.logTime}>
                {new Date(item.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={
          logs.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="analytics-outline" size={48} color={colors.textFaint} />
              <Text style={styles.emptyText}>No triggers logged yet</Text>
              <Text style={styles.emptySub}>Tap a category above to log one</Text>
            </View>
          ) : null
        }
      />

      {/* Log modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log: {selectedCategory?.label}</Text>
              <Pressable hitSlop={12} onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textDim} />
              </Pressable>
            </View>

            <Text style={styles.modalDesc}>{selectedCategory?.description}</Text>

            <Text style={styles.fieldLabel}>Intensity (1-10)</Text>
            <View style={styles.intensityRow}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <Pressable
                  key={n}
                  style={[styles.intDot, intensity >= n && styles.intDotActive]}
                  onPress={() => setIntensity(n)}
                >
                  <Text
                    style={[styles.intDotText, intensity >= n && styles.intDotTextActive]}
                  >
                    {n}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Notes (optional)</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="What happened? What were you thinking?"
              placeholderTextColor={colors.textFaint}
              value={note}
              onChangeText={setNote}
              multiline
              textAlignVertical="top"
            />

            <Pressable
              style={[styles.useToggle, didUse && styles.useToggleActive]}
              onPress={() => setDidUse(!didUse)}
            >
              <Ionicons
                name={didUse ? 'warning' : 'shield-checkmark-outline'}
                size={18}
                color={didUse ? '#FFFFFF' : colors.success}
              />
              <Text style={[styles.useToggleText, didUse && styles.useToggleTextActive]}>
                {didUse ? 'I used' : 'I did NOT use'}
              </Text>
            </Pressable>

            <Pressable style={styles.saveButton} onPress={handleLog}>
              <Text style={styles.saveText}>Save Entry</Text>
            </Pressable>
          </View>
        </View>
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
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  triggerButton: {
    width: '31%',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  triggerLabel: {
    fontSize: 11,
    color: colors.textDim,
    textAlign: 'center',
    fontWeight: '500',
  },
  historyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textFaint,
    marginBottom: spacing.sm,
    letterSpacing: 1,
  },
  logCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logCategory: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  intensityBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  intensityText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  usedBadge: {
    backgroundColor: colors.danger,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  usedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  logNote: {
    fontSize: 14,
    color: colors.textDim,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  logTime: {
    fontSize: 11,
    color: colors.textFaint,
    marginTop: spacing.xs,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textDim,
    marginTop: spacing.md,
  },
  emptySub: {
    fontSize: 13,
    color: colors.textFaint,
    marginTop: spacing.xs,
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  modalDesc: {
    fontSize: 14,
    color: colors.textDim,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  intensityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  intDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  intDotActive: {
    backgroundColor: colors.primary,
  },
  intDotText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textDim,
  },
  intDotTextActive: {
    color: '#FFFFFF',
  },
  noteInput: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 15,
    color: colors.text,
    minHeight: 80,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  useToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  useToggleActive: {
    borderColor: colors.danger,
    backgroundColor: colors.warningSoft,
  },
  useToggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.success,
  },
  useToggleTextActive: {
    color: colors.danger,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});