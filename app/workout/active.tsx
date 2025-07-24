import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Clock,
  Target,
  Zap,
  MessageCircle,
} from 'lucide-react-native';
import {
  Exercise,
  ActiveWorkout,
  WorkoutSet,
  CompletedWorkout,
} from '@/types/workout';
import { exerciseLibrary } from '@/data/exercises';
import SetTracker from '@/components/SetTracker';
import RestTimer from '@/components/RestTimer';
import WorkoutSummary from '@/components/WorkoutSummary';
import BoltChat from '@/components/BoltChat';
import { useSupabaseWorkouts } from '@/hooks/useSupabaseWorkouts';
import {
  useSupabaseGamification,
  calculateWorkoutXP,
} from '@/hooks/useSupabaseGamification';
import { useAuth } from '@/hooks/useAuth';

// Extended Exercise interface for AI-generated workouts
interface GeneratedExercise extends Exercise {
  generatedSets?: number;
  generatedReps?: number;
  generatedWeight?: number;
}

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { saveWorkout } = useSupabaseWorkouts();
  const { completeWorkout } = useSupabaseGamification();
  const { loadProfile, user } = useAuth();

  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(
    null
  );
  const [currentExercise, setCurrentExercise] =
    useState<GeneratedExercise | null>(null);
  const [currentSetNumber, setCurrentSetNumber] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [completedWorkout, setCompletedWorkout] =
    useState<CompletedWorkout | null>(null);
  const [generatedWorkoutData, setGeneratedWorkoutData] = useState<any>(null); // Store original generated workout data
  const [showFullOverview, setShowFullOverview] = useState(false); // State for full overview visibility
  const [showBoltChat, setShowBoltChat] = useState(false);

  useEffect(() => {
    if (params.exerciseId) {
      const exercise = exerciseLibrary.find(
        (ex) => ex.id === params.exerciseId
      );
      if (exercise) {
        startWorkout([exercise]);
      }
    } else if (params.workoutData) {
      // Handle AI-generated workout
      const workoutData = JSON.parse(params.workoutData as string);
      console.log('Received workout data:', workoutData);

      // Store the original generated workout data
      setGeneratedWorkoutData(workoutData);

      const exercises = workoutData.exercises.map((ex: any) => ({
        id: ex.id,
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        equipment: ex.equipment,
        description: ex.instructions,
        category: 'strength' as const,
        // Store the generated parameters for this exercise
        generatedSets: ex.sets,
        generatedReps: ex.reps,
        generatedWeight: ex.weight,
      }));
      startWorkout(exercises);
    } else if (params.customWorkoutData) {
      // Handle custom workout
      const customWorkout = JSON.parse(params.customWorkoutData as string);
      const exercises = customWorkout.exercises.map((ex: any) => ex.exercise);
      startWorkout(exercises);
    }
  }, [params.exerciseId, params.workoutData, params.customWorkoutData]);

  const startWorkout = (exercises: GeneratedExercise[]) => {
    const workout: ActiveWorkout = {
      id: Date.now().toString(),
      startTime: new Date(),
      exercises,
      sets: [],
      currentExerciseIndex: 0,
      currentSetIndex: 0,
      isResting: false,
      restTimeRemaining: 0,
    };

    setActiveWorkout(workout);
    setCurrentExercise(exercises[0]);
  };

  const completeSet = (weight: number, reps: number) => {
    if (!activeWorkout || !currentExercise) return;

    const newSet: WorkoutSet = {
      id: Date.now().toString(),
      exerciseId: currentExercise.id,
      weight,
      reps,
      completed: true,
    };

    const updatedSets = [...activeWorkout.sets, newSet];

    // Count completed sets for current exercise
    const completedSetsForCurrentExercise = updatedSets.filter(
      (set) => set.exerciseId === currentExercise.id && set.completed
    ).length;

    // Get recommended sets for current exercise (from AI generation or default to 3)
    const recommendedSets =
      (currentExercise as GeneratedExercise).generatedSets || 3;

    const currentIndex = activeWorkout.currentExerciseIndex;

    setActiveWorkout({
      ...activeWorkout,
      sets: updatedSets,
      currentExerciseIndex: currentIndex, // Keep tracking index
    });

    // Check if we've completed all recommended sets for this exercise
    if (completedSetsForCurrentExercise >= recommendedSets) {
      // Auto-advance to next exercise
      const nextIndex = currentIndex + 1;

      if (nextIndex < activeWorkout.exercises.length) {
        // Move to next exercise
        setCurrentExercise(
          activeWorkout.exercises[nextIndex] as GeneratedExercise
        );
        setCurrentSetNumber(1);
        setIsResting(false);

        // Update the current exercise index
        setActiveWorkout((prev) =>
          prev
            ? {
                ...prev,
                currentExerciseIndex: nextIndex,
              }
            : null
        );
      } else {
        // All exercises completed
        finishWorkout();
      }
    } else {
      // Start rest period for next set of same exercise
      setCurrentSetNumber(currentSetNumber + 1);
      setIsResting(true);
    }
  };

  const skipRest = () => {
    setIsResting(false);
  };

  const completeRest = () => {
    setIsResting(false);
  };

  const finishWorkout = () => {
    if (!activeWorkout) return;

    const endTime = new Date();
    const duration = Math.round(
      (endTime.getTime() - activeWorkout.startTime.getTime()) / (1000 * 60)
    );
    const totalSets = activeWorkout.sets.length;

    // Use centralized XP calculation
    const xpGained = calculateWorkoutXP(
      totalSets,
      duration,
      activeWorkout.exercises.length
    );

    const workout: CompletedWorkout = {
      id: activeWorkout.id,
      date: activeWorkout.startTime,
      duration,
      exercises: activeWorkout.exercises,
      totalSets,
      xpGained,
    };

    setCompletedWorkout(workout);
    setShowSummary(true);
  };

  const handleSaveWorkout = async () => {
    if (completedWorkout) {
      try {
        console.log('Saving workout and awarding XP...');
        console.log('Workout XP shown in summary:', completedWorkout.xpGained);

        // Save to Supabase
        await saveWorkout({
          duration: completedWorkout.duration,
          exercises: completedWorkout.exercises,
          total_sets: completedWorkout.totalSets,
          xp_gained: completedWorkout.xpGained, // Make sure this matches the UI
        });

        // Update gamification stats and await completion
        const result = await completeWorkout(
          completedWorkout.exercises.map((ex) => ex.id),
          completedWorkout.duration,
          completedWorkout.totalSets
        );

        console.log('Workout saved and XP awarded:', result);
        console.log(
          'XP from UI:',
          completedWorkout.xpGained,
          'XP from gamification:',
          result.xpGained
        );

        // Verify they match
        if (completedWorkout.xpGained !== result.xpGained) {
          console.warn(
            'XP MISMATCH! UI shows:',
            completedWorkout.xpGained,
            'but awarded:',
            result.xpGained
          );
        }

        // Reload the profile to get updated XP and level
        if (loadProfile && user) {
          await loadProfile(user.id);
        }
      } catch (error) {
        console.error('Error saving workout:', error);
      }
    }
  };

  const handleEndWorkout = () => {
    Alert.alert('End Workout', 'Are you sure you want to end this workout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'End Workout', style: 'destructive', onPress: finishWorkout },
    ]);
  };

  const getPreviousSet = (): WorkoutSet | undefined => {
    if (!activeWorkout || !currentExercise) return undefined;

    const exerciseSets = activeWorkout.sets.filter(
      (set) => set.exerciseId === currentExercise.id
    );
    return exerciseSets[exerciseSets.length - 1];
  };

  const getCompletedSetsForExercise = (exerciseId: string): number => {
    if (!activeWorkout) return 0;
    return activeWorkout.sets.filter(
      (set) => set.exerciseId === exerciseId && set.completed
    ).length;
  };

  const getRecommendedSetsForExercise = (
    exercise: GeneratedExercise
  ): number => {
    return exercise.generatedSets || 3;
  };

  const isExerciseCompleted = (exercise: GeneratedExercise): boolean => {
    const completed = getCompletedSetsForExercise(exercise.id);
    const recommended = getRecommendedSetsForExercise(exercise);
    return completed >= recommended;
  };

  const getCurrentExerciseIndex = (): number => {
    if (!activeWorkout || !currentExercise) return 0;
    return activeWorkout.exercises.findIndex(
      (ex) => ex.id === currentExercise.id
    );
  };

  const getWorkoutDuration = () => {
    if (!activeWorkout) return '0:00';

    const now = new Date();
    const duration = Math.floor(
      (now.getTime() - activeWorkout.startTime.getTime()) / 1000
    );
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleWorkoutModified = (modifiedWorkout: any) => {
    // Update the active workout with modified exercises
    if (activeWorkout) {
      const updatedWorkout = {
        ...activeWorkout,
        exercises: modifiedWorkout.exercises,
      };
      setActiveWorkout(updatedWorkout);

      // Update generated workout data for context
      setGeneratedWorkoutData(modifiedWorkout);

      console.log('Active workout modified by Bolt:', modifiedWorkout);
    }
  };

  if (showSummary && completedWorkout) {
    return (
      <WorkoutSummary
        workout={completedWorkout}
        onClose={() => router.replace('/(tabs)')} // Navigate to home instead of back
        onSaveWorkout={handleSaveWorkout}
      />
    );
  }

  if (!activeWorkout || !currentExercise) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading workout...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Active Workout</Text>
            <Text style={styles.headerSubtitle}>{getWorkoutDuration()}</Text>
          </View>
          <TouchableOpacity style={styles.endButton} onPress={handleEndWorkout}>
            <Text style={styles.endButtonText}>End</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Current Exercise */}
          {currentExercise && (
            <View style={styles.currentExerciseSection}>
              <Text style={styles.sectionTitle}>Current Exercise</Text>
              <View style={styles.exerciseCard}>
                <LinearGradient
                  colors={['#1A1A2E', '#0F0F23']}
                  style={styles.exerciseGradient}
                >
                  {/* Exercise Image */}
                  {currentExercise.images?.demonstration && (
                    <View style={styles.exerciseImageContainer}>
                      <Image
                        source={{ uri: currentExercise.images.demonstration }}
                        style={styles.exerciseImage}
                        resizeMode="cover"
                        onError={() =>
                          console.log('Failed to load exercise image')
                        }
                      />
                      {/* Difficulty indicator overlay */}
                      {currentExercise.difficulty && (
                        <View
                          style={[
                            styles.difficultyBadge,
                            {
                              backgroundColor:
                                currentExercise.difficulty === 'beginner'
                                  ? '#10B981'
                                  : currentExercise.difficulty ===
                                    'intermediate'
                                  ? '#F59E0B'
                                  : '#EF4444',
                            },
                          ]}
                        >
                          <Text style={styles.difficultyText}>
                            {currentExercise.difficulty
                              .charAt(0)
                              .toUpperCase() +
                              currentExercise.difficulty.slice(1)}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  <View style={styles.exerciseHeader}>
                    <Text style={styles.exerciseName}>
                      {currentExercise.name}
                    </Text>
                    <Text style={styles.exerciseDetails}>
                      {currentExercise.muscleGroup} •{' '}
                      {currentExercise.equipment}
                    </Text>
                    {/* Target muscles */}
                    {currentExercise.targetMuscles &&
                      currentExercise.targetMuscles.length > 0 && (
                        <Text style={styles.targetMuscles}>
                          Targets:{' '}
                          {currentExercise.targetMuscles.slice(0, 2).join(', ')}
                          {currentExercise.targetMuscles.length > 2 &&
                            ` +${
                              currentExercise.targetMuscles.length - 2
                            } more`}
                        </Text>
                      )}
                  </View>
                  <Text style={styles.exerciseDescription}>
                    {currentExercise.description}
                  </Text>

                  {/* Quick instruction hint */}
                  {currentExercise.instructions?.setup &&
                    currentExercise.instructions.setup.length > 0 && (
                      <View style={styles.quickTipContainer}>
                        <Text style={styles.quickTipLabel}>Quick Setup:</Text>
                        <Text style={styles.quickTipText}>
                          {currentExercise.instructions.setup[0]}
                        </Text>
                      </View>
                    )}
                </LinearGradient>
              </View>

              {/* Set Tracker */}
              <SetTracker
                setNumber={currentSetNumber}
                onCompleteSet={completeSet}
                previousSet={getPreviousSet()}
                exerciseType={currentExercise.category}
                exerciseData={currentExercise}
                generatedSets={
                  (currentExercise as GeneratedExercise).generatedSets
                }
                generatedReps={
                  (currentExercise as GeneratedExercise).generatedReps
                }
                generatedWeight={
                  (currentExercise as GeneratedExercise).generatedWeight
                }
              />
            </View>
          )}

          {/* Rest Timer */}
          {isResting && (
            <View style={styles.restTimerSection}>
              <RestTimer
                onComplete={completeRest}
                onSkip={skipRest}
                isActive={true}
              />
            </View>
          )}

          {/* Next Exercises Section */}
          {activeWorkout && activeWorkout.exercises.length > 1 && (
            <View style={styles.nextExercisesSection}>
              <Text style={styles.sectionTitle}>
                Next Exercises (
                {activeWorkout.exercises.length -
                  (getCurrentExerciseIndex() + 1)}{' '}
                remaining)
              </Text>

              {/* Show next 3 exercises */}
              {activeWorkout.exercises
                .slice(
                  getCurrentExerciseIndex() + 1,
                  getCurrentExerciseIndex() + 4
                )
                .map((exercise, index) => {
                  const actualIndex = getCurrentExerciseIndex() + 1 + index;
                  const completedSets = getCompletedSetsForExercise(
                    exercise.id
                  );
                  const recommendedSets = getRecommendedSetsForExercise(
                    exercise as GeneratedExercise
                  );

                  return (
                    <View key={exercise.id} style={styles.nextExerciseCard}>
                      <LinearGradient
                        colors={['#1A1A2E', '#0F0F23']}
                        style={styles.nextExerciseGradient}
                      >
                        <View style={styles.nextExerciseHeader}>
                          <View style={styles.nextExerciseNumber}>
                            <Text style={styles.nextExerciseNumberText}>
                              {actualIndex + 1}
                            </Text>
                          </View>
                          <View style={styles.nextExerciseInfo}>
                            <Text style={styles.nextExerciseName}>
                              {exercise.name}
                            </Text>
                            <Text style={styles.nextExerciseDetails}>
                              {(exercise as GeneratedExercise).generatedSets ||
                                3}{' '}
                              sets •{' '}
                              {(exercise as GeneratedExercise).generatedReps ||
                                10}{' '}
                              reps
                              {(exercise as GeneratedExercise)
                                .generatedWeight &&
                                ` • ${
                                  (exercise as GeneratedExercise)
                                    .generatedWeight
                                } lb`}
                            </Text>
                            <Text style={styles.nextExerciseMuscle}>
                              {exercise.muscleGroup}
                            </Text>
                          </View>
                          <View style={styles.nextExerciseStatus}>
                            {isExerciseCompleted(
                              exercise as GeneratedExercise
                            ) ? (
                              <View style={styles.completedBadge}>
                                <Text style={styles.completedBadgeText}>✓</Text>
                              </View>
                            ) : (
                              <Text style={styles.nextExerciseProgress}>
                                {completedSets}/{recommendedSets}
                              </Text>
                            )}
                          </View>
                        </View>
                      </LinearGradient>
                    </View>
                  );
                })}

              {/* Show remaining count if more than 3 */}
              {activeWorkout.exercises.length -
                (getCurrentExerciseIndex() + 1) >
                3 && (
                <View style={styles.moreExercisesCard}>
                  <Text style={styles.moreExercisesText}>
                    +
                    {activeWorkout.exercises.length -
                      (getCurrentExerciseIndex() + 4)}{' '}
                    more exercises
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Full Workout Overview (Collapsible) */}
          {activeWorkout && activeWorkout.exercises.length > 1 && (
            <View style={styles.workoutOverviewSection}>
              <TouchableOpacity
                style={styles.workoutOverviewHeader}
                onPress={() => setShowFullOverview(!showFullOverview)}
              >
                <Text style={styles.sectionTitle}>Full Workout Overview</Text>
                <Text style={styles.toggleText}>
                  {showFullOverview ? 'Hide' : 'Show All'}
                </Text>
              </TouchableOpacity>

              {showFullOverview && (
                <View style={styles.workoutOverviewCard}>
                  <LinearGradient
                    colors={['#1A1A2E', '#0F0F23']}
                    style={styles.workoutOverviewGradient}
                  >
                    {activeWorkout.exercises.map((exercise, index) => {
                      const completedSets = getCompletedSetsForExercise(
                        exercise.id
                      );
                      const recommendedSets = getRecommendedSetsForExercise(
                        exercise as GeneratedExercise
                      );
                      const isCurrent = index === getCurrentExerciseIndex();
                      const isCompleted = isExerciseCompleted(
                        exercise as GeneratedExercise
                      );

                      return (
                        <View
                          key={exercise.id}
                          style={[
                            styles.overviewExerciseItem,
                            isCurrent && styles.currentOverviewItem,
                            isCompleted && styles.completedOverviewItem,
                          ]}
                        >
                          <View style={styles.overviewExerciseNumber}>
                            <Text
                              style={[
                                styles.overviewExerciseNumberText,
                                isCurrent && styles.currentOverviewText,
                                isCompleted && styles.completedOverviewText,
                              ]}
                            >
                              {index + 1}
                            </Text>
                          </View>
                          <View style={styles.overviewExerciseInfo}>
                            <Text
                              style={[
                                styles.overviewExerciseName,
                                isCurrent && styles.currentOverviewText,
                                isCompleted && styles.completedOverviewText,
                              ]}
                            >
                              {exercise.name}
                            </Text>
                            <Text
                              style={[
                                styles.overviewExerciseDetails,
                                isCurrent && styles.currentOverviewSubtext,
                                isCompleted && styles.completedOverviewSubtext,
                              ]}
                            >
                              {exercise.muscleGroup}
                            </Text>
                          </View>
                          <View style={styles.overviewExerciseProgress}>
                            <Text
                              style={[
                                styles.overviewProgressText,
                                isCurrent && styles.currentOverviewText,
                                isCompleted && styles.completedOverviewText,
                              ]}
                            >
                              {completedSets}/{recommendedSets}
                            </Text>
                            {isCompleted && (
                              <Text style={styles.completedCheckmark}>✓</Text>
                            )}
                            {isCurrent && (
                              <Text style={styles.currentIndicator}>●</Text>
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </LinearGradient>
                </View>
              )}
            </View>
          )}

          {/* Workout Progress */}
          <View style={styles.progressSection}>
            <Text style={styles.sectionTitle}>Workout Progress</Text>
            <View style={styles.progressCard}>
              <LinearGradient
                colors={['#1A1A2E', '#0F0F23']}
                style={styles.progressGradient}
              >
                <View style={styles.progressStats}>
                  <View style={styles.progressStat}>
                    <Clock size={20} color="#3B82F6" />
                    <Text style={styles.progressValue}>
                      {getWorkoutDuration()}
                    </Text>
                    <Text style={styles.progressLabel}>Duration</Text>
                  </View>
                  <View style={styles.progressStat}>
                    <Target size={20} color="#10B981" />
                    <Text style={styles.progressValue}>
                      {activeWorkout.sets.length}
                    </Text>
                    <Text style={styles.progressLabel}>Sets</Text>
                  </View>
                  <View style={styles.progressStat}>
                    <Zap size={20} color="#F59E0B" />
                    <Text style={styles.progressValue}>
                      {activeWorkout.exercises.length}
                    </Text>
                    <Text style={styles.progressLabel}>Exercises</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* Finish Workout Button */}
          <View style={styles.finishSection}>
            <TouchableOpacity
              style={styles.finishButton}
              onPress={finishWorkout}
            >
              <LinearGradient
                colors={['#6B46C1', '#8B5CF6']}
                style={styles.finishButtonGradient}
              >
                <Zap size={20} color="#FFFFFF" />
                <Text style={styles.finishButtonText}>Finish Workout</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Chat with Bolt Button */}
        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => setShowBoltChat(true)}
        >
          <LinearGradient
            colors={['#6B46C1', '#8B5CF6']}
            style={styles.chatButtonGradient}
          >
            <MessageCircle size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Bolt Chat Modal */}
        <BoltChat
          visible={showBoltChat}
          onClose={() => setShowBoltChat(false)}
          currentWorkout={generatedWorkoutData}
          onWorkoutModified={handleWorkoutModified}
        />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B46C1',
    fontWeight: '600',
  },
  endButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#EF4444',
  },
  endButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  currentExerciseSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  exerciseCard: {
    marginBottom: 16,
  },
  exerciseGradient: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1A1A2E',
  },
  exerciseHeader: {
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  exerciseDetails: {
    fontSize: 16,
    color: '#6B46C1',
    fontWeight: '500',
    marginBottom: 8,
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
  nextExercisesSection: {
    marginBottom: 20,
  },
  nextExerciseCard: {
    marginBottom: 12,
  },
  nextExerciseGradient: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1A1A2E',
  },
  nextExerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextExerciseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  nextExerciseNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  nextExerciseInfo: {
    flex: 1,
  },
  nextExerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  nextExerciseDetails: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 4,
  },
  nextExerciseMuscle: {
    fontSize: 12,
    color: '#64748B',
  },
  nextExerciseStatus: {
    alignItems: 'center',
  },
  nextExerciseProgress: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  completedBadge: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  completedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  moreExercisesCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  moreExercisesText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  workoutOverviewSection: {
    marginBottom: 20,
  },
  workoutOverviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  toggleText: {
    fontSize: 14,
    color: '#6B46C1',
    fontWeight: '600',
  },
  workoutOverviewCard: {
    marginBottom: 16,
  },
  workoutOverviewGradient: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1A1A2E',
  },
  overviewExerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  currentOverviewItem: {
    backgroundColor: '#6B46C1' + '20',
    borderWidth: 1,
    borderColor: '#6B46C1',
  },
  completedOverviewItem: {
    backgroundColor: '#10B981' + '10',
    opacity: 0.7,
  },
  overviewExerciseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  overviewExerciseNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  overviewExerciseInfo: {
    flex: 1,
  },
  overviewExerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  currentOverviewText: {
    color: '#FFFFFF',
  },
  completedOverviewText: {
    color: '#94A3B8',
  },
  overviewExerciseDetails: {
    fontSize: 14,
    color: '#94A3B8',
  },
  currentOverviewSubtext: {
    color: '#6B46C1',
  },
  completedOverviewSubtext: {
    color: '#94A3B8',
  },
  overviewExerciseProgress: {
    alignItems: 'center',
  },
  overviewProgressText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  currentIndicator: {
    fontSize: 12,
    color: '#6B46C1',
    marginTop: 4,
  },
  completedCheckmark: {
    fontSize: 16,
    color: '#10B981',
    marginTop: 4,
  },
  setTrackerSection: {
    marginBottom: 20,
  },
  progressSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  progressCard: {
    marginBottom: 16,
  },
  progressGradient: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1A1A2E',
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressStat: {
    alignItems: 'center',
  },
  progressValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 14,
    color: '#94A3B8',
  },
  finishSection: {
    marginBottom: 30,
  },
  finishButton: {
    marginBottom: 16,
  },
  finishButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  finishButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  restTimerSection: {
    marginBottom: 20,
  },
  chatButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  chatButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseImageContainer: {
    position: 'relative',
    width: '100%',
    height: 200, // Fixed height for the image container
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  exerciseImage: {
    width: '100%',
    height: '100%',
  },
  difficultyBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  targetMuscles: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  quickTipContainer: {
    marginTop: 12,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  quickTipLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B46C1',
    marginBottom: 4,
  },
  quickTipText: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
});
