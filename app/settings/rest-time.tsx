import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Minus, Plus, Save } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';

const REST_TIME_OPTIONS = [30, 45, 60, 75, 90, 120, 150, 180, 240, 300];

export default function RestTimeScreen() {
  const router = useRouter();
  const { settings, updateSetting } = useSettings();
  const [selectedTime, setSelectedTime] = useState(settings.defaultRestTime);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setHasChanges(selectedTime !== settings.defaultRestTime);
  }, [selectedTime, settings.defaultRestTime]);

  const handleSave = async () => {
    try {
      await updateSetting('defaultRestTime', selectedTime);
      Alert.alert('Success', 'Rest time updated successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update rest time. Please try again.');
    }
  };

  const adjustTime = (increment: number) => {
    const newTime = Math.max(15, Math.min(600, selectedTime + increment));
    setSelectedTime(newTime);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes === 0) {
      return `${seconds}s`;
    } else if (remainingSeconds === 0) {
      return `${minutes}m`;
    } else {
      return `${minutes}m ${remainingSeconds}s`;
    }
  };

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
          <Text style={styles.headerTitle}>Rest Time</Text>
          <TouchableOpacity
            style={[styles.saveButton, hasChanges && styles.saveButtonActive]}
            onPress={handleSave}
            disabled={!hasChanges}
          >
            <Save size={20} color={hasChanges ? '#FFFFFF' : '#64748B'} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Current Time Display */}
          <View style={styles.timeDisplay}>
            <Text style={styles.timeLabel}>Default Rest Time</Text>
            <Text style={styles.timeValue}>{formatTime(selectedTime)}</Text>
            <Text style={styles.timeDescription}>
              Time between sets during workouts
            </Text>
          </View>

          {/* Custom Adjuster */}
          <View style={styles.adjusterSection}>
            <Text style={styles.sectionTitle}>Custom Time</Text>
            <View style={styles.adjusterCard}>
              <LinearGradient
                colors={['#1A1A2E', '#0F0F23']}
                style={styles.adjusterGradient}
              >
                <TouchableOpacity
                  style={styles.adjustButton}
                  onPress={() => adjustTime(-15)}
                >
                  <Minus size={20} color="#6B46C1" />
                </TouchableOpacity>

                <View style={styles.timeContainer}>
                  <Text style={styles.currentTime}>{selectedTime}</Text>
                  <Text style={styles.timeUnit}>seconds</Text>
                </View>

                <TouchableOpacity
                  style={styles.adjustButton}
                  onPress={() => adjustTime(15)}
                >
                  <Plus size={20} color="#6B46C1" />
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>

          {/* Quick Options */}
          <View style={styles.quickSection}>
            <Text style={styles.sectionTitle}>Quick Options</Text>
            <View style={styles.optionsGrid}>
              {REST_TIME_OPTIONS.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.optionButton,
                    selectedTime === time && styles.selectedOption,
                  ]}
                  onPress={() => setSelectedTime(time)}
                >
                  <LinearGradient
                    colors={
                      selectedTime === time
                        ? ['#6B46C1', '#8B5CF6']
                        : ['#1A1A2E', '#0F0F23']
                    }
                    style={styles.optionGradient}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedTime === time && styles.selectedOptionText,
                      ]}
                    >
                      {formatTime(time)}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Info */}
          <View style={styles.infoSection}>
            <Text style={styles.infoText}>
              Rest time can be adjusted during workouts. This sets your default
              preference.
            </Text>
          </View>
        </View>
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
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonActive: {
    backgroundColor: '#6B46C1',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  timeDisplay: {
    alignItems: 'center',
    marginBottom: 40,
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 8,
  },
  timeValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  timeDescription: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  adjusterSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  adjusterCard: {
    marginBottom: 16,
  },
  adjusterGradient: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1A1A2E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  adjustButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6B46C1' + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeContainer: {
    alignItems: 'center',
  },
  currentTime: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  timeUnit: {
    fontSize: 14,
    color: '#94A3B8',
  },
  quickSection: {
    marginBottom: 30,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionButton: {
    width: '30%',
    marginBottom: 12,
  },
  selectedOption: {
    transform: [{ scale: 1.02 }],
  },
  optionGradient: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1A1A2E',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  infoSection: {
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
});
