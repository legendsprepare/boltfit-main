import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppSettings {
  // Notifications
  notifications: boolean;
  emailNotifications: boolean;
  workoutReminders: boolean;

  // Audio & Haptics
  soundEffects: boolean;
  vibration: boolean;

  // Workout Settings
  autoStartRest: boolean;
  defaultRestTime: number;
  autoAdvanceExercise: boolean;

  // Display
  theme: 'dark' | 'light' | 'auto';

  // Data & Privacy
  dataSync: boolean;
  analyticsEnabled: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  notifications: true,
  emailNotifications: true,
  workoutReminders: true,
  soundEffects: true,
  vibration: true,
  autoStartRest: true,
  defaultRestTime: 120,
  autoAdvanceExercise: false,
  theme: 'dark',
  dataSync: true,
  analyticsEnabled: true,
};

const SETTINGS_STORAGE_KEY = '@boltlab_settings';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        // Merge with defaults to handle any new settings added in updates
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // Use default settings on error
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: AppSettings) => {
    try {
      await AsyncStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(newSettings)
      );
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  };

  const updateSetting = async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    await saveSettings(newSettings);
  };

  const resetSettings = async () => {
    await saveSettings(DEFAULT_SETTINGS);
  };

  const exportSettings = () => {
    return JSON.stringify(settings, null, 2);
  };

  const importSettings = async (settingsJson: string) => {
    try {
      const importedSettings = JSON.parse(settingsJson);
      // Validate and merge with defaults
      const validatedSettings = { ...DEFAULT_SETTINGS, ...importedSettings };
      await saveSettings(validatedSettings);
      return true;
    } catch (error) {
      console.error('Error importing settings:', error);
      return false;
    }
  };

  return {
    settings,
    loading,
    updateSetting,
    resetSettings,
    exportSettings,
    importSettings,
    refresh: loadSettings,
  };
}
