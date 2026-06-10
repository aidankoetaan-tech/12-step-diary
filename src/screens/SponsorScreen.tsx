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
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import { getContacts, setContacts, newId } from '../storage';
import { SupportContact } from '../types';

const CRISIS_LINES = [
  {
    name: 'SAMHSA National Helpline',
    detail: 'Free, confidential, 24/7 treatment referral',
    action: 'tel:18006624357',
    label: '1-800-662-4357',
  },
  {
    name: '988 Suicide & Crisis Lifeline',
    detail: 'Call or text 988, any time',
    action: 'tel:988',
    label: 'Call 988',
  },
];

export default function SponsorScreen() {
  const insets = useSafeAreaInsets();
  const [contacts, setContactsState] = useState<SupportContact[]>([]);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('Sponsor');

  useFocusEffect(
    useCallback(() => {
      getContacts().then(setContactsState);
    }, []),
  );

  const addContact = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Missing info', 'Please enter both a name and a phone number.');
      return;
    }
    const next = [
      ...contacts,
      { id: newId(), name: name.trim(), phone: phone.trim(), relation: relation.trim() || 'Support' },
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: insets.top + spacing.lg, paddingBottom: spacing.xl }}
    >
      <Text style={styles.kicker}>SUPPORT CIRCLE</Text>
      <Text style={styles.title}>You’re not alone</Text>
      <Text style={styles.subtitle}>
        Recovery happens in connection. Keep the people who hold you up one tap away.
      </Text>

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
});
