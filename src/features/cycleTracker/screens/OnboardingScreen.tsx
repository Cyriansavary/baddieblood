import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { EditorLabel, SectionTitle, SelectChip } from '../../../components/ui';
import { parseFrenchDateInput } from '../../../lib/cycle';
import { useAppStyles, useColors } from '../../../styles/useAppStyles';
import {
  getAddressingStyleLabel,
  getOnboardingProgress,
  getStartCtaLabel,
  getTrackingModeLabel,
} from '../helpers';
import { OnboardingStep, ProfileFormState } from '../types';

type OnboardingScreenProps = {
  onboardingStep: OnboardingStep;
  profileForm: ProfileFormState;
  profileMessage: string;
  onProfileFieldChange: (patch: Partial<ProfileFormState>) => void;
  onPrevious: () => void;
  onNext: () => void;
  onSave: () => void;
  formatDateTyping: (value: string) => string;
};

export function OnboardingScreen({
  onboardingStep,
  profileForm,
  profileMessage,
  onProfileFieldChange,
  onPrevious,
  onNext,
  onSave,
  formatDateTyping,
}: OnboardingScreenProps) {
  const styles = useAppStyles();
  const c = useColors();
  const [situation, setSituation] = useState<'ongoing' | 'finished' | 'pregnancy'>(
    profileForm.trackingMode === 'pregnancy' ? 'pregnancy' : 'ongoing'
  );

  function todayFrench() {
    const d = new Date();
    return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
  }

  function selectSituation(s: 'ongoing' | 'finished' | 'pregnancy') {
    setSituation(s);
    if (s === 'ongoing') {
      onProfileFieldChange({ trackingMode: 'cycle', lastPeriodStart: todayFrench(), lastPeriodEnd: '' });
    } else if (s === 'finished') {
      onProfileFieldChange({ trackingMode: 'cycle', lastPeriodStart: '', lastPeriodEnd: '' });
    } else {
      onProfileFieldChange({ trackingMode: 'pregnancy', lastPeriodStart: '', lastPeriodEnd: '' });
    }
  }
  const hasAttempted = Boolean(profileMessage);
  const nameHasError = hasAttempted && !profileForm.name.trim();
  const startHasError =
    profileForm.lastPeriodStart.length === 10 && !parseFrenchDateInput(profileForm.lastPeriodStart);
  const endHasError =
    profileForm.lastPeriodEnd.length === 10 && !parseFrenchDateInput(profileForm.lastPeriodEnd);
  const dueDateHasError =
    profileForm.pregnancyDueDate.length === 10 && !parseFrenchDateInput(profileForm.pregnancyDueDate);

  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroTranslate = useRef(new Animated.Value(24)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslate = useRef(new Animated.Value(32)).current;
  useEffect(() => {
    heroOpacity.setValue(0);
    heroTranslate.setValue(24);
    cardOpacity.setValue(0);
    cardTranslate.setValue(32);

    Animated.parallel([
      Animated.timing(heroOpacity, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.timing(heroTranslate, {
        toValue: 0,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 460,
        delay: 110,
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslate, {
        toValue: 0,
        duration: 460,
        delay: 110,
        useNativeDriver: true,
      }),
    ]).start();
  }, [cardOpacity, cardTranslate, heroOpacity, heroTranslate, onboardingStep]);


  return (
    <SafeAreaView style={styles.onboardingScreen}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.keyboardAvoider}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.onboardingContent} keyboardShouldPersistTaps="handled">
          <Animated.View
            style={[
              styles.onboardingHero,
              {
                opacity: heroOpacity,
                transform: [{ translateY: heroTranslate }],
              },
            ]}
          >
            <View style={styles.heroGlowPrimary} />
            <View style={styles.heroGlowSecondary} />
            <View style={styles.sparkleLarge} />
            <View style={styles.sparkleMedium} />
            <View style={styles.sparkleTiny} />
            <Text style={styles.onboardingTitle}>BaddieBlood</Text>
            <Text style={styles.onboardingSubtitle}>
              Commence par renseigner ton profil. Ensuite, l&apos;application activera le suivi adapté, les
              prévisions et les statistiques personnelles.
            </Text>

            <View style={styles.onboardingBadgeRow}>
              <View style={styles.onboardingBadge}>
                <Text style={styles.onboardingBadgeText}>Calendrier</Text>
              </View>
              <View style={styles.onboardingBadge}>
                <Text style={styles.onboardingBadgeText}>Suivi</Text>
              </View>
              <View style={styles.onboardingBadge}>
                <Text style={styles.onboardingBadgeText}>Prévisions</Text>
              </View>
            </View>

            <View style={styles.onboardingProgressRow}>
              {[0, 1, 2].map((step) => (
                <View
                  key={step}
                  style={[
                    styles.onboardingProgressDot,
                    onboardingStep >= step && styles.onboardingProgressDotActive,
                  ]}
                />
              ))}
            </View>

            <View style={styles.onboardingProgressTrack}>
              <View
                style={[
                  styles.onboardingProgressFill,
                  { width: `${getOnboardingProgress(onboardingStep)}%` },
                ]}
              />
            </View>
          </Animated.View>

          <Animated.View
            style={{
              opacity: cardOpacity,
              transform: [{ translateY: cardTranslate }],
            }}
          >
            <View style={styles.section}>
              <SectionTitle
                title={
                  onboardingStep === 0 ? 'Découvrir' : onboardingStep === 1 ? 'Ton profil' : 'Ton suivi'
                }
                subtitle={
                  onboardingStep === 0
                    ? 'Un petit tour rapide avant d’entrer dans l’application.'
                    : onboardingStep === 1
                      ? 'Quelques informations simples pour personnaliser l’expérience.'
                      : 'Les réglages ci-dessous activent le bon mode de suivi.'
                }
              />
              <View style={styles.editorCard}>
                {onboardingStep === 0 && (
                  <>
                    <View style={styles.onboardingTipCard}>
                      <Text style={styles.onboardingTipTitle}>Pensée pour les flux atypiques</Text>
                      <Text style={styles.onboardingTipText}>
                        Tu peux commencer même si tes règles ne sont pas régulières. L&apos;app est faite pour
                        suivre les flux inhabituels, les durées longues et les variations de douleur.
                      </Text>
                    </View>
                    <View style={styles.onboardingFeatureList}>
                      <View style={styles.onboardingFeatureSoft}>
                        <Text style={styles.onboardingFeatureSoftTitle}>Calendrier intelligent</Text>
                        <Text style={styles.onboardingFeatureSoftText}>
                          Visualise les règles, la fenêtre fertile et tes journées enregistrées.
                        </Text>
                      </View>
                      <View style={styles.onboardingFeatureSoft}>
                        <Text style={styles.onboardingFeatureSoftTitle}>Suivi quotidien</Text>
                        <Text style={styles.onboardingFeatureSoftText}>
                          Note ton flux, ta douleur, ton humeur, ton sommeil et tes symptômes.
                        </Text>
                      </View>
                      <View style={styles.onboardingFeatureSoft}>
                        <Text style={styles.onboardingFeatureSoftTitle}>Données privées</Text>
                        <Text style={styles.onboardingFeatureSoftText}>
                          Les informations sont sauvegardées localement sur l&apos;appareil.
                        </Text>
                      </View>
                    </View>
                  </>
                )}

                {onboardingStep === 1 && (
                  <>
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
                      L&apos;application s&apos;adresse en{' '}
                      {getAddressingStyleLabel(profileForm.addressingStyle).toLowerCase()}.
                    </Text>

                    <EditorLabel label="Prénom" />
                    <TextInput
                      style={[styles.textInput, nameHasError && styles.textInputError]}
                      value={profileForm.name}
                      onChangeText={(value) => onProfileFieldChange({ name: value })}
                      placeholder="Ex. Nadia"
                      placeholderTextColor={c.placeholder}
                    />

                    <EditorLabel label="Quelle est ta situation ?" />
                    <View style={styles.optionWrap}>
                      <SelectChip
                        label="Règles en cours"
                        selected={situation === 'ongoing'}
                        onPress={() => selectSituation('ongoing')}
                      />
                      <SelectChip
                        label="Règles terminées"
                        selected={situation === 'finished'}
                        onPress={() => selectSituation('finished')}
                      />
                      <SelectChip
                        label="En grossesse"
                        selected={situation === 'pregnancy'}
                        onPress={() => selectSituation('pregnancy')}
                      />
                    </View>

                    {situation === 'ongoing' && (
                      <>
                        <EditorLabel label="Depuis quand ? (optionnel)" />
                        <TextInput
                          style={[styles.textInput, startHasError && styles.textInputError]}
                          value={profileForm.lastPeriodStart}
                          onChangeText={(value) => onProfileFieldChange({ lastPeriodStart: formatDateTyping(value) })}
                          placeholder="JJ/MM/AAAA"
                          placeholderTextColor={c.placeholder}
                          autoCapitalize="none"
                          keyboardType="number-pad"
                          maxLength={10}
                        />
                      </>
                    )}

                    {situation === 'finished' && (
                      <>
                        <EditorLabel label="Début des dernières règles" />
                        <TextInput
                          style={[styles.textInput, startHasError && styles.textInputError]}
                          value={profileForm.lastPeriodStart}
                          onChangeText={(value) => onProfileFieldChange({ lastPeriodStart: formatDateTyping(value) })}
                          placeholder="JJ/MM/AAAA"
                          placeholderTextColor={c.placeholder}
                          autoCapitalize="none"
                          keyboardType="number-pad"
                          maxLength={10}
                        />
                        <EditorLabel label="Fin des règles" />
                        <TextInput
                          style={[styles.textInput, endHasError && styles.textInputError]}
                          value={profileForm.lastPeriodEnd}
                          onChangeText={(value) => onProfileFieldChange({ lastPeriodEnd: formatDateTyping(value) })}
                          placeholder="JJ/MM/AAAA"
                          placeholderTextColor={c.placeholder}
                          autoCapitalize="none"
                          keyboardType="number-pad"
                          maxLength={10}
                        />
                      </>
                    )}

                    {situation === 'pregnancy' && (
                      <>
                        <EditorLabel label="Date prévue d'accouchement" />
                        <TextInput
                          style={[styles.textInput, dueDateHasError && styles.textInputError]}
                          value={profileForm.pregnancyDueDate}
                          onChangeText={(value) => onProfileFieldChange({ pregnancyDueDate: formatDateTyping(value) })}
                          placeholder="JJ/MM/AAAA"
                          placeholderTextColor={c.placeholder}
                          autoCapitalize="none"
                          keyboardType="number-pad"
                          maxLength={10}
                        />
                      </>
                    )}

                  </>
                )}

                {onboardingStep === 2 && (
                  <>
                    {profileForm.trackingMode === 'pregnancy' ? (
                      <>
                        <View style={styles.onboardingHintCard}>
                          <Text style={styles.onboardingHintTitle}>Suivi grossesse activé</Text>
                          <Text style={styles.onboardingHintText}>
                            L&apos;app affichera la semaine de grossesse, le trimestre et un repère fruit pour chaque
                            stade.
                          </Text>
                        </View>

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

                        <View style={styles.onboardingHintCard}>
                          <Text style={styles.onboardingHintTitle}>Conseil</Text>
                          <Text style={styles.onboardingHintText}>
                            Si tu hésites, commence avec une estimation. Tu pourras toujours la modifier plus tard
                            dans l&apos;onglet Profil.
                          </Text>
                        </View>

                        <View style={styles.onboardingTipCard}>
                          <Text style={styles.onboardingTipTitle}>Tu peux mettre 0 ou plus</Text>
                          <Text style={styles.onboardingTipText}>
                            Cette app est pensée pour des flux très courts, irréguliers ou longs. Si ta durée moyenne ne
                            rentre pas dans une case « standard », garde simplement ta valeur réelle.
                          </Text>
                        </View>
                      </>
                    )}
                  </>
                )}

                {Boolean(profileMessage) && <Text style={styles.saveMessage}>{profileMessage}</Text>}

                <View style={styles.actionsRow}>
                  {onboardingStep > 0 && (
                    <Pressable style={styles.secondaryAction} onPress={onPrevious}>
                      <Text style={styles.secondaryActionText}>Retour</Text>
                    </Pressable>
                  )}
                  {onboardingStep < 2 ? (
                    <Pressable style={styles.primaryAction} onPress={onNext}>
                      <Text style={styles.primaryActionText}>
                        {onboardingStep === 0 ? 'Continuer' : 'Suivant'}
                      </Text>
                    </Pressable>
                  ) : (
                    <Pressable style={styles.primaryAction} onPress={onSave}>
                      <Text style={styles.primaryActionText}>
                        {getStartCtaLabel(profileForm.addressingStyle)}
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
