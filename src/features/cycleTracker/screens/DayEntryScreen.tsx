import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { DetailMetric, EditorLabel, SectionTitle, SelectChip } from '../../../components/ui';
import { CycleRecord, FlowLevel } from '../../../data/cycleData';
import { formatDateLongWithYear } from '../../../lib/cycle';
import { useAppStyles, useColors } from '../../../styles/useAppStyles';
import { AppColors } from '../../../styles/colors';
import { PregnancyStage } from '../pregnancy';
import { CyclePhaseView, EntryFormState, ResolvedDayMeta } from '../types';

type DayEntryScreenProps = {
  isPregnancyMode: boolean;
  selectedDate: string;
  selectedMeta: ResolvedDayMeta;
  selectedRecord?: CycleRecord;
  selectedRecordHasDetails: boolean;
  cycleDay: number;
  cyclePhase: CyclePhaseView;
  pregnancyStage: PregnancyStage;
  pregnancyDueDateLabel: string;
  pregnancyWeeksRemainingLabel: string;
  entryForm: EntryFormState;
  entryMessage: string;
  flowOptions: FlowLevel[];
  painOptions: number[];
  moodPresets: string[];
  symptomCatalog: string[];
  onEntryFieldChange: (patch: Partial<EntryFormState>) => void;
  onToggleSymptom: (symptom: string) => void;
  onSaveEntry: () => void;
  onDeleteEntry: () => void;
};

export function DayEntryScreen({
  isPregnancyMode,
  selectedDate,
  selectedMeta,
  selectedRecord,
  selectedRecordHasDetails,
  cycleDay,
  cyclePhase,
  pregnancyStage,
  pregnancyDueDateLabel,
  pregnancyWeeksRemainingLabel,
  entryForm,
  entryMessage,
  flowOptions,
  painOptions,
  moodPresets,
  symptomCatalog,
  onEntryFieldChange,
  onToggleSymptom,
  onSaveEntry,
  onDeleteEntry,
}: DayEntryScreenProps) {
  const styles = useAppStyles();
  const c = useColors();
  function getPhaseColors(label: string): { bg: string; fg: string } {
    if (label === 'Règles') return { bg: c.phaseRulesBg, fg: c.phaseRulesFg };
    if (label === 'Folliculaire') return { bg: c.phaseFollBg, fg: c.phaseFollFg };
    if (label === 'Ovulation') return { bg: c.phaseOvulBg, fg: c.phaseOvulFg };
    return { bg: c.phaseLutBg, fg: c.phaseLutFg };
  }
  const pregnancySymptomCatalog = [
    'Nausées',
    'Fatigue',
    'Maux de dos',
    'Mouvements bébé',
    'Contractions',
    'Brûlures',
    'Envies fréquentes',
    'Sommeil agité',
  ];

  const flowLabelMap: Record<FlowLevel, string> = isPregnancyMode
    ? {
        Absent: 'Stable',
        Léger: 'Léger',
        Moyen: 'Modéré',
        Abondant: 'Intense',
      }
    : {
        Absent: 'Absent',
        Léger: 'Léger',
        Moyen: 'Moyen',
        Abondant: 'Abondant',
      };

  const entryStatus = selectedRecordHasDetails ? 'Saisie enregistrée' : 'À compléter';
  const entryMode = isPregnancyMode
    ? `Semaine ${pregnancyStage.week}`
    : selectedMeta.kind === 'period'
      ? 'Jour de règles'
      : selectedMeta.kind === 'predicted-period'
        ? 'Règle prévue'
        : selectedMeta.kind === 'fertile'
          ? 'Fenêtre fertile'
          : 'Jour neutre';

  return (
    <ScrollView
      style={styles.sheetScreen}
      contentContainerStyle={styles.sheetScrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.section}>
        <SectionTitle
          title={isPregnancyMode ? 'Journal de grossesse' : selectedMeta.statusLabel}
          subtitle={
            isPregnancyMode
              ? `Sélection du ${formatDateLongWithYear(selectedDate)} · Date prévue ${pregnancyDueDateLabel}`
              : `Sélection du ${formatDateLongWithYear(selectedDate)}`
          }
        />
        <View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <View style={styles.detailHeaderText}>
              <Text style={styles.detailTitle}>{formatDateLongWithYear(selectedDate)}</Text>
              <Text style={styles.detailSubtitle}>
                {isPregnancyMode
                  ? `Semaine ${pregnancyStage.week} · ${pregnancyStage.trimester}e trimestre`
                  : `Jour ${cycleDay} du cycle - ${cyclePhase.label}`}
              </Text>
            </View>
            <View style={[styles.phaseBadge, { backgroundColor: isPregnancyMode ? c.phaseRulesBg : getPhaseColors(cyclePhase.shortLabel).bg }]}>
              <Text style={[styles.phaseBadgeText, { color: isPregnancyMode ? c.phaseRulesFg : getPhaseColors(cyclePhase.shortLabel).fg }]}>
                {isPregnancyMode ? pregnancyStage.fruitEmoji : cyclePhase.shortLabel}
              </Text>
            </View>
          </View>

          <View style={styles.detailBadgeRow}>
            <View style={styles.detailBadge}>
              <Text style={styles.detailBadgeText}>{entryStatus}</Text>
            </View>
            <View style={[styles.detailBadge, styles.detailBadgeSoft]}>
              <Text style={styles.detailBadgeText}>{entryMode}</Text>
            </View>
          </View>

          <View style={styles.detailMetrics}>
            <DetailMetric
              label={isPregnancyMode ? 'Confort' : 'Flux'}
              value={selectedRecord?.flow ? flowLabelMap[selectedRecord.flow] : selectedMeta.flowFallback}
            />
            <DetailMetric
              label={isPregnancyMode ? 'Bien-être' : 'Douleur'}
              value={selectedRecordHasDetails ? `${selectedRecord?.pain ?? 0}/10` : selectedMeta.painFallback}
            />
            <DetailMetric label="Humeur" value={selectedRecordHasDetails ? selectedRecord?.mood || 'À enregistrer' : 'À enregistrer'} />
            <DetailMetric label="Sommeil" value={selectedRecordHasDetails ? `${selectedRecord?.sleepHours ?? 0} h` : 'À enregistrer'} />
          </View>

          <View style={styles.notesCard}>
            <Text style={styles.notesTitle}>{isPregnancyMode ? 'Repères et observations' : 'Symptômes et observations'}</Text>
            <View style={styles.chipWrap}>
              {(selectedRecordHasDetails && selectedRecord?.symptoms.length
                ? selectedRecord.symptoms
                : selectedMeta.suggestedSymptoms
              ).map((symptom) => (
                <View key={symptom} style={styles.chip}>
                  <Text style={styles.chipText}>{symptom}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.notesBody}>
              {selectedRecordHasDetails && selectedRecord?.notes
                ? selectedRecord.notes
                : isPregnancyMode
                  ? 'Aucune note pour cette date. Tu peux maintenant renseigner cette journée et la sauvegarder localement.'
                  : 'Aucune note pour cette date. Tu peux maintenant renseigner cette journée et la sauvegarder localement.'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <SectionTitle
          title={isPregnancyMode ? 'Journal de grossesse' : 'Enregistrer la journée'}
          subtitle={
            isPregnancyMode
              ? 'Note tes ressentis, le sommeil et les repères de grossesse localement sur ce téléphone.'
              : 'Cette fiche se sauvegarde localement sur ce téléphone.'
          }
        />
        <View style={styles.editorCard}>
          <EditorLabel label={isPregnancyMode ? 'Confort' : 'Flux'} />
          <View style={styles.optionWrap}>
            {flowOptions.map((option) => (
              <SelectChip
                key={option}
                label={isPregnancyMode ? flowLabelMap[option] : option}
                selected={entryForm.flow === option}
                onPress={() => onEntryFieldChange({ flow: option })}
              />
            ))}
          </View>

          <EditorLabel label={isPregnancyMode ? 'Bien-être' : 'Douleur'} />
          <View style={styles.optionWrap}>
            {painOptions.map((option) => (
              <SelectChip
                key={option}
                label={`${option}/10`}
                selected={entryForm.pain === option}
                onPress={() => onEntryFieldChange({ pain: option })}
              />
            ))}
          </View>

          <EditorLabel label="Humeur" />
          <View style={styles.optionWrap}>
            {moodPresets.map((option) => (
              <SelectChip
                key={option}
                label={option}
                selected={entryForm.mood === option}
                onPress={() => onEntryFieldChange({ mood: option })}
              />
            ))}
          </View>

          <TextInput
            style={styles.textInput}
            value={entryForm.sleepHours}
            onChangeText={(value) => onEntryFieldChange({ sleepHours: value })}
            placeholder={isPregnancyMode ? 'Sommeil en heures, ex. 7,5' : 'Sommeil en heures, ex. 7,5'}
            placeholderTextColor={c.placeholder}
            keyboardType="decimal-pad"
          />

          <TextInput
            style={styles.textInput}
            value={entryForm.mood}
            onChangeText={(value) => onEntryFieldChange({ mood: value })}
            placeholder="Ajouter une humeur plus précise"
            placeholderTextColor={c.placeholder}
          />

          <EditorLabel label={isPregnancyMode ? 'Symptômes de grossesse' : 'Symptômes'} />
          <View style={styles.optionWrap}>
            {(isPregnancyMode ? pregnancySymptomCatalog : symptomCatalog).map((option) => (
              <SelectChip
                key={option}
                label={option}
                selected={entryForm.symptoms.includes(option)}
                onPress={() => onToggleSymptom(option)}
              />
            ))}
          </View>

          <TextInput
            style={[styles.textInput, styles.notesInput]}
            value={entryForm.notes}
            onChangeText={(value) => onEntryFieldChange({ notes: value })}
            placeholder={
              isPregnancyMode
                ? 'Notes, sensations, rendez-vous, mouvements du bébé...'
                : 'Notes, observation, médicament, rapport, énergie...'
            }
            placeholderTextColor={c.placeholder}
            multiline
            textAlignVertical="top"
          />

          {Boolean(entryMessage) && <Text style={styles.saveMessage}>{entryMessage}</Text>}

          <View style={styles.actionsRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sauvegarder la journée"
              style={styles.primaryAction}
              onPress={onSaveEntry}
            >
              <Text style={styles.primaryActionText}>Sauvegarder</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Supprimer l'entrée de cette journée"
              style={styles.secondaryAction}
              onPress={onDeleteEntry}
            >
              <Text style={styles.secondaryActionText}>Supprimer</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
