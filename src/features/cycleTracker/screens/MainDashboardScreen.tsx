import {
  createBottomTabNavigator,
  type BottomTabNavigationProp,
} from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native';

import { useAppData } from '../context/AppDataContext';
import { CycleProgressBar } from '../components/CycleProgressBar';
import { HomeHero } from '../components/HomeHero';
import { TrackingSetupPrompt } from '../components/TrackingSetupPrompt';
import { MedicalRemindersTab } from './MedicalRemindersTab';
import { PregnancyTab } from './PregnancyTab';
import { ProfileTab } from './ProfileTab';
import { StatsTab } from './StatsTab';
import { TrackingTab } from './TrackingTab';
import { useAppStyles, useColors } from '../../../styles/useAppStyles';

type RootStackParamList = { Home: undefined; DayEntry: undefined };
type TabParamList = { Suivi: undefined; Stats: undefined; Profil: undefined; RDV: undefined };

const Tab = createBottomTabNavigator<TabParamList>();

function SuiviScreen() {
  const styles = useAppStyles();
  const d = useAppData();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <ScrollView
      style={[{ flex: 1 }, styles.safeArea]}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <HomeHero
        subtitle={d.subtitle}
        primaryLabel={d.isPregnancyMode ? 'Semaine' : 'Jour de cycle'}
        primaryValue={
          d.isPregnancyMode
            ? (d.pregnancyDueDateLabel !== 'À renseigner' ? `S${d.pregnancyStage.week}` : 'À définir')
            : (d.hasCycleReference ? `J${d.todayCycleDay}` : 'À définir')
        }
        secondaryLabel={d.isPregnancyMode ? 'Trimestre' : 'Phase'}
        secondaryValue={
          d.isPregnancyMode
            ? (d.pregnancyDueDateLabel !== 'À renseigner' ? `${d.pregnancyStage.trimester}e` : 'À définir')
            : (d.hasCycleReference ? d.todayCyclePhase.shortLabel : 'À définir')
        }
        summaryLeftLabel={d.isPregnancyMode ? 'Date prévue' : 'Prochaines règles'}
        summaryLeftValue={d.nextPeriodValue}
        summaryLeftHint={d.nextPeriodHint}
        summaryRightLabel={d.isPregnancyMode ? 'Stade actuel' : 'Fenêtre fertile'}
        summaryRightValue={d.fertileValue}
        summaryRightHint={d.fertileHint}
      />

      {!d.isPregnancyMode && d.hasCycleReference && (
        <CycleProgressBar
          cycleDay={d.todayCycleDay}
          nextPeriodInDays={d.nextPeriodInDays}
          profile={d.estimatedProfile}
        />
      )}

      {d.shouldShowTrackingSetup && (
        <TrackingSetupPrompt
          profileForm={d.profileForm}
          trackingSetupMessage={d.trackingSetupMessage}
          onLastPeriodStartChange={d.onLastPeriodStartChange}
          onLastPeriodEndChange={d.onLastPeriodEndChange}
          onContinue={d.onContinueToTracking}
        />
      )}

      {d.isPregnancyMode ? (
        <PregnancyTab
          stage={d.pregnancyStage}
          dueDateLabel={d.pregnancyDueDateLabel}
          weeksRemainingLabel={d.pregnancyWeeksRemainingLabel}
          onOpenDayEntry={() => navigation.navigate('DayEntry')}
          onOpenAppointments={() => {
            const tabNav = navigation.getParent<BottomTabNavigationProp<TabParamList>>();
            tabNav?.navigate('RDV');
          }}
        />
      ) : (
        d.hasCycleReference && (
          <TrackingTab
            isProfileConfigured={d.isProfileConfigured}
            estimatedProfile={d.estimatedProfile}
            displayedPeriodLength={d.displayedPeriodLength}
            avgPain={d.avgPain}
            cyclePhase={d.cyclePhase}
            monthLabel={d.monthLabel}
            shiftMonth={d.shiftMonth}
            isPeriodSelectionMode={d.isPeriodSelectionMode}
            periodMarkMode={d.periodMarkMode}
            calendarFocusMode={d.calendarFocusMode}
            periodRangeAnchor={d.periodRangeAnchor}
            periodRangePreviewEnd={d.periodRangePreviewEnd}
            calendarWeeks={d.calendarWeeks}
            selectedDate={d.selectedDate}
            selectedMeta={d.selectedMeta}
            selectedRecord={d.selectedRecord}
            cycleDay={d.cycleDay}
            onToggleSelectionMode={d.onToggleSelectionMode}
            onSelectPeriodMarkMode={d.onSelectPeriodMarkMode}
            onSelectCalendarFocusMode={d.onSelectCalendarFocusMode}
            onCalendarDayPress={d.onCalendarDayPress}
            onConfirmRangePreview={d.onConfirmRangePreview}
            onClearRangePreview={d.onClearRangePreview}
            onSelectDay={d.onSelectDay}
            onOpenDayEntry={() => navigation.navigate('DayEntry')}
            getRelativeEnergyLabel={d.getRelativeEnergyLabel}
          />
        )
      )}
    </ScrollView>
  );
}

function StatsScreen() {
  const styles = useAppStyles();
  const d = useAppData();
  return (
    <ScrollView
      style={[{ flex: 1 }, styles.safeArea]}
      contentContainerStyle={styles.scrollContent}
    >
      <StatsTab
        isPregnancyMode={d.isPregnancyMode}
        pregnancyStage={d.pregnancyStage}
        pregnancyDueDateLabel={d.pregnancyDueDateLabel}
        trackedDays={d.trackedDays}
        periodDays={d.periodDays}
        avgSleep={d.avgSleep}
        avgPain={d.avgPain}
        estimatedProfile={d.estimatedProfile}
        displayedPeriodLength={d.displayedPeriodLength}
        hasCycleReference={d.hasCycleReference}
        todayCyclePhase={d.todayCyclePhase}
        dominantSymptoms={d.dominantSymptoms}
        flowDistribution={d.flowDistribution}
        flowAnomalies={d.flowAnomalies}
        monthComparison={d.monthComparison}
        painTrend={d.painTrend}
        monthlyHistory={d.monthlyHistory}
        recentRecords={d.recentRecords}
      />
    </ScrollView>
  );
}

function ProfilScreen() {
  const styles = useAppStyles();
  const c = useColors();
  const d = useAppData();
  return (
    <KeyboardAvoidingView
      style={[{ flex: 1 }, styles.safeArea]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View
          style={{
            marginHorizontal: 20,
            marginTop: 16,
            marginBottom: 4,
            backgroundColor: c.bgCard,
            borderRadius: 16,
            paddingHorizontal: 20,
            paddingVertical: 14,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderWidth: 1,
            borderColor: c.borderCard,
          }}
        >
          <Text style={{ color: c.textPrimary, fontSize: 15, fontWeight: '600' }}>
            {d.themeScheme === 'dark' ? 'Mode sombre' : 'Mode clair'}
          </Text>
          <Switch
            value={d.themeScheme === 'dark'}
            onValueChange={d.onToggleTheme}
            trackColor={{ false: c.borderCard, true: c.primary }}
            thumbColor={c.white}
          />
        </View>
        {d.isLockSupported && (
          <View
            style={{
              marginHorizontal: 20,
              marginTop: 10,
              marginBottom: 4,
              backgroundColor: c.bgCard,
              borderRadius: 16,
              paddingHorizontal: 20,
              paddingVertical: 14,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderWidth: 1,
              borderColor: c.borderCard,
            }}
          >
            <Text style={{ color: c.textPrimary, fontSize: 15, fontWeight: '600' }}>
              Verrouillage biométrique
            </Text>
            <Switch
              value={d.isLockEnabled}
              onValueChange={d.onToggleLock}
              trackColor={{ false: c.borderCard, true: c.primary }}
              thumbColor={c.white}
            />
          </View>
        )}
        <ProfileTab
          profileForm={d.profileForm}
          profileMessage={d.profileMessage}
          estimatedProfile={d.estimatedProfile}
          nextPeriodStart={d.nextPeriodStart}
          fertileWindow={d.fertileWindow}
          hasCycleReference={d.hasCycleReference}
          isPregnancyMode={d.isPregnancyMode}
          pregnancyStage={d.pregnancyStage}
          pregnancyDueDateLabel={d.pregnancyDueDateLabel}
          pregnancyWeeksRemainingLabel={d.pregnancyWeeksRemainingLabel}
          onProfileFieldChange={d.onProfileFieldChange}
          onFormatDateFieldChange={d.onFormatDateFieldChange}
          formatDateTyping={d.formatDateTyping}
          onSaveProfile={d.onSaveProfile}
          onSwitchTrackingMode={d.onSwitchTrackingMode}
          onReset={d.onReset}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Exporter mes données cycle au format CSV"
          style={[styles.secondaryAction, { marginHorizontal: 20, marginTop: 4 }]}
          onPress={() => void d.onExportData()}
        >
          <Text style={styles.secondaryActionText}>Exporter mes données (CSV)</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Importer des données cycle depuis un fichier CSV"
          style={[styles.secondaryAction, { marginHorizontal: 20, marginTop: 10, marginBottom: 32 }]}
          onPress={() => d.onImportData()}
        >
          <Text style={styles.secondaryActionText}>Importer des données (CSV)</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function RdvScreen() {
  const styles = useAppStyles();
  const d = useAppData();
  return (
    <KeyboardAvoidingView
      style={[{ flex: 1 }, styles.safeArea]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <MedicalRemindersTab
          medicalReminderForm={d.medicalReminderForm}
          medicalReminders={d.medicalReminders}
          medicalReminderMessage={d.medicalReminderMessage}
          onMedicalReminderFieldChange={d.onMedicalReminderFieldChange}
          formatDateTyping={d.formatDateTyping}
          onSaveMedicalReminder={d.onSaveMedicalReminder}
          onDeleteMedicalReminder={d.onDeleteMedicalReminder}
          onToggleMedicalReminderCompleted={d.onToggleMedicalReminderCompleted}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function MainDashboardScreen() {
  const { isPregnancyMode } = useAppData();
  const c = useColors();

  const tabIcon = (emoji: string) =>
    function TabIcon({ color }: { color: string }) {
      return <Text style={{ fontSize: 18, color }}>{emoji}</Text>;
    };

  return (
    <>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: c.bgCardAlt,
            borderTopColor: c.borderLight,
            borderTopWidth: 1,
          },
          tabBarActiveTintColor: c.primary,
          tabBarInactiveTintColor: c.textTertiary,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        }}
      >
        <Tab.Screen
          name="Suivi"
          component={SuiviScreen}
          options={{
            title: isPregnancyMode ? 'Grossesse' : 'Suivi',
            tabBarIcon: tabIcon(isPregnancyMode ? '🤰' : '📅'),
          }}
        />
        <Tab.Screen
          name="Stats"
          component={StatsScreen}
          options={{
            title: isPregnancyMode ? 'Repères' : 'Stats',
            tabBarIcon: tabIcon('📊'),
          }}
        />
        <Tab.Screen
          name="Profil"
          component={ProfilScreen}
          options={{ title: 'Profil', tabBarIcon: tabIcon('👤') }}
        />
        <Tab.Screen
          name="RDV"
          component={RdvScreen}
          options={{ title: 'RDV', tabBarIcon: tabIcon('🏥') }}
        />
      </Tab.Navigator>
    </>
  );
}
