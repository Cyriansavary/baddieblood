import { Pressable, Text, View } from 'react-native';

import { DetailMetric, InfoCard, SectionTitle } from '../../../components/ui';
import { useAppStyles, useColors } from '../../../styles/useAppStyles';
import { PregnancyStage } from '../pregnancy';

type PregnancyTabProps = {
  stage: PregnancyStage;
  dueDateLabel: string;
  weeksRemainingLabel: string;
  onOpenDayEntry: () => void;
  onOpenAppointments: () => void;
};

export function PregnancyTab({
  stage,
  dueDateLabel,
  weeksRemainingLabel,
  onOpenDayEntry,
  onOpenAppointments,
}: PregnancyTabProps) {
  const styles = useAppStyles();
  const c = useColors();
  const weekHint =
    weeksRemainingLabel === 'À renseigner'
      ? 'Renseigne la date prévue dans le profil pour afficher le suivi.'
      : weeksRemainingLabel === 'Terme proche'
        ? 'Le terme approche. Garde un œil sur les rendez-vous et les repères du jour.'
        : `Encore ${weeksRemainingLabel} avant le terme.`;

  return (
    <>
      <View style={styles.section}>
        <SectionTitle
          title="Tableau de bord"
          subtitle="Les repères essentiels de ta grossesse, visibles en un seul endroit."
        />
        <View style={styles.grid}>
          <InfoCard label="Semaine actuelle" value={`S${stage.week} / 40`} accent="rose" />
          <InfoCard label="Trimestre" value={`${stage.trimester}e`} accent="gold" />
          <InfoCard label="Date prévue" value={dueDateLabel} accent="blue" />
          <InfoCard label="Semaines restantes" value={weeksRemainingLabel} accent="sand" />
        </View>
      </View>

      <View style={styles.section}>
        <SectionTitle
          title="Stade actuel"
          subtitle="Repère de taille et stade de développement pour cette semaine."
        />
        <View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <View style={styles.detailHeaderText}>
              <Text style={styles.detailTitle}>
                {stage.fruitEmoji} {stage.title}
              </Text>
              <Text style={styles.detailSubtitle}>{stage.detail}</Text>
            </View>
            <View style={[styles.phaseBadge, { backgroundColor: c.phaseOvulBg }]}>
              <Text style={[styles.phaseBadgeText, { color: c.phaseOvulFg }]}>
                {stage.trimester}e trimestre
              </Text>
            </View>
          </View>

          <View style={styles.detailBadgeRow}>
            <View style={styles.detailBadge}>
              <Text style={styles.detailBadgeText}>Mode grossesse</Text>
            </View>
            <View style={[styles.detailBadge, styles.detailBadgeSoft]}>
              <Text style={styles.detailBadgeText}>Semaine {stage.week}</Text>
            </View>
          </View>

          <View style={styles.detailMetrics}>
            <DetailMetric label="Fruit repère" value={stage.fruitLabel} />
            <DetailMetric label="Taille approx." value={stage.sizeLabel} />
          </View>

          <View style={styles.actionsRow}>
            <Pressable style={styles.primaryAction} onPress={onOpenDayEntry}>
              <Text style={styles.primaryActionText}>Noter la journée</Text>
            </Pressable>
            <Pressable style={styles.secondaryAction} onPress={onOpenAppointments}>
              <Text style={styles.secondaryActionText}>Voir RDV</Text>
            </Pressable>
          </View>
          <Text style={styles.calendarHintText}>{weekHint}</Text>
        </View>
      </View>
    </>
  );
}
