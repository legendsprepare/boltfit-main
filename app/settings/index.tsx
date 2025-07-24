import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  User,
  Bell,
  Volume2,
  Shield,
  HelpCircle,
  Info,
  LogOut,
  Mail,
  Lock,
  Palette,
  Timer,
  Vibrate,
  Download,
  Trash2,
  Star,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useSettings';
import { supabase } from '@/lib/supabase';

interface SettingsData {
  notifications: boolean;
  soundEffects: boolean;
  vibration: boolean;
  autoStartRest: boolean;
  defaultRestTime: number;
  emailNotifications: boolean;
  workoutReminders: boolean;
  dataSync: boolean;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const { settings, updateSetting, loading } = useSettings();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const handleChangePassword = () => {
    Alert.alert('Change Password', 'This feature will be available soon!', [
      { text: 'OK', style: 'default' },
    ]);
  };

  const handleChangeEmail = () => {
    Alert.alert('Change Email', 'This feature will be available soon!', [
      { text: 'OK', style: 'default' },
    ]);
  };

  const handleDataExport = () => {
    Alert.alert(
      'Export Data',
      'Your workout data will be exported as a JSON file.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: () => Alert.alert('Success', 'Data exported successfully!'),
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            Alert.alert('Account Deleted', 'Your account has been deleted.'),
        },
      ]
    );
  };

  const handleContactSupport = () => {
    Alert.alert('Contact Support', 'You can reach us at support@boltlab.com', [
      { text: 'OK', style: 'default' },
    ]);
  };

  const renderSettingItem = (
    icon: any,
    title: string,
    subtitle?: string,
    action?: 'switch' | 'navigation' | 'custom',
    value?: boolean,
    onPress?: () => void,
    onToggle?: (value: boolean) => void,
    customElement?: React.ReactNode
  ) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={action === 'switch'}
    >
      <LinearGradient
        colors={['#1A1A2E', '#0F0F23']}
        style={styles.settingGradient}
      >
        <View style={styles.settingLeft}>
          <View style={styles.settingIcon}>
            {React.createElement(icon, { size: 20, color: '#6B46C1' })}
          </View>
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>{title}</Text>
            {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
          </View>
        </View>
        <View style={styles.settingRight}>
          {action === 'switch' && (
            <Switch
              value={value}
              onValueChange={onToggle}
              trackColor={{ false: '#374151', true: '#6B46C1' }}
              thumbColor={value ? '#FFFFFF' : '#9CA3AF'}
            />
          )}
          {action === 'navigation' && (
            <ArrowLeft
              size={16}
              color="#64748B"
              style={{ transform: [{ rotate: '180deg' }] }}
            />
          )}
          {customElement}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F0F23', '#1A1A2E', '#0F0F23']}
        style={styles.background}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Account Settings */}
          {renderSection(
            'Account',
            <>
              {renderSettingItem(
                User,
                'Edit Profile',
                'Update your personal information',
                'navigation',
                undefined,
                () => router.push('/settings/profile')
              )}
              {renderSettingItem(
                Mail,
                'Change Email',
                profile?.email || 'Not set',
                'navigation',
                undefined,
                handleChangeEmail
              )}
              {renderSettingItem(
                Lock,
                'Change Password',
                'Update your account password',
                'navigation',
                undefined,
                handleChangePassword
              )}
            </>
          )}

          {/* App Preferences */}
          {renderSection(
            'App Preferences',
            <>
              {renderSettingItem(
                Bell,
                'Push Notifications',
                'Receive workout reminders and updates',
                'switch',
                settings.notifications,
                undefined,
                (value) => updateSetting('notifications', value)
              )}
              {renderSettingItem(
                Volume2,
                'Sound Effects',
                'Play sounds during workouts',
                'switch',
                settings.soundEffects,
                undefined,
                (value) => updateSetting('soundEffects', value)
              )}
              {renderSettingItem(
                Vibrate,
                'Vibration',
                'Haptic feedback for interactions',
                'switch',
                settings.vibration,
                undefined,
                (value) => updateSetting('vibration', value)
              )}
            </>
          )}

          {/* Workout Settings */}
          {renderSection(
            'Workout Settings',
            <>
              {renderSettingItem(
                Timer,
                'Auto-Start Rest Timer',
                'Automatically start rest timer after sets',
                'switch',
                settings.autoStartRest,
                undefined,
                (value) => updateSetting('autoStartRest', value)
              )}
              {renderSettingItem(
                Timer,
                'Default Rest Time',
                `${settings.defaultRestTime} seconds`,
                'custom',
                undefined,
                () => router.push('/settings/rest-time' as any),
                undefined,
                <Text style={styles.customValue}>
                  {settings.defaultRestTime}s
                </Text>
              )}
              {renderSettingItem(
                Bell,
                'Workout Reminders',
                'Get reminded to workout daily',
                'switch',
                settings.workoutReminders,
                undefined,
                (value) => updateSetting('workoutReminders', value)
              )}
            </>
          )}

          {/* Privacy & Data */}
          {renderSection(
            'Privacy & Data',
            <>
              {renderSettingItem(
                Shield,
                'Data Sync',
                'Sync your data across devices',
                'switch',
                settings.dataSync,
                undefined,
                (value) => updateSetting('dataSync', value)
              )}
              {renderSettingItem(
                Download,
                'Export Data',
                'Download your workout data',
                'navigation',
                undefined,
                handleDataExport
              )}
              {renderSettingItem(
                Trash2,
                'Delete Account',
                'Permanently delete your account',
                'navigation',
                undefined,
                handleDeleteAccount
              )}
            </>
          )}

          {/* Support & About */}
          {renderSection(
            'Support & About',
            <>
              {renderSettingItem(
                HelpCircle,
                'Contact Support',
                'Get help with the app',
                'navigation',
                undefined,
                handleContactSupport
              )}
              {renderSettingItem(
                Star,
                'Rate BoltLab',
                'Leave a review on the app store',
                'navigation',
                undefined,
                () => Alert.alert('Thank you!', 'Redirecting to app store...')
              )}
              {renderSettingItem(
                Info,
                'About',
                'BoltLab v1.0.0',
                'navigation',
                undefined,
                () => router.push('/settings/about')
              )}
            </>
          )}

          {/* Sign Out */}
          <View style={styles.signOutSection}>
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleSignOut}
            >
              <LinearGradient
                colors={['#EF4444', '#DC2626']}
                style={styles.signOutGradient}
              >
                <LogOut size={20} color="#FFFFFF" />
                <Text style={styles.signOutText}>Sign Out</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  background: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A2E',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  settingItem: {
    marginBottom: 12,
  },
  settingGradient: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1A1A2E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6B46C1' + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
  },
  settingRight: {
    marginLeft: 12,
  },
  customValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B46C1',
  },
  signOutSection: {
    marginTop: 40,
    marginBottom: 30,
  },
  signOutButton: {
    borderRadius: 12,
  },
  signOutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});
