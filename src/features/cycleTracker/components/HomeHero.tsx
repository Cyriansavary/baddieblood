import { Text, View } from 'react-native';

import { MetricPill } from '../../../components/ui';
import { useAppStyles } from '../../../styles/useAppStyles';

type HomeHeroProps = {
  subtitle: string;
  primaryLabel: string;
  primaryValue: string;
  secondaryLabel: string;
  secondaryValue: string;
  summaryLeftLabel: string;
  summaryLeftValue: string;
  summaryLeftHint: string;
  summaryRightLabel: string;
  summaryRightValue: string;
  summaryRightHint: string;
};

export function HomeHero({
  subtitle,
  primaryLabel,
  primaryValue,
  secondaryLabel,
  secondaryValue,
  summaryLeftLabel,
  summaryLeftValue,
  summaryLeftHint,
  summaryRightLabel,
  summaryRightValue,
  summaryRightHint,
}: HomeHeroProps) {
  const styles = useAppStyles();
  return (
    <View style={styles.hero}>
      <View style={styles.heroGlowPrimary} />
      <View style={styles.heroGlowSecondary} />
      <View style={styles.sparkleLarge} />
      <View style={styles.sparkleMedium} />
      <View style={styles.sparkleTiny} />
      <Text style={styles.heroKicker}>Ton suivi, en un coup d&apos;oeil</Text>
      <Text style={styles.heroSubtitle}>{subtitle}</Text>

      <View style={styles.heroStatsRow}>
        <MetricPill label={primaryLabel} value={primaryValue} />
        <MetricPill label={secondaryLabel} value={secondaryValue} />
      </View>

      <View style={styles.heroSummary}>
        <View style={styles.heroSummaryCard}>
          <Text style={styles.heroSummaryLabel}>{summaryLeftLabel}</Text>
          <Text style={styles.heroSummaryValue}>{summaryLeftValue}</Text>
          <Text style={styles.heroSummaryHint}>{summaryLeftHint}</Text>
        </View>
        <View style={styles.heroSummaryCard}>
          <Text style={styles.heroSummaryLabel}>{summaryRightLabel}</Text>
          <Text style={styles.heroSummaryValue}>{summaryRightValue}</Text>
          <Text style={styles.heroSummaryHint}>{summaryRightHint}</Text>
        </View>
      </View>
    </View>
  );
}
