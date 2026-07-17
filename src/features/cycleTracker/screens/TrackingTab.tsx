import { Pressable, Text, View } from 'react-native';

import { DetailMetric, InfoCard, LegendItem, SectionTitle } from '../../../components/ui';
import { CycleProfile, CycleRecord } from '../../../data/cycleData';
import { formatDateLong, formatDateLongWithYear } from '../../../lib/cycle';
import { useAppStyles, useColors } from '../../../styles/useAppStyles';
import { CalendarDayCell, CalendarFocusMode, CyclePhaseView, PeriodMarkMode, ResolvedDayMeta } from '../types';

type TrackingTabProps = {
  isProfileConfigured: boolean;
  estimatedProfile: CycleProfile;
  displayedPeriodLength: number;
  avgPain: string;
  cyclePhase: CyclePhaseView;
  monthLabel: string;
  shiftMonth: (offset: number) => void;
  isPeriodSelectionMode: boolean;
  periodMarkMode: PeriodMarkMode;
  calendarFocusMode: CalendarFocusMode;
  periodRangeAnchor: string | null;
  periodRangePreviewEnd: string | null;
  calendarWeeks: CalendarDayCell[][];
  selectedDate: string;
  selectedMeta: ResolvedDayMeta;
  selectedRecord?: CycleRecord;
  cycleDay: number;
  onToggleSelectionMode: () => void;
  onSelectPeriodMarkMode: (mode: PeriodMarkMode) => void;
  onSelectCalendarFocusMode: (mode: CalendarFocusMode) => void;
  onCalendarDayPress: (dayIso: string) => void;
  onConfirmRangePreview: () => void;
  onClearRangePreview: () => void;
  onSelectDay: (dayIso: string) => void;
  onOpenDayEntry: () => void;
  getRelativeEnergyLabel: (phaseKey: string) => string;
};

export function TrackingTab({
  isProfileConfigured,
  estimatedProfile,
  displayedPeriodLength,
  avgPain,
  cyclePhase,
  monthLabel,
  shiftMonth,
  isPeriodSelectionMode,
  periodMarkMode,
  calendarFocusMode,
  periodRangeAnchor,
  periodRangePreviewEnd,
  calendarWeeks,
  selectedDate,
  selectedMeta,
  selectedRecord,
  cycleDay,
  onToggleSelectionMode,
  onSelectPeriodMarkMode,
  onSelectCalendarFocusMode,
  onCalendarDayPress,
  onConfirmRangePreview,
  onClearRangePreview,
  onSelectDay,
  onOpenDayEntry,
  getRelativeEnergyLabel,
}: TrackingTabProps) {
  const styles = useAppStyles();
  const c = useColors();
  const rangePreviewSummary = !periodRangeAnchor
    ? null
    : {
        start:
          !periodRangePreviewEnd || periodRangeAnchor <= periodRangePreviewEnd
            ? periodRangeAnchor
            : periodRangePreviewEnd,
        end:
          !periodRangePreviewEnd || periodRangeAnchor <= periodRangePreviewEnd
            ? periodRangePreviewEnd ?? periodRangeAnchor
            : periodRangeAnchor,
      };

  const calendarModeLabel = isPeriodSelectionMode
    ? periodMarkMode === 'single'
      ? 'Marquage jour par jour'
      : 'Marquage par plage'
    : 'Navigation normale';

  const calendarFocusLabel = {
    all: 'Tout le mois',
    rules: 'Jours de règles',
    notes: 'Jours annotés',
    alerts: 'Jours à surveiller',
  }[calendarFocusMode];

  const detailTag = selectedMeta.kind === 'period'
    ? 'Règles'
    : selectedMeta.kind === 'predicted-period'
      ? 'Prévision'
      : selectedMeta.kind === 'fertile'
        ? 'Fenêtre fertile'
        : 'Jour normal';

  return (
    <>
      <View style={styles.section}>
        <SectionTitle
          title="Tableau de bord"
          subtitle="Les indicateurs essentiels du cycle, utiles au quotidien."
        />
        <View style={styles.grid}>
          <InfoCard
            label="Cycle moyen"
            value={isProfileConfigured ? `${estimatedProfile.cycleLength} jours` : 'À définir'}
            accent="rose"
          />
          <InfoCard label="Durée des règles" value={`${displayedPeriodLength} jours`} accent="sand" />
          <InfoCard label="Douleur moyenne" value={`${avgPain}/10`} accent="gold" />
          <InfoCard
            label="Énergie estimée"
            value={isProfileConfigured ? getRelativeEnergyLabel(cyclePhase.key) : 'À définir'}
            accent="blue"
          />
        </View>
      </View>

      <View style={styles.section}>
        <SectionTitle
          title="Calendrier"
          subtitle="Sélectionne une date ou active le mode règles pour marquer directement le calendrier."
        />
        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Mois précédent"
              onPress={() => shiftMonth(-1)}
              style={styles.monthButton}
            >
              <Text style={styles.monthButtonText}>‹</Text>
            </Pressable>
            <Text style={styles.calendarMonthLabel}>{monthLabel}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Mois suivant"
              onPress={() => shiftMonth(1)}
              style={styles.monthButton}
            >
              <Text style={styles.monthButtonText}>›</Text>
            </Pressable>
          </View>

          <View style={styles.calendarToolsRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isPeriodSelectionMode ? 'Terminer le marquage des règles' : 'Marquer les règles'}
              accessibilityState={{ selected: isPeriodSelectionMode }}
              style={[
                styles.calendarToolButton,
                isPeriodSelectionMode && styles.calendarToolButtonActive,
              ]}
              onPress={onToggleSelectionMode}
            >
              <Text
                style={[
                  styles.calendarToolButtonText,
                  isPeriodSelectionMode && styles.calendarToolButtonTextActive,
                ]}
              >
                {isPeriodSelectionMode ? 'Terminer' : 'Marquer les règles'}
              </Text>
            </Pressable>

            <View style={styles.calendarModeRow}>
              {[
                ['all', 'Tout'],
                ['rules', 'Règles'],
                ['notes', 'Notes'],
                ['alerts', 'Alertes'],
              ].map(([mode, label]) => (
                <Pressable
                  key={mode}
                  style={[
                    styles.calendarToolButton,
                    calendarFocusMode === mode && styles.calendarToolButtonActive,
                  ]}
                  onPress={() => onSelectCalendarFocusMode(mode as CalendarFocusMode)}
                >
                  <Text
                    style={[
                      styles.calendarToolButtonText,
                      calendarFocusMode === mode && styles.calendarToolButtonTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {isPeriodSelectionMode && (
              <View style={styles.calendarModeRow}>
                <Pressable
                  style={[
                    styles.calendarToolButton,
                    periodMarkMode === 'single' && styles.calendarToolButtonActive,
                  ]}
                  onPress={() => onSelectPeriodMarkMode('single')}
                >
                  <Text
                    style={[
                      styles.calendarToolButtonText,
                      periodMarkMode === 'single' && styles.calendarToolButtonTextActive,
                    ]}
                  >
                    Un jour
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.calendarToolButton,
                    periodMarkMode === 'range' && styles.calendarToolButtonActive,
                  ]}
                  onPress={() => onSelectPeriodMarkMode('range')}
                >
                  <Text
                    style={[
                      styles.calendarToolButtonText,
                      periodMarkMode === 'range' && styles.calendarToolButtonTextActive,
                    ]}
                  >
                    Plage
                  </Text>
                </Pressable>
              </View>
            )}

            <Text style={styles.calendarHintText}>
              {!isPeriodSelectionMode
                ? 'Touchez une date pour la sélectionner, puis ouvrez la fiche avec le bouton juste en dessous.'
                : periodMarkMode === 'single'
                  ? 'Touchez une date pour ajouter ou retirer un jour de règles.'
                  : periodRangeAnchor && !periodRangePreviewEnd
                    ? `Début sélectionné le ${formatDateLong(periodRangeAnchor)}. Choisis maintenant la fin de la plage.`
                    : 'Plage prévisualisée. Vérifie le surlignage puis valide ou annule.'}
            </Text>

            <View style={styles.calendarStateRow}>
              <View style={styles.calendarStateChip}>
                <Text style={styles.calendarStateLabel}>Jour sélectionné</Text>
                <Text style={styles.calendarStateValue}>{formatDateLongWithYear(selectedDate)}</Text>
              </View>
              <View style={[styles.calendarStateChip, styles.calendarStateChipSoft]}>
                <Text style={styles.calendarStateLabel}>Mode actif</Text>
                <Text style={styles.calendarStateValue}>{calendarModeLabel}</Text>
              </View>
            </View>
            <Text style={styles.calendarFocusText}>{`Filtre affiché : ${calendarFocusLabel}`}</Text>
          </View>

          {periodMarkMode === 'range' && rangePreviewSummary && (
            <View style={styles.rangePreviewCard}>
              <Text style={styles.rangePreviewTitle}>
                {periodRangePreviewEnd ? 'Prévisualisation de la plage' : 'Choix du début'}
              </Text>
              <Text style={styles.rangePreviewText}>
                Du {formatDateLong(rangePreviewSummary.start)} au {formatDateLong(rangePreviewSummary.end)}
              </Text>
              <View style={styles.rangePreviewActions}>
                <Pressable style={styles.secondaryAction} onPress={onClearRangePreview}>
                  <Text style={styles.secondaryActionText}>Annuler</Text>
                </Pressable>
                {Boolean(periodRangePreviewEnd) && (
                  <Pressable style={styles.primaryAction} onPress={onConfirmRangePreview}>
                    <Text style={styles.primaryActionText}>Valider la plage</Text>
                  </Pressable>
                )}
              </View>
            </View>
          )}

          <View style={styles.weekdaysRow}>
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((dayName, index) => (
              <Text key={`${dayName}-${index}`} style={styles.weekdayText}>
                {dayName}
              </Text>
            ))}
          </View>

          {calendarWeeks.map((week, weekIndex) => (
            <View key={`week-${weekIndex}`} style={styles.weekRow}>
              {week.map((day) => (
                <Pressable
                  key={day.dayIso}
                  accessibilityRole="button"
                  accessibilityLabel={`${formatDateLongWithYear(day.dayIso)}${day.displayMeta.kind === 'period' ? ', règles' : day.displayMeta.kind === 'predicted-period' ? ', règles prédites' : day.displayMeta.kind === 'fertile' ? ', fenêtre fertile' : ''}${day.displayMeta.isToday ? ", aujourd'hui" : ''}`}
                  accessibilityState={{ selected: day.isSelected }}
                  onPress={() => {
                    if (isPeriodSelectionMode) {
                      onCalendarDayPress(day.dayIso);
                      return;
                    }

                    onSelectDay(day.dayIso);
                  }}
                  style={[
                    styles.dayCell,
                    !day.matchesFocus && styles.dayCellFiltered,
                    !day.isCurrentMonth && styles.dayCellOutOfMonth,
                    day.displayMeta.kind === 'period' && styles.dayCellPeriod,
                    day.displayMeta.kind === 'predicted-period' && styles.dayCellPredicted,
                    day.displayMeta.kind === 'fertile' && styles.dayCellFertile,
                    day.displayMeta.isToday && styles.dayCellToday,
                    day.isRangeAnchor && styles.dayCellAnchor,
                    day.isSelected && styles.dayCellSelected,
                  ]}
                >
                  {day.isRangePreview && (
                    <View
                      style={[
                        styles.rangePreviewFill,
                        day.isRangePreviewStart && styles.rangePreviewFillStart,
                        day.isRangePreviewEnd && styles.rangePreviewFillEnd,
                        day.isRangePreviewStart &&
                          day.isRangePreviewEnd &&
                          styles.rangePreviewFillSingle,
                      ]}
                    />
                  )}
                  <Text
                    style={[
                      styles.dayNumber,
                      !day.isCurrentMonth && styles.dayNumberMuted,
                      day.displayMeta.kind === 'period' && styles.dayNumberStrong,
                      day.isSelected && styles.dayNumberSelected,
                      day.isRangePreview && styles.dayNumberRangePreview,
                    ]}
                  >
                    {day.dayNumber}
                  </Text>
                  <View style={styles.dayMarkersRow}>
                    {day.displayMeta.kind === 'period' && <View style={[styles.dot, styles.dotPeriod]} />}
                    {day.displayMeta.kind === 'predicted-period' && (
                      <View style={[styles.dot, styles.dotPredicted]} />
                    )}
                    {day.displayMeta.kind === 'fertile' && <View style={[styles.dot, styles.dotFertile]} />}
                    {day.displayMeta.isToday && <View style={[styles.dot, styles.dotToday]} />}
                  </View>
                </Pressable>
              ))}
            </View>
          ))}

          <View style={styles.legendRow}>
            <LegendItem color={c.primaryMid} label="Règles" />
            <LegendItem color={c.dotPredicted} label="Prévision" />
            <LegendItem color={c.dotFertile} label="Fertilité" />
            <LegendItem color={c.primary} label="Aujourd'hui" />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <SectionTitle
          title="Jour sélectionné"
          subtitle="Choisis une date dans le calendrier puis ouvre sa fiche pour la compléter."
        />
        <View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <View style={styles.detailHeaderText}>
              <Text style={styles.detailTitle}>{formatDateLongWithYear(selectedDate)}</Text>
              <Text style={styles.detailSubtitle}>{selectedMeta.statusLabel}</Text>
            </View>
            <View style={[styles.phaseBadge, { backgroundColor: cyclePhase.background }]}>
              <Text style={[styles.phaseBadgeText, { color: cyclePhase.foreground }]}>
                {cyclePhase.shortLabel}
              </Text>
            </View>
          </View>

          <View style={styles.detailBadgeRow}>
            <View style={styles.detailBadge}>
              <Text style={styles.detailBadgeText}>{selectedRecord ? 'Saisie locale' : 'À compléter'}</Text>
            </View>
            <View style={[styles.detailBadge, styles.detailBadgeSoft]}>
              <Text style={styles.detailBadgeText}>{detailTag}</Text>
            </View>
          </View>

          <View style={styles.detailMetrics}>
            <DetailMetric label="Cycle" value={`Jour ${cycleDay}`} />
            <DetailMetric label="Flux" value={selectedRecord?.flow ?? selectedMeta.flowFallback} />
          </View>

          <View style={styles.actionsRow}>
            <Pressable style={styles.primaryAction} onPress={onOpenDayEntry}>
              <Text style={styles.primaryActionText}>Ouvrir la fiche du jour</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </>
  );
}
