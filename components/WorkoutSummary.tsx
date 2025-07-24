import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Trophy,
  Clock,
  Zap,
  Target,
  CircleCheck as CheckCircle,
} from 'lucide-react-native';
import { CompletedWorkout } from '@/types/workout';
import LightningAvatar from './LightningAvatar';

interface WorkoutSummaryProps {
  workout: CompletedWorkout;
  onClose: () => void;
  onSaveWorkout: () => void;
}

export default function WorkoutSummary({
  workout,
  onClose,
  onSaveWorkout,
}: WorkoutSummaryProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const handleSave = () => {
    onSaveWorkout();
    onClose();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F0F23', '#1A1A2E', '#0F0F23']}
        style={styles.background}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.celebrationContainer}>
              <LightningAvatar
                level="bolt"
                xp={75}
                maxXp={100}
                color="purple"
                size="large"
                showStats={false}
                isActive={true}
              />
            </View>
            <Text style={styles.title}>Workout Complete!</Text>
            <Text style={styles.subtitle}>Lightning strikes again! ⚡</Text>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsContainer}>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <LinearGradient
                  colors={['#1A1A2E', '#0F0F23']}
                  style={styles.statGradient}
                >
                  <View style={styles.statIcon}>
                    <Clock size={24} color="#3B82F6" />
                  </View>
                  <Text style={styles.statValue}>
                    {formatDuration(workout.duration)}
                  </Text>
                  <Text style={styles.statLabel}>Duration</Text>
                </LinearGradient>
              </View>

              <View style={styles.statCard}>
                <LinearGradient
                  colors={['#1A1A2E', '#0F0F23']}
                  style={styles.statGradient}
                >
                  <View style={styles.statIcon}>
                    <Target size={24} color="#10B981" />
                  </View>
                  <Text style={styles.statValue}>{workout.totalSets}</Text>
                  <Text style={styles.statLabel}>Sets</Text>
                </LinearGradient>
              </View>

              <View style={styles.statCard}>
                <LinearGradient
                  colors={['#1A1A2E', '#0F0F23']}
                  style={styles.statGradient}
                >
                  <View style={styles.statIcon}>
                    <Zap size={24} color="#F59E0B" />
                  </View>
                  <Text style={styles.statValue}>
                    {workout.exercises.length}
                  </Text>
                  <Text style={styles.statLabel}>Exercises</Text>
                </LinearGradient>
              </View>

              <View style={styles.statCard}>
                <LinearGradient
                  colors={['#1A1A2E', '#0F0F23']}
                  style={styles.statGradient}
                >
                  <View style={styles.statIcon}>
                    <Trophy size={24} color="#6B46C1" />
                  </View>
                  <Text style={styles.statValue}>+{workout.xpGained}</Text>
                  <Text style={styles.statLabel}>XP Gained</Text>
                </LinearGradient>
              </View>
            </View>
          </View>

          {/* Exercises Completed */}
          <View style={styles.exercisesSection}>
            <Text style={styles.sectionTitle}>Exercises Completed</Text>
            <View style={styles.exercisesList}>
              {workout.exercises.map((exercise, index) => (
                <View key={exercise.id} style={styles.exerciseItem}>
                  <LinearGradient
                    colors={['#1A1A2E', '#0F0F23']}
                    style={styles.exerciseGradient}
                  >
                    <View style={styles.exerciseLeft}>
                      <View style={styles.exerciseCheck}>
                        <CheckCircle size={20} color="#10B981" />
                      </View>
                      <View style={styles.exerciseInfo}>
                        <Text style={styles.exerciseName}>{exercise.name}</Text>
                        <Text style={styles.exerciseMuscle}>
                          {exercise.muscleGroup}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.exerciseNumber}>
                      <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                    </View>
                  </LinearGradient>
                </View>
              ))}
            </View>
          </View>

          {/* XP Celebration */}
          <View style={styles.xpSection}>
            <TouchableOpacity style={styles.xpCard}>
              <LinearGradient
                colors={['#6B46C1', '#8B5CF6']}
                style={styles.xpGradient}
              >
                <View style={styles.xpContent}>
                  <Zap size={32} color="#FFFFFF" />
                  <Text style={styles.xpTitle}>Lightning Power Gained!</Text>
                  <Text style={styles.xpAmount}>+{workout.xpGained} XP</Text>
                  <Text style={styles.xpSubtitle}>
                    Your avatar grows stronger!
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <LinearGradient
                colors={['#6B46C1', '#8B5CF6']}
                style={styles.saveButtonGradient}
              >
                <Trophy size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Save Workout</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  celebrationContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
  },
  statsContainer: {
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: 16,
  },
  statGradient: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1A1A2E',
    alignItems: 'center',
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0F0F23',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#94A3B8',
  },
  exercisesSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  exercisesList: {
    maxHeight: 200,
  },
  exerciseItem: {
    marginBottom: 12,
  },
  exerciseGradient: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1A1A2E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exerciseCheck: {
    marginRight: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  exerciseMuscle: {
    fontSize: 14,
    color: '#94A3B8',
  },
  exerciseNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#6B46C1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  xpSection: {
    marginBottom: 30,
  },
  xpCard: {
    marginBottom: 16,
  },
  xpGradient: {
    borderRadius: 20,
    padding: 24,
  },
  xpContent: {
    alignItems: 'center',
  },
  xpTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 8,
  },
  xpAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  xpSubtitle: {
    fontSize: 16,
    color: '#E2E8F0',
    textAlign: 'center',
  },
  actionsContainer: {
    marginBottom: 30,
  },
  saveButton: {
    marginBottom: 16,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  closeButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B46C1',
  },
});
