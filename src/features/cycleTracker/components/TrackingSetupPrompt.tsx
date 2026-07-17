import { Pressable, Text, TextInput, View } from 'react-native';

import { EditorLabel, SectionTitle } from '../../../components/ui';
import { parseFrenchDateInput } from '../../../lib/cycle';
import { ProfileFormState } from '../types';
import { useAppStyles } from '../../../styles/useAppStyles';

type TrackingSetupPromptProps = {
  profileForm: ProfileFormState;
  trackingSetupMessage: string;
  onLastPeriodStartChange: (value: string) => void;
  onLastPeriodEndChange: (value: string) => void;
  onContinue: () => void;
};

export function TrackingSetupPrompt({
  profileForm,
  trackingSetupMessage,
  onLastPeriodStartChange,
  onLastPeriodEndChange,
  onContinue,
}: TrackingSetupPromptProps) {
  const styles = useAppStyles();
  const startHasError =
    profileForm.lastPeriodStart.length === 10 && !parseFrenchDateInput(profileForm.lastPeriodStart);
  const endHasError =
    profileForm.lastPeriodEnd.length === 10 && !parseFrenchDateInput(profileForm.lastPeriodEnd);

  return (
    <View style={styles.section}>
      <SectionTitle
        title="Avant d'ouvrir ton suivi"
        subtitle="On a besoin de la date de début de tes dernières règles pour calculer le jour du cycle, la phase et les prochaines estimations."
      />
      <View style={styles.editorCard}>
        <EditorLabel label="Date de début des dernières règles" />
        <TextInput
          style={[styles.textInput, startHasError && styles.textInputError]}
          value={profileForm.lastPeriodStart}
          onChangeText={onLastPeriodStartChange}
          placeholder="JJ/MM/AAAA"
          placeholderTextColor="#93a1af"
          autoCapitalize="none"
          keyboardType="number-pad"
          maxLength={10}
        />

        <EditorLabel label="Date de fin des dernières règles" />
        <TextInput
          style={[styles.textInput, endHasError && styles.textInputError]}
          value={profileForm.lastPeriodEnd}
          onChangeText={onLastPeriodEndChange}
          placeholder="JJ/MM/AAAA"
          placeholderTextColor="#93a1af"
          autoCapitalize="none"
          keyboardType="number-pad"
          maxLength={10}
        />
        {Boolean(trackingSetupMessage) && <Text style={styles.saveMessage}>{trackingSetupMessage}</Text>}
        <View style={styles.actionsRow}>
          <Pressable style={styles.primaryAction} onPress={onContinue}>
            <Text style={styles.primaryActionText}>Continuer vers le suivi</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
