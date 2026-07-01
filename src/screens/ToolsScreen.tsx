import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import { ToolsStackParamList } from '../types';

type Nav = NativeStackNavigationProp<ToolsStackParamList>;

const TOOLS = [
  {
    route: 'Coping' as const,
    icon: 'shield-checkmark-outline',
    title: 'Coping Skills',
    body: 'Urge surfing timer + 14 techniques for when it gets hard',
    accent: colors.primary,
  },
  {
    route: 'Triggers' as const,
    icon: 'analytics-outline',
    title: 'Trigger Log',
    body: 'Track what triggered you, intensity, and whether you used',
    accent: colors.primary,
  },
  {
    route: 'Plan' as const,
    icon: 'document-text-outline',
    title: 'Prevention Plan',
    body: 'Your personal relapse prevention blueprint — 9 sections',
    accent: colors.primary,
  },
  {
    route: 'Meditation' as const,
    icon: 'sunny-outline',
    title: 'Morning Meditation',
    body: 'Guided breathing exercise to start your day calm',
    accent: colors.warning,
  },
  {
    route: 'Emergency' as const,
    icon: 'alert-circle-outline',
    title: 'Emergency Support',
    body: 'Crisis lines, SOS button, and quick links to help',
    accent: colors.danger,
  },
];

export default function ToolsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <Text style={styles.kicker}>TOOLKIT</Text>
      <Text style={styles.title}>Tools</Text>
      <Text style={styles.subtitle}>
        Practical, evidence-based tools for the moments that matter.
      </Text>

      <View style={styles.list}>
        {TOOLS.map((tool) => (
          <Pressable
            key={tool.route}
            style={styles.card}
            onPress={() => navigation.navigate(tool.route)}
          >
            <View
              style={[
                styles.iconWrap,
                tool.accent !== colors.primary && { backgroundColor: `${tool.accent}20` },
              ]}
            >
              <Ionicons name={tool.icon as keyof typeof Ionicons.glyphMap} size={24} color={tool.accent} />
            </View>
            <View style={styles.cardText}>
              <Text
                style={[
                  styles.cardTitle,
                  tool.accent !== colors.primary && { color: tool.accent },
                ]}
              >
                {tool.title}
              </Text>
              <Text style={styles.cardBody}>{tool.body}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
          </Pressable>
        ))}
      </View>
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
  subtitle: {
    color: colors.textDim,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  list: {
    gap: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  cardBody: {
    color: colors.textDim,
    fontSize: 13,
    lineHeight: 18,
  },
});