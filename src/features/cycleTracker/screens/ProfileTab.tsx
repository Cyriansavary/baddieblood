import { Pressable, Text, TextInput, View } from 'react-native';

import { EditorLabel, SectionTitle, SelectChip, StatsRow } from '../../../components/ui';
import { CycleProfile, TrackingMode } from '../../../data/cycleData';
import { formatDateLongWithYear, parseFrenchDateInput } from '../../../lib/cycle';
import { useAppStyles, useColors } from '../../../styles/useAppStyles';
import { premiumRoadmap } from '../constants';
import { getAddressingStyleLabel } from '../helpers';
import { ProfileFormState } from '../types';
import { PregnancyStage } from '../pregnancy';

type ProfileTabProps = {
  profileForm: ProfileFormState;
  profileMessage: string;
  estimatedProfile: CycleProfile;
  nextPeriodStart: string;
  fertileWindow: { start: string; end: string };
  hasCycleReference: boolean;
  isPregnancyMode: boolean;
  pregnancyStage: PregnancyStage;
  pregnancyDueDateLabel: string;
  pregnancyWeeksRemainingLabel: string;
  onProfileFieldChange: (patch: Partial<ProfileFormState>) => void;
  onFormatDateFieldChange: (field: 'lastPeriodStart' | 'lastPeriodEnd', value: string) => void;
  formatDateTyping: (value: string) => string;
  onSaveProfile: () => void;
  onSwitchTrackingMode: (mode: TrackingMode) => void;
  onReset: () => void;
};

export function ProfileTab({
  profileForm,
  profileMessage,
  estimatedProfile,
  nextPeriodStart,
  fertileWindow,
  hasCycleReference,
  isPregnancyMode,
  pregnancyStage,
  pregnancyDueDateLabel,
  pregnancyWeeksRemainingLabel,
  onProfileFieldChange,
  onFormatDateFieldChange,
  formatDateTyping,
  onSaveProfile,
  onSwitchTrackingMode,
  onReset,
}: ProfileTabProps) {
  const styles = useAppStyles();
  const c = useColors();
  const hasAttempted = Boolean(profileMessage);
  const nameHasError = hasAttempted && !profileForm.name.trim();
  const startHasError =
    profileForm.lastPeriodStart.length === 10 && !parseFrenchDateInput(profileForm.lastPeriodStart);
  const endHasError =
    profileForm.lastPeriodEnd.length === 10 && !parseFrenchDateInput(profileForm.lastPeriodEnd);
  const dueDateHasError =
    profileForm.pregnancyDueDate.length === 10 && !parseFrenchDateInput(profileForm.pregnancyDueDate);

  return (
    <>
      <View style={styles.section}>
        <SectionTitle
          title={isPregnancyMode ? 'Réglages grossesse' : 'Profil'}
          subtitle={
            isPregnancyMode
              ? 'Ajuste la date prévue et les repères du suivi grossesse.'
              : 'Ajuste ici le mode de suivi et les informations de référence.'
          }
        />
        <View style={styles.editorCard}>
          <EditorLabel label="Comment l'application te parle" />
          <View style={styles.optionWrap}>
            <SelectChip
              label="Masculin"
              selected={profileForm.addressingStyle === 'masculine'}
              onPress={() => onProfileFieldChange({ addressingStyle: 'masculine' })}
            />
            <SelectChip
              label="Féminin"
              selected={profileForm.addressingStyle === 'feminine'}
              onPress={() => onProfileFieldChange({ addressingStyle: 'feminine' })}
            />
            <SelectChip
              label="Non-binaire"
              selected={profileForm.addressingStyle === 'nonBinary'}
              onPress={() => onProfileFieldChange({ addressingStyle: 'nonBinary' })}
            />
          </View>
          <Text style={styles.onboardingHintText}>
            L&apos;application s&apos;adresse en {getAddressingStyleLabel(profileForm.addressingStyle).toLowerCase()}.
          </Text>

          {isPregnancyMode ? (
            <View style={styles.onboardingHintCard}>
              <Text style={styles.onboardingHintTitle}>Mode grossesse actif</Text>
              <Text style={styles.onboardingHintText}>
                Les champs cycle sont masqués. Ici, tu ne gères que la grossesse et les repères médicaux.
              </Text>
              <Pressable
                style={[styles.secondaryAction, { marginTop: 10 }]}
                onPress={() => onSwitchTrackingMode('cycle')}
              >
                <Text style={styles.secondaryActionText}>Revenir au mode cycle</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <EditorLabel label="Mode de suivi" />
              <View style={styles.optionWrap}>
                <SelectChip
                  label="Cycle"
                  selected={profileForm.trackingMode === 'cycle'}
                  onPress={() => onProfileFieldChange({ trackingMode: 'cycle' })}
                />
                <SelectChip
                  label="Grossesse"
                  selected={profileForm.trackingMode === 'pregnancy'}
                  onPress={() => onProfileFieldChange({ trackingMode: 'pregnancy' })}
                />
              </View>
              <Text style={styles.onboardingHintText}>
                Mode actif : cycle.
              </Text>
            </>
          )}

          <EditorLabel label="Prénom" />
          <TextInput
            style={[styles.textInput, nameHasError && styles.textInputError]}
            value={profileForm.name}
            onChangeText={(value) => onProfileFieldChange({ name: value })}
            placeholder="Ex. Nadia"
            placeholderTextColor={c.placeholder}
          />

          {isPregnancyMode ? (
            <>
              <EditorLabel label="Date prévue d'accouchement" />
              <TextInput
                style={[styles.textInput, dueDateHasError && styles.textInputError]}
                value={profileForm.pregnancyDueDate}
                onChangeText={(value) =>
                  onProfileFieldChange({ pregnancyDueDate: formatDateTyping(value) })
                }
                placeholder="JJ/MM/AAAA"
                placeholderTextColor={c.placeholder}
                autoCapitalize="none"
                keyboardType="number-pad"
                maxLength={10}
              />

              <View style={styles.onboardingHintCard}>
                <Text style={styles.onboardingHintTitle}>Suivi grossesse</Text>
                <Text style={styles.onboardingHintText}>
                  L&apos;app affichera la semaine, le trimestre et les repères fruit.
                </Text>
              </View>
            </>
          ) : (
            <>
              <EditorLabel label="Longueur moyenne du cycle" />
              <TextInput
                style={styles.textInput}
                value={profileForm.cycleLength}
                onChangeText={(value) => onProfileFieldChange({ cycleLength: value })}
                placeholder="Ex. 28"
                placeholderTextColor={c.placeholder}
                keyboardType="number-pad"
              />

              <EditorLabel label="Durée moyenne du saignement" />
              <TextInput
                style={styles.textInput}
                value={profileForm.periodLength}
                onChangeText={(value) => onProfileFieldChange({ periodLength: value })}
                placeholder="Ex. 5"
                placeholderTextColor={c.placeholder}
                keyboardType="number-pad"
              />

              <View style={{ marginBottom: 8 }}>
                <SelectChip
                  label="Règles en cours"
                  selected={profileForm.lastPeriodStart === (() => { const d = new Date(); return String(d.getDate()).padStart(2,'0') + '/' + String(d.getMonth()+1).padStart(2,'0') + '/' + d.getFullYear(); })()}
                  onPress={() => { const d = new Date(); const s = String(d.getDate()).padStart(2,'0') + '/' + String(d.getMonth()+1).padStart(2,'0') + '/' + d.getFullYear(); onProfileFieldChange({ lastPeriodStart: s, lastPeriodEnd: '' }); }}
                />
              </View>
              <EditorLabel label="Date de début des dernières règles" />
              <TextInput
                style={[styles.textInput, startHasError && styles.textInputError]}
                value={profileForm.lastPeriodStart}
                onChangeText={(value) => onFormatDateFieldChange('lastPeriodStart', value)}
                placeholder="JJ/MM/AAAA"
                placeholderTextColor={c.placeholder}
                autoCapitalize="none"
                keyboardType="number-pad"
                maxLength={10}
              />

            </>
          )}

          {Boolean(profileMessage) && <Text style={styles.saveMessage}>{profileMessage}</Text>}

          <View style={styles.actionsRow}>
            <Pressable style={styles.primaryAction} onPress={onSaveProfile}>
              <Text style={styles.primaryActionText}>Sauvegarder le profil</Text>
            </Pressable>
          </View>

          <View style={styles.resetBlock}>
            <Text style={styles.resetTitle}>Réinitialisation</Text>
            <Text style={styles.resetText}>
              Efface le profil et toutes les données locales pour retrouver l&apos;état du premier lancement.
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Réinitialiser l'application et effacer toutes les données"
              style={styles.dangerAction}
              onPress={onReset}
            >
              <Text style={styles.dangerActionText}>Réinitialiser l&apos;application</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <SectionTitle
          title={isPregnancyMode ? 'Aperçu grossesse' : 'Aperçu du profil'}
          subtitle={
            isPregnancyMode
              ? 'Les repères ci-dessous utilisent la date prévue et le stade actuel.'
              : 'Les prévisions ci-dessous utilisent déjà les valeurs enregistrées.'
          }
        />
        <View style={styles.statsCard}>
          {isPregnancyMode ? (
            <>
              <StatsRow label="Date prévue" value={pregnancyDueDateLabel} />
              <StatsRow label="Repère fruit" value={pregnancyStage.fruitLabel} />
              <StatsRow label="Semaine" value={`S${pregnancyStage.week}`} />
              <StatsRow label="Semaines restantes" value={pregnancyWeeksRemainingLabel} />
            </>
          ) : (
            <>
              <StatsRow
                label="Prochaines règles"
                value={hasCycleReference ? formatDateLongWithYear(nextPeriodStart) : 'À renseigner'}
              />
              <StatsRow
                label="Fenêtre fertile"
                value={hasCycleReference ? formatDateLongWithYear(fertileWindow.start) : 'À renseigner'}
              />
              <StatsRow
                label="Fin de la fenêtre fertile"
                value={hasCycleReference ? formatDateLongWithYear(fertileWindow.end) : 'À renseigner'}
              />
              <StatsRow label="Cycle moyen" value={`${estimatedProfile.cycleLength} jours`} />
            </>
          )}
        </View>
      </View>

    </>
  );
}
