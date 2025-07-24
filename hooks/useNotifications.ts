import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useSettings } from './useSettings';

// Configure how notifications are handled when the app is running
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function useNotifications() {
  const [hasPermission, setHasPermission] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const { settings } = useSettings();

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6B46C1',
      });
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      setHasPermission(false);
      return;
    }

    setHasPermission(true);

    // Get the push token
    try {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      setExpoPushToken(token);
    } catch (error) {
      console.log('Error getting push token:', error);
    }
  };

  const scheduleRestEndNotification = async (remainingSeconds: number) => {
    if (!hasPermission || !settings.notifications) return;

    // Cancel any existing rest notifications
    await Notifications.cancelScheduledNotificationAsync('rest-ending');

    if (remainingSeconds <= 10) return; // Don't schedule if less than 10 seconds left

    // Schedule notification 10 seconds before rest ends
    const triggerTime = Math.max(1, remainingSeconds - 10);

    await Notifications.scheduleNotificationAsync({
      identifier: 'rest-ending',
      content: {
        title: '⚡ BoltLab Rest Timer',
        body: 'Your rest break is almost over! Get ready for the next set.',
        sound: settings.soundEffects ? 'default' : false,
        data: { type: 'rest-ending' },
      },
      trigger: {
        seconds: triggerTime,
      },
    });
  };

  const scheduleRestCompleteNotification = async (restSeconds: number) => {
    if (!hasPermission || !settings.notifications) return;

    await Notifications.scheduleNotificationAsync({
      identifier: 'rest-complete',
      content: {
        title: '🔥 Rest Complete!',
        body: "Time's up! Ready for your next set?",
        sound: settings.soundEffects ? 'default' : false,
        data: { type: 'rest-complete' },
      },
      trigger: {
        seconds: restSeconds,
      },
    });
  };

  const scheduleStreakReminderNotification = async (
    lastWorkoutDate: string | null
  ) => {
    if (!hasPermission || !settings.workoutReminders) return;

    // Cancel existing streak reminders
    await Notifications.cancelScheduledNotificationAsync('streak-reminder');
    await Notifications.cancelScheduledNotificationAsync('streak-urgent');

    if (!lastWorkoutDate) return;

    const lastWorkout = new Date(lastWorkoutDate);
    const now = new Date();
    const daysSinceWorkout = Math.floor(
      (now.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceWorkout === 0) {
      // Worked out today, schedule reminder for tomorrow evening
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(18, 0, 0, 0); // 6 PM tomorrow

      await Notifications.scheduleNotificationAsync({
        identifier: 'streak-reminder',
        content: {
          title: '⚡ Keep Your Lightning Streak!',
          body: 'Ready for another electrifying workout? Your streak is counting on you!',
          sound: settings.soundEffects ? 'default' : false,
          data: { type: 'streak-reminder' },
        },
        trigger: tomorrow,
      });
    } else if (daysSinceWorkout === 1) {
      // One rest day, remind them they can take one more but should workout tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0); // 10 AM tomorrow

      await Notifications.scheduleNotificationAsync({
        identifier: 'streak-urgent',
        content: {
          title: '🚨 Streak Alert!',
          body: 'Your lightning streak needs you! One more rest day and your streak will reset.',
          sound: settings.soundEffects ? 'default' : false,
          data: { type: 'streak-urgent' },
        },
        trigger: tomorrow,
      });
    }
  };

  const scheduleDailyWorkoutReminder = async () => {
    if (!hasPermission || !settings.workoutReminders) return;

    // Cancel existing daily reminders
    await Notifications.cancelScheduledNotificationAsync('daily-reminder');

    // Schedule daily reminder at 6 PM
    await Notifications.scheduleNotificationAsync({
      identifier: 'daily-reminder',
      content: {
        title: '⚡ BoltLab Daily Charge',
        body: 'Time to energize your day with a lightning workout!',
        sound: settings.soundEffects ? 'default' : false,
        data: { type: 'daily-reminder' },
      },
      trigger: {
        hour: 18,
        minute: 0,
        repeats: true,
      },
    });
  };

  const cancelRestNotifications = async () => {
    await Notifications.cancelScheduledNotificationAsync('rest-ending');
    await Notifications.cancelScheduledNotificationAsync('rest-complete');
  };

  const cancelAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  return {
    hasPermission,
    expoPushToken,
    requestPermissions,
    scheduleRestEndNotification,
    scheduleRestCompleteNotification,
    scheduleStreakReminderNotification,
    scheduleDailyWorkoutReminder,
    cancelRestNotifications,
    cancelAllNotifications,
  };
}
