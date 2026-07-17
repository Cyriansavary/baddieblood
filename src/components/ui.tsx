import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { InfoAccent } from '../features/cycleTracker/types';
import { useAppStyles, useColors } from '../styles/useAppStyles';

export const SectionTitle = memo(function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const styles = useAppStyles();
  return (
    <View style={styles.sectionTitleWrap}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
    </View>
  );
});

export const MetricPill = memo(function MetricPill({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const styles = useAppStyles();
  return (
    <View style={styles.metricPill}>
      <Text style={styles.metricPillLabel}>{label}</Text>
      <Text style={styles.metricPillValue}>{value}</Text>
    </View>
  );
});

export const TabButton = memo(function TabButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const styles = useAppStyles();
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.tabButton, selected && styles.tabButtonSelected]}
    >
      <Text style={[styles.tabButtonText, selected && styles.tabButtonTextSelected]}>{label}</Text>
    </Pressable>
  );
});

export const InfoCard = memo(function InfoCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: InfoAccent;
}) {
  const styles = useAppStyles();
  const c = useColors();
  const accentStyles = {
    rose: { backgroundColor: c.accentRoseBg, accentColor: c.accentRoseFg },
    sand: { backgroundColor: c.accentSandBg, accentColor: c.accentSandFg },
    gold: { backgroundColor: c.accentGoldBg, accentColor: c.accentGoldFg },
    blue: { backgroundColor: c.accentBlueBg, accentColor: c.accentBlueFg },
  }[accent];

  return (
    <View style={[styles.infoCard, { backgroundColor: accentStyles.backgroundColor }]}>
      <Text style={[styles.infoCardLabel, { color: accentStyles.accentColor }]}>{label}</Text>
      <Text style={styles.infoCardValue}>{value}</Text>
    </View>
  );
});

export const LegendItem = memo(function LegendItem({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  const styles = useAppStyles();
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
});

export const DetailMetric = memo(function DetailMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const styles = useAppStyles();
  return (
    <View style={styles.detailMetric}>
      <Text style={styles.detailMetricLabel}>{label}</Text>
      <Text style={styles.detailMetricValue}>{value}</Text>
    </View>
  );
});

export const EditorLabel = memo(function EditorLabel({ label }: { label: string }) {
  const styles = useAppStyles();
  return <Text style={styles.editorLabel}>{label}</Text>;
});

export const SelectChip = memo(function SelectChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const styles = useAppStyles();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.selectChip, selected && styles.selectChipSelected]}
    >
      <Text style={[styles.selectChipText, selected && styles.selectChipTextSelected]}>{label}</Text>
    </Pressable>
  );
});

export const StatsRow = memo(function StatsRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const styles = useAppStyles();
  return (
    <View style={styles.statsRow}>
      <Text style={styles.statsLabel}>{label}</Text>
      <Text style={styles.statsValue}>{value}</Text>
    </View>
  );
});
