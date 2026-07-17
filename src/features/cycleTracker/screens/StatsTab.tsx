import { Text, View } from 'react-native';

import { DetailMetric, InfoCard, SectionTitle, StatsRow } from '../../../components/ui';
import { CycleProfile, CycleRecord } from '../../../data/cycleData';
import { formatDateLong } from '../../../lib/cycle';
import {
  DominantSymptomItem,
  FlowAnomalyItem,
  FlowDistributionItem,
  MonthComparisonStats,
  MonthlyHistoryItem,
  PainTrendPoint,
} from '../../../lib/insights';
import { useAppStyles, useColors } from '../../../styles/useAppStyles';
import { AppColors } from '../../../styles/colors';
import { CyclePhaseView } from '../types';
import { PregnancyStage } from '../pregnancy';

function anomalyToneMap(c: AppColors): Record<FlowAnomalyItem['level'], { background: string; accent: string; label: string }> {
  return {
    alert: { background: c.accentRoseBg, accent: c.primaryMid, label: 'A surveiller' },
    watch: { background: c.accentGoldBg, accent: c.accentGoldFg, label: 'Inhabituel' },
    info: { background: c.accentBlueBg, accent: c.accentBlueFg, label: 'Tendance' },
  };
}

type StatsTabProps = {
  isPregnancyMode: boolean;
  pregnancyStage: PregnancyStage;
  pregnancyDueDateLabel: string;
  trackedDays: number;
  periodDays: number;
  avgSleep: string;
  avgPain: string;
  estimatedProfile: CycleProfile;
  displayedPeriodLength: number;
  hasCycleReference: boolean;
  todayCyclePhase: CyclePhaseView;
  dominantSymptoms: DominantSymptomItem[];
  flowDistribution: FlowDistributionItem[];
  flowAnomalies: FlowAnomalyItem[];
  monthComparison: MonthComparisonStats | null;
  painTrend: PainTrendPoint[];
  monthlyHistory: MonthlyHistoryItem[];
  recentRecords: CycleRecord[];
};

export function StatsTab({
  isPregnancyMode,
  pregnancyStage,
  pregnancyDueDateLabel,
  trackedDays,
  periodDays,
  avgSleep,
  avgPain,
  estimatedProfile,
  displayedPeriodLength,
  hasCycleReference,
  todayCyclePhase,
  dominantSymptoms,
  flowDistribution,
  flowAnomalies,
  monthComparison,
  painTrend,
  monthlyHistory,
  recentRecords,
}: StatsTabProps) {
  const styles = useAppStyles();
  const c = useColors();
  const toneMap = anomalyToneMap(c);
  const totalFlowEntries = flowDistribution.reduce((sum, item) => sum + item.count, 0) || 1;

  if (isPregnancyMode) {
    return (
      <>
        <View style={styles.section}>
          <SectionTitle
            title="Tableau de bord"
            subtitle="Les repères chiffrés de ta grossesse pour cette semaine."
          />
          <View style={styles.grid}>
            <InfoCard label="Semaine actuelle" value={`S${pregnancyStage.week} / 40`} accent="rose" />
            <InfoCard label="Trimestre" value={`${pregnancyStage.trimester}e`} accent="gold" />
            <InfoCard label="Date prévue" value={pregnancyDueDateLabel} accent="blue" />
            <InfoCard label="Stade" value={pregnancyStage.title} accent="sand" />
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle
            title="Stade actuel"
            subtitle="Repère de taille et description du développement pour cette semaine."
          />
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <View style={styles.detailHeaderText}>
                <Text style={styles.detailTitle}>
                  {pregnancyStage.fruitEmoji} {pregnancyStage.title}
                </Text>
                <Text style={styles.detailSubtitle}>{pregnancyStage.detail}</Text>
              </View>
              <View style={[styles.phaseBadge, { backgroundColor: c.phaseOvulBg }]}>
                <Text style={[styles.phaseBadgeText, { color: c.phaseOvulFg }]}>
                  {pregnancyStage.trimester}e trimestre
                </Text>
              </View>
            </View>
            <View style={styles.detailMetrics}>
              <DetailMetric label="Fruit repère" value={pregnancyStage.fruitLabel} />
              <DetailMetric label="Taille approx." value={pregnancyStage.sizeLabel} />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle
            title="Journal récent"
            subtitle="Les dernières entrées enregistrées pendant la grossesse."
          />
          <View style={styles.timelineList}>
            {recentRecords.length ? (
              recentRecords.map((record) => (
                <View key={record.date} style={styles.timelineItem}>
                  <View style={styles.timelineDate}>
                    <Text style={styles.timelineDateText}>{formatDateLong(record.date)}</Text>
                  </View>
                  <View style={styles.timelineBody}>
                    <Text style={styles.timelineTitle}>
                      Bien-être {record.pain}/10 · {record.mood || 'Humeur non renseignée'}
                    </Text>
                    <Text style={styles.timelineText}>{record.notes || 'Aucune note'}</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.timelineItem}>
                <Text style={styles.emptyText}>
                  Aucun journal pour le moment. Note tes journées depuis l&apos;onglet Grossesse.
                </Text>
              </View>
            )}
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <View style={styles.section}>
        <SectionTitle
          title="Statistiques"
          subtitle="Une lecture plus visuelle de ton rythme, de la douleur et des flux enregistrés."
        />
        <View style={styles.grid}>
          <InfoCard label="Jours suivis" value={`${trackedDays}`} accent="rose" />
          <InfoCard label="Jours de règles" value={`${periodDays}`} accent="sand" />
          <InfoCard label="Sommeil moyen" value={`${avgSleep} h`} accent="blue" />
          <InfoCard label="Douleur moyenne" value={`${avgPain}/10`} accent="gold" />
        </View>
      </View>

      <View style={styles.section}>
        <SectionTitle
          title="Vue rapide"
          subtitle="Un résumé utile de l’état actuel de ton suivi."
        />
        <View style={styles.statsCard}>
          <StatsRow label="Cycle configuré" value={`${estimatedProfile.cycleLength} jours`} />
          <StatsRow label="Durée moyenne" value={`${displayedPeriodLength} jours`} />
          <StatsRow
            label="Dernière période"
            value={hasCycleReference ? formatDateLong(estimatedProfile.lastPeriodStart) : 'À renseigner'}
          />
          <StatsRow
            label="Phase actuelle"
            value={hasCycleReference ? todayCyclePhase.label : 'À renseigner'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <SectionTitle
          title="Flux inhabituel"
          subtitle="Un bloc simple pour repérer les journées qui sortent de ton rythme habituel."
        />
        <View style={styles.anomalyCard}>
          {flowAnomalies.length ? (
            flowAnomalies.map((anomaly) => {
              const tone = toneMap[anomaly.level];

              return (
                <View key={anomaly.key} style={styles.anomalyItem}>
                  <View style={[styles.anomalyBadge, { backgroundColor: tone.background }]}>
                    <Text style={[styles.anomalyBadgeText, { color: tone.accent }]}>{tone.label}</Text>
                  </View>
                  <Text style={styles.anomalyTitle}>{anomaly.title}</Text>
                  <Text style={styles.anomalyDetail}>{anomaly.detail}</Text>
                  {anomaly.date && (
                    <Text style={styles.anomalyMeta}>{`Date repère : ${formatDateLong(anomaly.date)}`}</Text>
                  )}
                </View>
              );
            })
          ) : (
            <View style={styles.anomalyEmptyState}>
              <Text style={styles.anomalyEmptyTitle}>Aucun signal inhabituel pour le moment</Text>
              <Text style={styles.anomalyEmptyText}>
                Dès qu’une journée s’écarte fortement du rythme habituel, elle apparaîtra ici pour faciliter le suivi.
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <SectionTitle
          title="Mois par mois"
          subtitle="Compare le dernier mois observé avec le précédent pour repérer les changements rapides."
        />
        <View style={styles.comparisonCard}>
          {monthComparison ? (
            <>
              <View style={styles.comparisonHeader}>
                <View style={styles.comparisonMonth}>
                  <Text style={styles.comparisonMonthLabel}>Mois récent</Text>
                  <Text style={styles.comparisonMonthValue}>{monthComparison.current.label}</Text>
                </View>
                <View style={styles.comparisonMonth}>
                  <Text style={styles.comparisonMonthLabel}>Mois précédent</Text>
                  <Text style={styles.comparisonMonthValue}>{monthComparison.previous.label}</Text>
                </View>
              </View>

              <View style={styles.comparisonGrid}>
                <View style={styles.comparisonMetric}>
                  <Text style={styles.comparisonMetricLabel}>Jours suivis</Text>
                  <Text style={styles.comparisonMetricValue}>
                    {monthComparison.current.trackedDays}
                    <Text style={styles.comparisonMetricDelta}>
                      {monthComparison.deltas.trackedDays >= 0
                        ? ` +${monthComparison.deltas.trackedDays}`
                        : ` ${monthComparison.deltas.trackedDays}`}
                    </Text>
                  </Text>
                </View>
                <View style={styles.comparisonMetric}>
                  <Text style={styles.comparisonMetricLabel}>Jours de règles</Text>
                  <Text style={styles.comparisonMetricValue}>
                    {monthComparison.current.periodDays}
                    <Text style={styles.comparisonMetricDelta}>
                      {monthComparison.deltas.periodDays >= 0
                        ? ` +${monthComparison.deltas.periodDays}`
                        : ` ${monthComparison.deltas.periodDays}`}
                    </Text>
                  </Text>
                </View>
                <View style={styles.comparisonMetric}>
                  <Text style={styles.comparisonMetricLabel}>Douleur moyenne</Text>
                  <Text style={styles.comparisonMetricValue}>
                    {monthComparison.current.averagePain}/10
                    <Text style={styles.comparisonMetricDelta}>
                      {monthComparison.deltas.averagePain >= 0
                        ? ` +${monthComparison.deltas.averagePain.toFixed(1)}`
                        : ` ${monthComparison.deltas.averagePain.toFixed(1)}`}
                    </Text>
                  </Text>
                </View>
                <View style={styles.comparisonMetric}>
                  <Text style={styles.comparisonMetricLabel}>Sommeil moyen</Text>
                  <Text style={styles.comparisonMetricValue}>
                    {monthComparison.current.averageSleep} h
                    <Text style={styles.comparisonMetricDelta}>
                      {monthComparison.deltas.averageSleep >= 0
                        ? ` +${monthComparison.deltas.averageSleep.toFixed(1)}`
                        : ` ${monthComparison.deltas.averageSleep.toFixed(1)}`}
                    </Text>
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <Text style={styles.emptyText}>
              Ajoute au moins deux mois de données pour afficher une comparaison.
            </Text>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <SectionTitle
          title="Évolution récente"
          subtitle="Les derniers jours suivis, avec douleur et intensité de flux."
        />
        <View style={styles.chartCard}>
          {painTrend.length ? (
            <>
              <View style={styles.trendChartRow}>
                {painTrend.map((point) => (
                  <View key={point.date} style={styles.trendColumn}>
                    <View style={styles.trendColumnTrack}>
                      <View
                        style={[
                          styles.trendPainBar,
                          {
                            height: `${Math.max(point.pain, 0.8) * 10}%`,
                            backgroundColor:
                              point.flowLevel === 'Abondant'
                                ? c.actionBg
                                : point.flowLevel === 'Moyen'
                                  ? c.primaryMid
                                  : point.flowLevel === 'Léger'
                                    ? c.accentRoseFg
                                    : c.accentRoseBg,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.trendValueLabel}>{point.pain}/10</Text>
                    <Text style={styles.trendDateLabel}>{point.label}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.chartFootnote}>
                Les colonnes plus hautes indiquent une douleur plus forte. La couleur reprend l’intensité du flux.
              </Text>
            </>
          ) : (
            <Text style={styles.emptyText}>
              Pas assez de journées enregistrées pour afficher une tendance récente.
            </Text>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <SectionTitle
          title="Répartition des flux"
          subtitle="Une vue simple pour voir si ton suivi penche vers des flux légers, moyens ou abondants."
        />
        <View style={styles.chartCard}>
          <View style={styles.flowDistributionBar}>
            {flowDistribution.map((item) => (
              <View
                key={item.label}
                style={[
                  styles.flowDistributionSegment,
                  {
                    width: `${(item.count / totalFlowEntries) * 100}%`,
                    backgroundColor: item.color,
                  },
                ]}
              />
            ))}
          </View>
          <View style={styles.flowDistributionLegend}>
            {flowDistribution.map((item) => (
              <View key={item.label} style={styles.flowLegendRow}>
                <View style={[styles.flowLegendDot, { backgroundColor: item.color }]} />
                <Text style={styles.flowLegendText}>
                  {item.label} : {item.count} jour{item.count > 1 ? 's' : ''}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <SectionTitle
          title="Historique mensuel"
          subtitle="Les derniers mois observés pour voir comment ton suivi évolue dans le temps."
        />
        <View style={styles.statsCard}>
          {monthlyHistory.length ? (
            monthlyHistory.map((item) => (
              <View key={item.key} style={styles.monthHistoryItem}>
                <View style={styles.monthHistoryHeader}>
                  <Text style={styles.monthHistoryTitle}>{item.label}</Text>
                  <Text style={styles.monthHistoryBadge}>{item.trackedDays} jours suivis</Text>
                </View>
                <View style={styles.monthHistoryMetrics}>
                  <Text style={styles.monthHistoryText}>Règles : {item.periodDays} jours</Text>
                  <Text style={styles.monthHistoryText}>Douleur : {item.averagePain}/10</Text>
                  <Text style={styles.monthHistoryText}>Sommeil : {item.averageSleep} h</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>
              L’historique mensuel apparaîtra dès que plusieurs journées seront enregistrées.
            </Text>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <SectionTitle
          title="Symptômes dominants"
          subtitle="Les symptômes qui reviennent le plus, avec leur poids relatif dans ton suivi."
        />
        <View style={styles.statsCard}>
          {dominantSymptoms.length ? (
            dominantSymptoms.map((item) => (
              <View key={item.symptom} style={styles.dominantSymptomRow}>
                <View style={styles.dominantSymptomHeader}>
                  <Text style={styles.symptomName}>{item.symptom}</Text>
                  <Text style={styles.dominantSymptomCount}>{item.count} fois</Text>
                </View>
                <View style={styles.dominantSymptomTrack}>
                  <View style={[styles.dominantSymptomFill, { width: `${item.share}%` }]} />
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>
              Aucun symptôme n&apos;a encore été assez renseigné pour dégager une tendance.
            </Text>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <SectionTitle
          title="Journal récent"
          subtitle="Les dernières entrées sauvegardées sur l’appareil."
        />
        <View style={styles.timelineList}>
          {recentRecords.length ? (
            recentRecords.map((record) => (
              <View key={record.date} style={styles.timelineItem}>
                <View style={styles.timelineDate}>
                  <Text style={styles.timelineDateText}>{formatDateLong(record.date)}</Text>
                </View>
                <View style={styles.timelineBody}>
                  <Text style={styles.timelineTitle}>
                    {record.flow} - {record.pain}/10 - {record.mood}
                  </Text>
                  <Text style={styles.timelineText}>{record.notes}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.timelineItem}>
              <Text style={styles.emptyText}>
                Aucun historique pour le moment. Ajoute des journées dans l’onglet Suivi.
              </Text>
            </View>
          )}
        </View>
      </View>
    </>
  );
}
