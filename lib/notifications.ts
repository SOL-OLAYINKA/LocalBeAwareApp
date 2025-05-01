import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Notification Categories
export type NotificationType = 'hydration' | 'breathing' | 'mood' | 'cycle';

interface NotificationSchedule {
  type: NotificationType;
  hour: number;
  minute: number;
  sound: string;
  title: string;
  body: string;
}

const NOTIFICATION_SCHEDULES: NotificationSchedule[] = [
  {
    type: 'hydration',
    hour: 9,
    minute: 0,
    sound: 'GentleBell.mp3',
    title: '💧 Hydration Time',
    body: 'Drink water today to stay energized.',
  },
  {
    type: 'breathing',
    hour: 21,
    minute: 0,
    sound: 'ChimeBreeze.mp3',
    title: '🌙 Mindful Moment',
    body: 'Take 5 deep breaths before bed.',
  },
  {
    type: 'mood',
    hour: 10,
    minute: 0,
    sound: 'SoftPulse.mp3',
    title: '❤️ Mood Check-in',
    body: 'Track your mood—it matters.',
  },
];

export async function initializeNotifications() {
  if (Platform.OS === 'web') return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleNotification(type: NotificationType): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  const schedule = NOTIFICATION_SCHEDULES.find(s => s.type === type);
  if (!schedule) return null;

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: schedule.title,
        body: schedule.body,
        sound: schedule.sound,
      },
      trigger: {
        hour: schedule.hour,
        minute: schedule.minute,
        repeats: true,
      },
    });
    return id;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
}

export async function cancelNotification(type: NotificationType) {
  if (Platform.OS === 'web') return;

  try {
    await Notifications.cancelScheduledNotificationAsync(type);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
}

export async function scheduleCyclePhaseNotification(phase: string, date: Date) {
  if (Platform.OS === 'web') return;

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📅 Cycle Phase Update',
        body: `You're entering your ${phase} phase.`,
        sound: 'GentleBell.mp3',
      },
      trigger: date,
    });
  } catch (error) {
    console.error('Error scheduling cycle phase notification:', error);
  }
}