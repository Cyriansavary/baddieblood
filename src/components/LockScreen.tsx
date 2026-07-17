import { Pressable, SafeAreaView, Text } from 'react-native';

import { useAppStyles } from '../styles/useAppStyles';

type LockScreenProps = {
  onUnlock: () => void;
};

export function LockScreen({ onUnlock }: LockScreenProps) {
  const styles = useAppStyles();

  return (
    <SafeAreaView style={styles.loadingScreen}>
      <Text style={[styles.onboardingTitle, { textAlign: 'center', maxWidth: undefined }]}>
        BaddieBlood
      </Text>
      <Text style={styles.loadingText}>Application verrouillée</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Déverrouiller l'application"
        style={styles.primaryAction}
        onPress={onUnlock}
      >
        <Text style={styles.primaryActionText}>Déverrouiller</Text>
      </Pressable>
    </SafeAreaView>
  );
}
