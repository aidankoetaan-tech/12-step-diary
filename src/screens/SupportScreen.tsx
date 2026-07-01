import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Linking,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import {
  getContacts,
  setContacts,
  newId,
  getSobrietyDate,
  getSettings,
  saveSettings,
  exportAllData,
} from '../storage';
import { daysSinceStoredIsoDate } from '../date';
import { AppSettings, SupportContact } from '../types';

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

const DEFAULT_SETTINGS: AppSettings = {
  darkMode: true,
  notificationsEnabled: true,
  checkInReminderTime: '09:00',
};

export default function SupportScreen() {
  const insets = useSafeAreaInsets();
  const [contacts, setContactsState] = useState<SupportContact[]>([]);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('Sponsor');
  const [sobrietyDate, setSobrietyDate] = useState<string | null>(null);
  const [settings, setLocalSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useFocusEffect(
    useCallback(() => {
      getContacts().then(setContactsState);
      getSobrietyDate().then(setSobrietyDate);
      getSettings().then(setLocalSettings);
    }, []),
  );

  const addContact = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Missing info', 'Please enter both a name and a phone number.');
      return;
    }
    const next = [
      ...contacts,
      {
        id: newId(),
        name: name.trim(),
        phone: phone.trim(),
        relation: relation.trim() || 'Support',
      },
    ];
    try {
      await setContacts(next);
      setContactsState(next);
    } catch {
      Alert.alert('Could not save', 'This contact could not be stored. Please try again.');
      return;
    }
    setName('');
    setPhone('');
    setRelation('Sponsor');
    setAdding(false);
  };

  const removeContact = (contact: SupportContact) => {
    Alert.alert('Remove contact?', `Remove ${contact.name} from your support circle?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          const next = contacts.filter((c) => c.id !== contact.id);
          try {
            await setContacts(next);
            setContactsState(next);
          } catch {
            Alert.alert('Could not remove', 'This contact could not be removed. Please try again.');
          }
        },
      },
    ]);
  };

  const open = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Unavailable', 'Calling is not available on this device.');
    });
  };

  const toggleNotifications = async () => {
    const updated = { ...settings, notificationsEnabled: !settings.notificationsEnabled };
    setLocalSettings(updated);
    try {
      await saveSettings(updated);
    } catch {
      Alert.alert('Could not save', 'Settings could not be stored. Please try again.');
    }
  };

  const handleExport = async () => {
    let data: string;
    try {
      data = await exportAllData();
    } catch {
      Alert.alert('Export failed', 'Could not read your data. Please try again.');
      return;
    }
    try {
      await Share.share({
        message: data,
        title: '12-Step Diary — Data Export',
      });
    } catch {
      Alert.alert('Export', 'Data could not be shared. Please try again.');
    }
  };

  const days = daysSinceStoredIsoDate(sobrietyDate);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: insets.top + spacing.lg,
        paddingBottom: spacing.xl,
      }}
    >
      <Text style={styles.kicker}>SUPPORT CIRCLE</Text>
      <Text style={styles.title}>You’re not alone</Text>
      <Text style={styles.subtitle}>
        Recovery happens in connection. Keep the people who hold you up one tap away.
      </Text>

      {/* My people */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>MY PEOPLE</Text>
        <Pressable hitSlop={8} onPress={() => setAdding(!adding)}>
          <Ionicons name={adding ? 'close' : 'add-circle'} size={22} color={colors.primary} />
        </Pressable>
      </View>

      {adding && (
        <View style={styles.card}>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Name"
            placeholderTextColor={colors.textFaint}
          />
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Phone number"
            placeholderTextColor={colors.textFaint}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            value={relation}
            onChangeText={setRelation}
            placeholder="Role (Sponsor, friend, family…)"
            placeholderTextColor={colors.textFaint}
          />
          <Pressable style={styles.primaryButton} onPress={addContact}>
            <Text style={styles.primaryButtonText}>Add to circle</Text>
          </Pressable>
        </View>
      )}

      {contacts.length === 0 && !adding && (
        <View style={styles.card}>
          <Text style={styles.emptyText}>
            Add your sponsor or a trusted friend so reaching out takes one tap, not willpower.
          </Text>
        </View>
      )}

      {contacts.map((contact) => (
        <View key={contact.id} style={styles.card}>
          <View style={styles.contactRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{contact.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactRelation}>{contact.relation}</Text>
            </View>
            <Pressable style={styles.iconButton} onPress={() => open(`sms:${contact.phone}`)}>
              <Ionicons name="chatbubble" size={18} color={colors.primary} />
            </Pressable>
            <Pressable style={styles.iconButton} onPress={() => open(`tel:${contact.phone}`)}>
              <Ionicons name="call" size={18} color={colors.primary} />
            </Pressable>
            <Pressable hitSlop={8} onPress={() => removeContact(contact)}>
              <Ionicons name="trash-outline" size={16} color={colors.textFaint} />
            </Pressable>
          </View>
        </View>
      ))}

      {/* Crisis lines */}
      <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>NEED HELP RIGHT NOW?</Text>
      {CRISIS_LINES.map((line) => (
        <View key={line.name} style={[styles.card, styles.crisisCard]}>
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{line.name}</Text>
            <Text style={styles.contactRelation}>{line.detail}</Text>
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

      {/* Settings */}
      <Text style={[styles.sectionLabel, { marginTop: spacing.xl }]}>SETTINGS</Text>

      {/* Sobriety date */}
      <View style={styles.card}>
        <Text style={styles.settingsLabel}>Sobriety Date</Text>
        {sobrietyDate ? (
          <View style={styles.dateDisplay}>
            <Ionicons name="calendar" size={20} color={colors.success} />
            <Text style={styles.dateText}>
              {new Date(sobrietyDate).toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            <Text style={styles.daysCount}>{days ?? 0} days</Text>
          </View>
        ) : (
          <Text style={styles.hint}>Set your sobriety date on the Home tab to track your progress.</Text>
        )}
      </View>

      {/* Notifications */}
      <View style={styles.card}>
        <Text style={styles.settingsLabel}>Daily Check-in Reminder</Text>
        <Pressable style={styles.toggleRow} onPress={toggleNotifications}>
          <View style={styles.toggleLeft}>
            <Ionicons name="notifications-outline" size={22} color={colors.primary} />
            <Text style={styles.toggleLabel}>Enable reminder</Text>
          </View>
          <View style={[styles.toggle, settings.notificationsEnabled && styles.toggleOn]}>
            <View style={[styles.toggleDot, settings.notificationsEnabled && styles.toggleDotOn]} />
          </View>
        </Pressable>
        {settings.notificationsEnabled && (
          <Text style={styles.hint}>Reminder time: {settings.checkInReminderTime}</Text>
        )}
      </View>

      {/* Export */}
      <View style={styles.card}>
        <Text style={styles.settingsLabel}>Data</Text>
        <Pressable style={styles.exportButton} onPress={handleExport}>
          <Ionicons name="download-outline" size={20} color={colors.primary} />
          <Text style={styles.exportText}>Export All Data</Text>
        </Pressable>
        <Text style={styles.exportHint}>
          Export includes your prevention plan, check-in history, trigger logs, and sobriety data.
          Share with your therapist or keep as backup.
        </Text>
      </View>

      {/* About */}
      <View style={styles.card}>
        <Text style={styles.settingsLabel}>About</Text>
        <Text style={styles.aboutText}>
          12-Step Diary{'\n'}
          Sobriety counter · 12 steps · Daily check-in · Coping tools · Journal{'\n'}
          Your data stays on your device{Platform.OS === 'web' ? '.' : ', encrypted.'}
        </Text>
      </View>
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
  subtitle: {
    color: colors.textDim,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    color: colors.textFaint,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: spacing.sm,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 11,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  emptyText: {
    color: colors.textDim,
    fontSize: 14,
    lineHeight: 21,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  contactRelation: {
    color: colors.textDim,
    fontSize: 13,
    marginTop: 1,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crisisCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
  // Settings
  settingsLabel: {
    color: colors.textDim,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  dateText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  daysCount: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.success,
  },
  hint: {
    fontSize: 13,
    color: colors.textDim,
    marginTop: spacing.xs,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  toggleLabel: {
    fontSize: 15,
    color: colors.text,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleOn: {
    backgroundColor: colors.success,
  },
  toggleDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.textDim,
  },
  toggleDotOn: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-end',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  exportText: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '500',
  },
  exportHint: {
    fontSize: 12,
    color: colors.textFaint,
    lineHeight: 18,
  },
  aboutText: {
    fontSize: 13,
    color: colors.textDim,
    lineHeight: 22,
  },
});