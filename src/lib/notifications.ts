import { Platform } from 'react-native';

const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

async function getNotifications() {
  if (!isMobile) return null;
  return import('expo-notifications');
}

async function getDevice() {
  if (!isMobile) return null;
  return import('expo-device');
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!isMobile) return false;

  try {
    const [Notifications, Device] = await Promise.all([getNotifications(), getDevice()]);
    if (!Notifications || !Device) return false;
    if (!Device.isDevice) return false;

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'BaddieBlood',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    if (existingStatus === 'granted') return true;

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function schedulePeriodReminder(
  periodStartIso: string,
  daysInAdvance = 2
): Promise<string | null> {
  if (!isMobile) return null;

  try {
    const Notifications = await getNotifications();
    if (!Notifications) return null;

    const [year, month, day] = periodStartIso.split('-').map(Number);
    const triggerDate = new Date(year, month - 1, day - daysInAdvance, 9, 0, 0);
    if (triggerDate <= new Date()) return null;

    return await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Règles prévues bientôt',
        body: `Tes prochaines règles sont estimées dans ${daysInAdvance} jours.`,
        data: { type: 'period-reminder' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });
  } catch {
    return null;
  }
}

export async function scheduleAppointmentReminder(
  reminderDateIso: string,
  title: string,
  notes?: string
): Promise<string | null> {
  if (!isMobile || !reminderDateIso) return null;

  try {
    const Notifications = await getNotifications();
    if (!Notifications) return null;

    const [year, month, day] = reminderDateIso.split('-').map(Number);
    const triggerDate = new Date(year, month - 1, day, 9, 0, 0);
    if (triggerDate <= new Date()) return null;

    return await Notifications.scheduleNotificationAsync({
      content: {
        title: `Rappel : ${title}`,
        body: notes || "Tu as un rendez-vous médical prévu. Vérifie tes notes dans l'app.",
        data: { type: 'appointment-reminder' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });
  } catch {
    return null;
  }
}

export async function cancelNotification(id: string | null | undefined): Promise<void> {
  if (!isMobile || !id) return;
  try {
    const Notifications = await getNotifications();
    await Notifications?.cancelScheduledNotificationAsync(id);
  } catch {
    // already fired or cancelled
  }
}

export async function cancelAllNotifications(): Promise<void> {
  if (!isMobile) return;
  try {
    const Notifications = await getNotifications();
    await Notifications?.cancelAllScheduledNotificationsAsync();
  } catch {
    // ignore
  }
}
