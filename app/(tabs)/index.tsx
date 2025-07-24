import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Zap,
  Plus,
  Play,
  Settings,
  Sparkles,
  Target,
  User,
  Dumbbell,
  MoreHorizontal,
  Activity,
  Flame,
  Heart,
  ShieldCheck,
  Zap as Lightning,
  MessageCircle,
  X,
  ChevronDown,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { geminiWorkoutGenerator, GeneratedWorkout } from '@/lib/gemini';
import BoltChat from '@/components/BoltChat';
import ExerciseInstructions from '@/components/ExerciseInstructions';
import ExerciseCard from '@/components/ExerciseCard';
import { exerciseLibrary } from '@/data/exercises';

interface MuscleGroup {
  id: string;
  name: string;
  emoji: string;
  icon: any;
  percentage: number;
  color: string;
  description: string;
  imageUrl: any;
}

interface FilterOption {
  id: string;
  label: string;
  isActive: boolean;
  options?: string[];
  currentOptionIndex?: number;
}

export default function WorkoutsScreen() {
  const router = useRouter();
  const { profile, loadOnboardingData, user } = useAuth();
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [generatedWorkout, setGeneratedWorkout] =
    useState<GeneratedWorkout | null>(null);
  const [originalWorkout, setOriginalWorkout] =
    useState<GeneratedWorkout | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [isLoadingOnboarding, setIsLoadingOnboarding] = useState(true);
  const [onboardingError, setOnboardingError] = useState<string | null>(null);
  const [showBoltChat, setShowBoltChat] = useState(false);

  // New state for exercise instructions modal
  const [showExerciseInstructions, setShowExerciseInstructions] =
    useState(false);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [showMuscleSelectionModal, setShowMuscleSelectionModal] =
    useState(false);

  // Filter dropdown state
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Filter options state
  const [filters, setFilters] = useState<FilterOption[]>([
    {
      id: 'duration',
      label: '45m',
      isActive: true,
      options: ['15m', '30m', '45m', '60m', '90m'],
      currentOptionIndex: 2,
    },
    {
      id: 'bodypart',
      label: 'Full body',
      isActive: true,
      options: [
        'Full body',
        'Upper body',
        'Lower body',
        'Core',
        'Arms',
        'Legs',
      ],
      currentOptionIndex: 0,
    },
    {
      id: 'equipment',
      label: 'Equipment',
      isActive: false,
      options: ['Bodyweight', 'Dumbbells', 'Barbell', 'Gym', 'Home'],
      currentOptionIndex: 0,
    },
    {
      id: 'type',
      label: 'Hype',
      isActive: false,
      options: ['Hype', 'Strength', 'Cardio', 'HIIT', 'Endurance'],
      currentOptionIndex: 0,
    },
  ]);

  const muscleGroups = [
    {
      id: 'chest',
      name: 'Chest',
      emoji: '🏋️‍♂️',
      icon: Heart,
      percentage: 100,
      color: '#6B46C1',
      description: 'Pectorals',
      imageUrl: require('@/assets/images/muscle-groups/abs.png'), // Using abs for chest temporarily
    },
    {
      id: 'back',
      name: 'Back',
      emoji: '🏋️‍♀️',
      icon: ShieldCheck,
      percentage: 100,
      color: '#8B5CF6',
      description: 'Lats & Rhomboids',
      imageUrl: require('@/assets/images/muscle-groups/lower-back.png'), // Using lower-back for back
    },
    {
      id: 'biceps',
      name: 'Biceps',
      emoji: '💪',
      icon: Lightning,
      percentage: 80,
      color: '#A78BFA',
      description: 'Biceps Brachii',
      imageUrl: require('@/assets/images/muscle-groups/biceps.png'),
    },
    {
      id: 'triceps',
      name: 'Triceps',
      emoji: '🔥',
      icon: Zap,
      percentage: 85,
      color: '#7C3AED',
      description: 'Triceps Brachii',
      imageUrl: require('@/assets/images/muscle-groups/triceps.png'),
    },
    {
      id: 'shoulders',
      name: 'Shoulders',
      emoji: '🤸‍♀️',
      icon: Activity,
      percentage: 60,
      color: '#7E22CE',
      description: 'Deltoids',
      imageUrl: require('@/assets/images/muscle-groups/traps.png'), // Using traps for shoulders temporarily
    },
    {
      id: 'traps',
      name: 'Traps',
      emoji: '⛰️',
      icon: Target,
      percentage: 70,
      color: '#9333EA',
      description: 'Trapezius',
      imageUrl: require('@/assets/images/muscle-groups/traps.png'),
    },
    {
      id: 'forearms',
      name: 'Forearms',
      emoji: '🤲',
      icon: Activity,
      percentage: 65,
      color: '#C084FC',
      description: 'Forearm Muscles',
      imageUrl: require('@/assets/images/muscle-groups/forearms.png'),
    },
    {
      id: 'abs',
      name: 'Abs',
      emoji: '🔥',
      icon: Flame,
      percentage: 75,
      color: '#F59E0B',
      description: 'Abdominals',
      imageUrl: require('@/assets/images/muscle-groups/abs.png'),
    },
    {
      id: 'lower-back',
      name: 'Lower Back',
      emoji: '🏋️',
      icon: ShieldCheck,
      percentage: 80,
      color: '#EF4444',
      description: 'Erector Spinae',
      imageUrl: require('@/assets/images/muscle-groups/lower-back.png'),
    },
    {
      id: 'quads',
      name: 'Quads',
      emoji: '🦵',
      icon: Zap,
      percentage: 90,
      color: '#3B82F6',
      description: 'Quadriceps',
      imageUrl: require('@/assets/images/muscle-groups/quads.png'),
    },
    {
      id: 'hamstrings',
      name: 'Hamstrings',
      emoji: '🦵',
      icon: Activity,
      percentage: 85,
      color: '#2563EB',
      description: 'Hamstring Muscles',
      imageUrl: require('@/assets/images/muscle-groups/hamstrings.png'),
    },
    {
      id: 'glutes',
      name: 'Glutes',
      emoji: '🍑',
      icon: Target,
      percentage: 90,
      color: '#1D4ED8',
      description: 'Glute Max & Med',
      imageUrl: require('@/assets/images/muscle-groups/glutes.png'),
    },
    {
      id: 'calves',
      name: 'Calves',
      emoji: '🦵',
      icon: Lightning,
      percentage: 70,
      color: '#1E40AF',
      description: 'Calf Muscles',
      imageUrl: require('@/assets/images/muscle-groups/calves.png'),
    },
    {
      id: 'abductors',
      name: 'Abductors',
      emoji: '🦵',
      icon: Activity,
      percentage: 65,
      color: '#10B981',
      description: 'Hip Abductors',
      imageUrl: require('@/assets/images/muscle-groups/abductors.png'),
    },
    {
      id: 'adductors',
      name: 'Adductors',
      emoji: '🦵',
      icon: Target,
      percentage: 65,
      color: '#059669',
      description: 'Hip Adductors',
      imageUrl: require('@/assets/images/muscle-groups/adductors.png'),
    },
  ];

  // Mock exercises for demo (matching the Exercise interface)
  const mockExercises = [
    {
      id: 'dumbbell-bicep-curl',
      name: 'Dumbbell Bicep Curl',
      muscleGroup: 'Arms',
      equipment: 'Dumbbell',
      description: 'Classic bicep exercise with dumbbells',
      category: 'strength' as const,
      difficulty: 'beginner' as const,
      targetMuscles: ['Biceps', 'Brachialis'],
      images: {
        demonstration: '/assets/images/exercises/dumbbell-curl-demo.jpg',
        thumbnail: '/assets/images/exercises/dumbbell-curl-thumb.jpg',
      },
      instructions: {
        setup: [
          'Stand with feet shoulder-width apart',
          'Hold dumbbells with underhand grip',
        ],
        execution: [
          'Curl the weights up toward your chest',
          'Lower slowly to starting position',
        ],
        tips: ['Keep your elbows at your sides'],
        commonMistakes: ['Swinging the weight'],
      },
      sets: 4,
      reps: 13,
      weight: 15,
    },
    {
      id: 'hip-thrust',
      name: 'Hip Thrust',
      muscleGroup: 'Glutes',
      equipment: 'Bodyweight',
      description: 'Powerful glute activation exercise',
      category: 'strength' as const,
      difficulty: 'intermediate' as const,
      targetMuscles: ['Glutes', 'Hamstrings'],
      images: {
        demonstration: '/assets/images/exercises/hip-thrust-demo.jpg',
        thumbnail: '/assets/images/exercises/hip-thrust-thumb.jpg',
      },
      instructions: {
        setup: [
          'Sit with your back against a bench',
          'Position feet flat on the floor',
        ],
        execution: [
          'Drive through your heels to lift hips',
          'Squeeze glutes at the top',
        ],
        tips: ['Keep core engaged throughout'],
        commonMistakes: ['Overextending the back'],
      },
      sets: 3,
      reps: 15,
      weight: 0,
      isSuperset: true,
      supersetRounds: 3,
    },
    {
      id: 'barbell-squat',
      name: 'Barbell Squat',
      muscleGroup: 'Legs',
      equipment: 'Barbell',
      description: 'Compound leg exercise',
      category: 'strength' as const,
      difficulty: 'intermediate' as const,
      targetMuscles: ['Quadriceps', 'Glutes', 'Hamstrings'],
      images: {
        demonstration: '/assets/images/exercises/barbell-squat-demo.jpg',
        thumbnail: '/assets/images/exercises/barbell-squat-thumb.jpg',
      },
      instructions: {
        setup: [
          'Position barbell on your upper back',
          'Stand with feet shoulder-width apart',
        ],
        execution: [
          'Lower into squat position',
          'Drive through heels to stand up',
        ],
        tips: ['Keep chest up and core tight'],
        commonMistakes: ['Knees caving inward'],
      },
      sets: 4,
      reps: 10,
      weight: 135,
    },
    {
      id: 'push-ups',
      name: 'Push-Ups',
      muscleGroup: 'Chest',
      equipment: 'Bodyweight',
      description: 'Classic upper body exercise',
      category: 'strength' as const,
      difficulty: 'beginner' as const,
      targetMuscles: ['Pectorals', 'Triceps', 'Shoulders'],
      images: {
        demonstration: '/assets/images/exercises/push-up-demo.jpg',
        thumbnail: '/assets/images/exercises/push-up-thumb.jpg',
      },
      instructions: {
        setup: [
          'Start in plank position',
          'Hands slightly wider than shoulders',
        ],
        execution: [
          'Lower body to the ground',
          'Push back up to starting position',
        ],
        tips: ['Keep body in straight line'],
        commonMistakes: ['Sagging hips'],
      },
      sets: 3,
      reps: 12,
      weight: 0,
    },
    {
      id: 'deadlift',
      name: 'Deadlift',
      muscleGroup: 'Back',
      equipment: 'Barbell',
      description: 'King of all exercises',
      category: 'strength' as const,
      difficulty: 'advanced' as const,
      targetMuscles: ['Hamstrings', 'Glutes', 'Lower Back'],
      images: {
        demonstration: '/assets/images/exercises/deadlift-demo.jpg',
        thumbnail: '/assets/images/exercises/deadlift-thumb.jpg',
      },
      instructions: {
        setup: [
          'Stand behind barbell with feet hip-width apart',
          'Grip bar with hands outside legs',
        ],
        execution: [
          'Lift bar by extending hips and knees',
          'Lower bar with control',
        ],
        tips: ['Keep bar close to body'],
        commonMistakes: ['Rounding the back'],
      },
      sets: 3,
      reps: 8,
      weight: 185,
    },
    {
      id: 'plank',
      name: 'Plank',
      muscleGroup: 'Core',
      equipment: 'Bodyweight',
      description: 'Isometric core strengthener',
      category: 'strength' as const,
      difficulty: 'beginner' as const,
      targetMuscles: ['Abs', 'Core'],
      images: {
        demonstration: '/assets/images/exercises/plank-demo.jpg',
        thumbnail: '/assets/images/exercises/plank-thumb.jpg',
      },
      instructions: {
        setup: ['Start in push-up position', 'Lower to forearms'],
        execution: ['Hold position with straight body', 'Breathe normally'],
        tips: ['Keep hips level'],
        commonMistakes: ['Lifting hips too high'],
      },
      sets: 3,
      reps: 30, // seconds
      weight: 0,
    },
    {
      id: 'lat-pulldown',
      name: 'Lat Pulldown',
      muscleGroup: 'Back',
      equipment: 'Cable Machine',
      description: 'Back width builder',
      category: 'strength' as const,
      difficulty: 'intermediate' as const,
      targetMuscles: ['Latissimus Dorsi', 'Rhomboids'],
      images: {
        demonstration: '/assets/images/exercises/lat-pulldown-demo.jpg',
        thumbnail: '/assets/images/exercises/lat-pulldown-thumb.jpg',
      },
      instructions: {
        setup: [
          'Sit at lat pulldown machine',
          'Grip bar wider than shoulder-width',
        ],
        execution: [
          'Pull bar down to upper chest',
          'Control the weight back up',
        ],
        tips: ['Lean back slightly'],
        commonMistakes: ['Using too much momentum'],
      },
      sets: 4,
      reps: 10,
      weight: 120,
    },
  ];

  useEffect(() => {
    loadUserData();
    // Set biceps and triceps as selected muscles to match the image
    setSelectedMuscles(['biceps', 'triceps']);
    const workout = {
      id: 'demo-workout',
      name: 'Up Next',
      exercises: mockExercises,
      estimatedDuration: 45,
      difficulty: 'intermediate',
      targetMuscles: ['biceps', 'triceps'],
      notes: 'Focus on form and controlled movements',
    };
    setOriginalWorkout(workout);
    setGeneratedWorkout(workout);
  }, [user]);

  const loadUserData = async () => {
    if (!user) {
      console.log('No user found, skipping onboarding data load');
      setIsLoadingOnboarding(false);
      return;
    }

    setIsLoadingOnboarding(true);
    setOnboardingError(null);

    try {
      console.log('Loading onboarding data for user:', user.id);
      const { data, error } = await loadOnboardingData();

      if (error) {
        console.error('Error loading onboarding data:', error);
        setOnboardingError(error.message || 'Failed to load user preferences');
        setOnboardingData(null);
      } else if (data) {
        console.log('Onboarding data loaded successfully:', data);
        setOnboardingData(data);
        setOnboardingError(null);
      } else {
        console.log(
          'No onboarding data found for user - user may not have completed onboarding'
        );
        setOnboardingData(null);
        setOnboardingError(
          'No user preferences found. Please complete onboarding.'
        );
      }
    } catch (error) {
      console.error('Exception while loading onboarding data:', error);
      setOnboardingError('Failed to load user preferences');
      setOnboardingData(null);
    } finally {
      setIsLoadingOnboarding(false);
    }
  };

  const toggleFilter = (filterId: string) => {
    // Open dropdown for filter selection
    setActiveDropdown(activeDropdown === filterId ? null : filterId);
  };

  const selectFilterOption = (filterId: string, optionIndex: number) => {
    setFilters((prev) => {
      const updatedFilters = prev.map((filter) => {
        if (filter.id === filterId && filter.options) {
          const newLabel = filter.options[optionIndex];
          return {
            ...filter,
            label: newLabel,
            currentOptionIndex: optionIndex,
            isActive: true,
          };
        }
        return filter;
      });

      // Apply filters after updating
      setTimeout(() => applyFilters(updatedFilters), 0);

      return updatedFilters;
    });

    // Close dropdown
    setActiveDropdown(null);
  };

  const getWorkoutMuscleGroups = () => {
    if (!generatedWorkout || !generatedWorkout.exercises) {
      return [];
    }

    // Get unique muscle groups from the current workout exercises
    const workoutMuscleGroups = new Set<string>();

    generatedWorkout.exercises.forEach((exercise) => {
      const muscleGroup = exercise.muscleGroup?.toLowerCase();
      if (muscleGroup) {
        // Map exercise muscle groups to our muscle group IDs
        switch (muscleGroup) {
          case 'arms':
          case 'biceps':
            workoutMuscleGroups.add('biceps');
            break;
          case 'triceps':
            workoutMuscleGroups.add('triceps');
            break;
          case 'chest':
            workoutMuscleGroups.add('chest');
            break;
          case 'back':
            workoutMuscleGroups.add('back');
            break;
          case 'shoulders':
            workoutMuscleGroups.add('shoulders');
            break;
          case 'legs':
            workoutMuscleGroups.add('quads');
            workoutMuscleGroups.add('hamstrings');
            break;
          case 'glutes':
            workoutMuscleGroups.add('glutes');
            break;
          case 'hamstrings':
            workoutMuscleGroups.add('hamstrings');
            break;
          case 'calves':
            workoutMuscleGroups.add('calves');
            break;
          case 'core':
          case 'abs':
            workoutMuscleGroups.add('abs');
            break;
          case 'traps':
            workoutMuscleGroups.add('traps');
            break;
          case 'forearms':
            workoutMuscleGroups.add('forearms');
            break;
          default:
            // Handle partial matches for compound terms
            if (muscleGroup.includes('arm') || muscleGroup.includes('bicep')) {
              workoutMuscleGroups.add('biceps');
            }
            if (muscleGroup.includes('tricep')) {
              workoutMuscleGroups.add('triceps');
            }
            if (muscleGroup.includes('chest')) {
              workoutMuscleGroups.add('chest');
            }
            if (muscleGroup.includes('back')) {
              workoutMuscleGroups.add('back');
            }
            if (muscleGroup.includes('shoulder')) {
              workoutMuscleGroups.add('shoulders');
            }
            if (muscleGroup.includes('leg') || muscleGroup.includes('quad')) {
              workoutMuscleGroups.add('quads');
            }
            if (muscleGroup.includes('glute')) {
              workoutMuscleGroups.add('glutes');
            }
            if (muscleGroup.includes('hamstring')) {
              workoutMuscleGroups.add('hamstrings');
            }
            if (muscleGroup.includes('calf')) {
              workoutMuscleGroups.add('calves');
            }
            if (muscleGroup.includes('core') || muscleGroup.includes('ab')) {
              workoutMuscleGroups.add('abs');
            }
            break;
        }
      }
    });

    // Filter muscle groups to only show ones used in the workout
    return muscleGroups.filter((muscle) => workoutMuscleGroups.has(muscle.id));
  };

  const applyFilters = (currentFilters: FilterOption[]) => {
    if (!originalWorkout) return;

    let filteredWorkout = { ...originalWorkout };

    // Apply duration filter
    const durationFilter = currentFilters.find(
      (f) => f.id === 'duration' && f.isActive
    );
    if (durationFilter) {
      const targetDuration = parseInt(durationFilter.label.replace('m', ''));
      filteredWorkout.estimatedDuration = targetDuration;

      // Adjust number of exercises based on duration
      if (targetDuration <= 15) {
        filteredWorkout.exercises = originalWorkout.exercises.slice(0, 3);
      } else if (targetDuration <= 30) {
        filteredWorkout.exercises = originalWorkout.exercises.slice(0, 5);
      } else if (targetDuration <= 45) {
        filteredWorkout.exercises = originalWorkout.exercises.slice(0, 7);
      } else {
        filteredWorkout.exercises = originalWorkout.exercises;
      }
    }

    // Apply body part filter
    const bodyPartFilter = currentFilters.find(
      (f) => f.id === 'bodypart' && f.isActive
    );
    if (bodyPartFilter) {
      const bodyPart = bodyPartFilter.label;

      if (bodyPart !== 'Full body') {
        // Filter exercises based on body part
        const filteredExercises = originalWorkout.exercises.filter(
          (exercise) => {
            const muscleGroup = exercise.muscleGroup?.toLowerCase() || '';

            switch (bodyPart) {
              case 'Upper body':
                return [
                  'chest',
                  'back',
                  'shoulders',
                  'arms',
                  'biceps',
                  'triceps',
                ].some((muscle) => muscleGroup.includes(muscle));
              case 'Lower body':
                return ['legs', 'glutes', 'quads', 'hamstrings', 'calves'].some(
                  (muscle) => muscleGroup.includes(muscle)
                );
              case 'Core':
                return ['core', 'abs', 'abdominals'].some((muscle) =>
                  muscleGroup.includes(muscle)
                );
              case 'Arms':
                return ['arms', 'biceps', 'triceps'].some((muscle) =>
                  muscleGroup.includes(muscle)
                );
              case 'Legs':
                return ['legs', 'glutes', 'quads', 'hamstrings', 'calves'].some(
                  (muscle) => muscleGroup.includes(muscle)
                );
              default:
                return true;
            }
          }
        );

        if (filteredExercises.length > 0) {
          filteredWorkout.exercises = filteredExercises;
        }
      }
    }

    // Apply equipment filter
    const equipmentFilter = currentFilters.find(
      (f) => f.id === 'equipment' && f.isActive
    );
    if (equipmentFilter) {
      const equipment = equipmentFilter.label.toLowerCase();

      const filteredExercises = originalWorkout.exercises.filter((exercise) => {
        const exerciseEquipment = exercise.equipment?.toLowerCase() || '';

        switch (equipment) {
          case 'bodyweight':
            return (
              exerciseEquipment === 'bodyweight' || exerciseEquipment === 'none'
            );
          case 'dumbbells':
            return exerciseEquipment.includes('dumbbell');
          case 'barbell':
            return exerciseEquipment.includes('barbell');
          case 'gym':
            return ['barbell', 'dumbbell', 'cable', 'machine'].some((eq) =>
              exerciseEquipment.includes(eq)
            );
          case 'home':
            return ['bodyweight', 'dumbbell', 'none'].some(
              (eq) => exerciseEquipment.includes(eq) || exerciseEquipment === eq
            );
          default:
            return true;
        }
      });

      if (filteredExercises.length > 0) {
        filteredWorkout.exercises = filteredExercises;
      }
    }

    // Apply workout type filter
    const typeFilter = currentFilters.find(
      (f) => f.id === 'type' && f.isActive
    );
    if (typeFilter) {
      const workoutType = typeFilter.label.toLowerCase();

      // Adjust workout characteristics based on type
      if (workoutType === 'hype') {
        // High intensity, shorter rest periods
        filteredWorkout.exercises = filteredWorkout.exercises.map((ex) => ({
          ...ex,
          sets: 4,
          reps: 12,
        }));
      } else if (workoutType === 'strength') {
        // Higher weight, lower reps
        filteredWorkout.exercises = filteredWorkout.exercises.map((ex) => ({
          ...ex,
          sets: 3,
          reps: 6,
          weight: ex.weight ? ex.weight * 1.2 : ex.weight,
        }));
      } else if (workoutType === 'cardio') {
        // Higher reps, lower weight
        filteredWorkout.exercises = filteredWorkout.exercises.map((ex) => ({
          ...ex,
          sets: 3,
          reps: 20,
          weight: ex.weight ? ex.weight * 0.7 : ex.weight,
        }));
      } else if (workoutType === 'hiit') {
        // Short bursts, high intensity
        filteredWorkout.exercises = filteredWorkout.exercises.map((ex) => ({
          ...ex,
          sets: 5,
          reps: 10,
        }));
      }
    }

    setGeneratedWorkout(filteredWorkout);
  };

  const toggleMuscleSelection = (muscleId: string) => {
    setSelectedMuscles((prev) => {
      const isRemoving = prev.includes(muscleId);
      const newSelection = isRemoving
        ? prev.filter((id) => id !== muscleId)
        : [...prev, muscleId];

      return newSelection;
    });
  };

  const generateWorkoutWithGemini = async () => {
    if (selectedMuscles.length === 0) {
      Alert.alert(
        'Select Muscles',
        'Please select at least one muscle group to target.'
      );
      return;
    }

    setIsGenerating(true);

    try {
      // Check if we're still loading onboarding data
      if (isLoadingOnboarding) {
        console.log('Still loading onboarding data, waiting...');
        // Wait a moment for onboarding data to load
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Log the current state of onboarding data
      console.log('=== ONBOARDING DATA DEBUG ===');
      console.log('User:', user?.id);
      console.log('Onboarding data:', onboardingData);
      console.log('Loading state:', isLoadingOnboarding);
      console.log('Error state:', onboardingError);
      console.log('==============================');

      // Enhanced user context with all onboarding data for highly personalized workouts
      const userContext = {
        // Basic info
        fitnessGoals: onboardingData?.fitness_goals || ['general-fitness'],
        experienceLevel: onboardingData?.experience_level || 'beginner',
        equipment: onboardingData?.equipment || ['none'],
        targetMuscles: selectedMuscles,
        workoutFrequency: onboardingData?.workout_frequency || '2-3',

        // Enhanced personalization data
        timeAvailability: onboardingData?.time_availability || 'flexible',
        limitations: onboardingData?.limitations || [],
        limitationsOther: onboardingData?.limitations_other,
        motivationStyle: onboardingData?.motivation_style || [],
        workoutStyle: onboardingData?.workout_style || [],
      };

      console.log(
        'Generating personalized workout with complete user profile:',
        userContext
      );

      // Show user if we're using defaults vs their actual preferences
      if (!onboardingData) {
        console.log(
          '⚠️ Using default preferences - no onboarding data available'
        );
        Alert.alert(
          'Using Default Settings',
          "We're using default workout settings. Complete your profile setup for more personalized workouts.",
          [{ text: 'OK' }]
        );
      } else {
        console.log('✅ Using personalized preferences from onboarding data');
      }

      const generatedWorkout = await geminiWorkoutGenerator.generateWorkout(
        userContext
      );

      const workoutWithMuscles = {
        ...generatedWorkout,
        targetMuscles: selectedMuscles.map((muscleId) => {
          const muscle = muscleGroups.find((m) => m.id === muscleId);
          return (
            muscle || {
              id: muscleId,
              name: muscleId,
              percentage: 100,
              color: '#6B46C1',
            }
          );
        }),
      };

      setOriginalWorkout(workoutWithMuscles);
      setGeneratedWorkout(workoutWithMuscles);
    } catch (error) {
      console.error('Error generating workout:', error);
      Alert.alert('Error', 'Failed to generate workout. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const startWorkout = (workout: GeneratedWorkout) => {
    router.push({
      pathname: '/workout/active',
      params: {
        workoutData: JSON.stringify(workout),
      },
    });
  };

  const createCustomWorkout = () => {
    router.push('/workout/custom');
  };

  const handleWorkoutModified = (modifiedWorkout: GeneratedWorkout) => {
    setOriginalWorkout(modifiedWorkout);
    setGeneratedWorkout(modifiedWorkout);
    console.log('Workout modified by Bolt:', modifiedWorkout);
  };

  const findAlternativeExercises = (
    targetMuscleGroup: string,
    currentExerciseId: string
  ) => {
    return exerciseLibrary.filter(
      (exercise) =>
        exercise.muscleGroup.toLowerCase() ===
          targetMuscleGroup.toLowerCase() && exercise.id !== currentExerciseId
    );
  };

  const replaceExerciseWithAlternative = (
    exerciseToReplace: any,
    newExercise: any
  ) => {
    if (!generatedWorkout) return;

    const updatedExercises = generatedWorkout.exercises.map((exercise) =>
      exercise.id === exerciseToReplace.id ? newExercise : exercise
    );

    const updatedWorkout = {
      ...generatedWorkout,
      exercises: updatedExercises,
    };

    setGeneratedWorkout(updatedWorkout);
  };

  const handleShowExerciseDetails = (exercise: any) => {
    setSelectedExercise(exercise);
    setShowExerciseInstructions(true);
  };

  const handleReplaceExercise = (exercise: any) => {
    const alternatives = findAlternativeExercises(
      exercise.muscleGroup,
      exercise.id
    );

    if (alternatives.length === 0) {
      Alert.alert(
        'No Alternatives',
        `No alternative exercises found for ${exercise.muscleGroup}.`,
        [{ text: 'OK' }]
      );
      return;
    }

    const alternativeOptions = alternatives.slice(0, 5).map((alt, index) => ({
      text: alt.name,
      onPress: () => {
        replaceExerciseWithAlternative(exercise, alt);
        Alert.alert(
          'Exercise Replaced',
          `${exercise.name} has been replaced with ${alt.name}`,
          [{ text: 'Great!' }]
        );
      },
    }));

    alternativeOptions.push({ text: 'Cancel', style: 'cancel' });

    Alert.alert(
      `Replace ${exercise.name}`,
      `Choose an alternative exercise for ${exercise.muscleGroup}:`,
      alternativeOptions
    );
  };

  const handleStartExerciseFromInstructions = (exercise: any) => {
    // Convert to the format expected by the active workout screen
    const workoutWithSingleExercise = {
      id: `single-${exercise.id}`,
      name: `${exercise.name} Workout`,
      exercises: [exercise],
      estimatedDuration: 15,
      difficulty: exercise.difficulty || 'intermediate',
      targetMuscles: [exercise.muscleGroup],
      notes: `Single exercise workout: ${exercise.name}`,
    };

    router.push({
      pathname: '/workout/active',
      params: {
        workoutData: JSON.stringify(workoutWithSingleExercise),
      },
    });
  };

  const renderMuscleGroup = (muscle: MuscleGroup, index: number) => (
    <TouchableOpacity
      key={muscle.id}
      style={[
        styles.muscleCard,
        selectedMuscles.includes(muscle.id) && styles.selectedMuscle,
      ]}
      onPress={() => toggleMuscleSelection(muscle.id)}
    >
      <LinearGradient
        colors={
          selectedMuscles.includes(muscle.id)
            ? [muscle.color, muscle.color + 'DD']
            : ['#2A2A3E', '#1F1F2E']
        }
        style={styles.muscleCardGradient}
      >
        {/* Body part visualization */}
        <View style={styles.muscleImageContainer}>
          <Image
            source={muscle.imageUrl}
            style={styles.muscleImage}
            resizeMode="contain"
          />
          <View style={styles.muscleOverlay}>
            <View
              style={[
                styles.muscleHighlight,
                { backgroundColor: muscle.color },
              ]}
            />
          </View>
        </View>

        {/* Muscle name */}
        <Text style={styles.muscleName}>{muscle.name}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderTargetMuscle = (muscle: MuscleGroup, index: number) => {
    return (
      <View key={muscle.id} style={styles.targetMuscleCard}>
        <View style={styles.targetMuscleImageContainer}>
          <Image
            source={muscle.imageUrl}
            style={styles.targetMuscleImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.targetMuscleInfo}>
          <Text style={styles.targetMuscleName}>{muscle.name}</Text>
          <View style={styles.targetMusclePercentage}>
            <Text style={styles.targetMusclePercentageText}>
              {muscle.percentage}%
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderFilterPill = (filter: FilterOption) => (
    <TouchableWithoutFeedback
      key={filter.id}
      onPress={(e) => {
        e?.stopPropagation?.();
      }}
    >
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterPill,
            filter.isActive && styles.filterPillActive,
          ]}
          onPress={() => toggleFilter(filter.id)}
        >
          <Text
            style={[
              styles.filterPillText,
              filter.isActive && styles.filterPillTextActive,
            ]}
          >
            {filter.label}
          </Text>
          <ChevronDown
            size={16}
            color={filter.isActive ? '#FFFFFF' : '#64748B'}
            style={[
              styles.chevron,
              activeDropdown === filter.id && styles.chevronRotated,
            ]}
          />
        </TouchableOpacity>

        {/* Dropdown Menu */}
        {activeDropdown === filter.id && filter.options && (
          <View style={styles.dropdown}>
            <LinearGradient
              colors={['#1A1A2E', '#0F0F23']}
              style={styles.dropdownGradient}
            >
              {filter.options.map((option, index) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.dropdownOption,
                    index === filter.currentOptionIndex &&
                      styles.dropdownOptionActive,
                    index === filter.options!.length - 1 &&
                      styles.dropdownOptionLast,
                  ]}
                  onPress={() => selectFilterOption(filter.id, index)}
                >
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      index === filter.currentOptionIndex &&
                        styles.dropdownOptionTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                  {index === filter.currentOptionIndex && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </LinearGradient>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );

  const renderWorkoutExerciseCard = (exercise: any, index: number) => {
    const isSuperset = exercise.isSuperset;

    return (
      <View key={exercise.id} style={styles.workoutExerciseCard}>
        {isSuperset && index === 1 && (
          <View style={styles.supersetHeader}>
            <Text style={styles.supersetText}>Superset • 3 Rounds</Text>
            <TouchableOpacity>
              <MoreHorizontal size={20} color="#64748B" />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.exerciseCardContent}>
          <View style={styles.exerciseImagePlaceholder}>
            <View style={styles.exerciseImageContainer}>
              <View style={styles.exerciseImageBg} />
              <View style={styles.muscleIconContainer}>
                <Image
                  source={
                    exercise.muscleGroup === 'Arms' ||
                    exercise.muscleGroup === 'Biceps'
                      ? muscleGroups.find((m) => m.id === 'biceps')?.imageUrl
                      : exercise.muscleGroup === 'Glutes'
                      ? muscleGroups.find((m) => m.id === 'glutes')?.imageUrl
                      : muscleGroups.find((m) =>
                          m.name
                            .toLowerCase()
                            .includes(exercise.muscleGroup.toLowerCase())
                        )?.imageUrl || muscleGroups[0].imageUrl
                  }
                  style={styles.muscleIcon}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>

          <View style={styles.exerciseDetails}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <Text style={styles.exerciseInfo}>
              {exercise.sets} sets • {exercise.reps} reps •{' '}
              {exercise.weight > 0 ? `${exercise.weight} lb` : 'Bodyweight'}
            </Text>
          </View>

          <TouchableOpacity style={styles.exerciseOptions}>
            <MoreHorizontal size={20} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderExerciseCard = (exercise: any, index: number) => {
    // Find the full exercise data from the library to get images and instructions
    const fullExerciseData =
      exerciseLibrary.find((ex) => ex.id === exercise.id) || exercise;

    return (
      <ExerciseCard
        key={exercise.id}
        exercise={fullExerciseData}
        onStart={(ex) => handleStartExerciseFromInstructions(ex)}
        onShowDetails={handleShowExerciseDetails}
        showFullDetails={true}
      />
    );
  };

  return (
    <>
      <TouchableWithoutFeedback onPress={() => setActiveDropdown(null)}>
        <SafeAreaView style={styles.container}>
          <LinearGradient
            colors={['#0F0F23', '#1A1A2E', '#0F0F23']}
            style={styles.background}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>Up Next</Text>
                <TouchableOpacity>
                  <MoreHorizontal size={24} color="#EF4444" />
                </TouchableOpacity>
              </View>
              {generatedWorkout && (
                <View style={styles.headerInfo}>
                  <Text style={styles.headerSubtitle}>
                    {generatedWorkout.exercises.length} Exercises
                  </Text>
                  {generatedWorkout.exercises.length !==
                    originalWorkout?.exercises.length && (
                    <Text style={styles.filteredIndicator}>
                      • Filtered from {originalWorkout?.exercises.length || 0}
                    </Text>
                  )}
                </View>
              )}
            </View>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollViewContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Filter Pills */}
              <View style={styles.filterSection}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.filterScroll}
                  contentContainerStyle={styles.filterScrollContent}
                >
                  {filters.map(renderFilterPill)}
                </ScrollView>
              </View>

              {/* Target Muscles Section */}
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <View style={styles.targetMusclesSection}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Target Muscles</Text>
                    <TouchableOpacity
                      style={styles.addMuscleButton}
                      onPress={() => setShowMuscleSelectionModal(true)}
                    >
                      <Plus size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.targetMuscleScroll}
                    contentContainerStyle={styles.targetMuscleScrollContent}
                    scrollEnabled={true}
                    bounces={true}
                    decelerationRate="normal"
                    directionalLockEnabled={true}
                    nestedScrollEnabled={true}
                  >
                    {getWorkoutMuscleGroups().map(renderTargetMuscle)}
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>

              {/* Exercises Section */}
              {generatedWorkout && (
                <View style={styles.exercisesSection}>
                  {generatedWorkout.exercises.map(renderWorkoutExerciseCard)}
                </View>
              )}
            </ScrollView>

            {/* Start Workout Button */}
            {generatedWorkout && (
              <View style={styles.startWorkoutContainer}>
                <TouchableOpacity
                  style={styles.startWorkoutButton}
                  onPress={() => startWorkout(generatedWorkout)}
                >
                  <Text style={styles.startWorkoutButtonText}>
                    Start Workout
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Loading Overlay */}
            {isGenerating && (
              <View style={styles.loadingOverlay}>
                <LinearGradient
                  colors={['#0F0F23', '#1A1A2E']}
                  style={styles.loadingBackground}
                >
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6B46C1" />
                    <Text style={styles.loadingTitle}>
                      Generating Your Workout
                    </Text>
                    <Text style={styles.loadingSubtitle}>
                      Bolt is creating a personalized workout for your selected
                      muscle groups...
                    </Text>
                    <View style={styles.loadingSteps}>
                      <Text style={styles.loadingStep}>
                        ⚡ Analyzing your preferences
                      </Text>
                      <Text style={styles.loadingStep}>
                        🎯 Selecting optimal exercises
                      </Text>
                      <Text style={styles.loadingStep}>
                        🔥 Customizing sets and reps
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            )}

            {/* Muscle Selection Modal */}
            <Modal
              visible={showMuscleSelectionModal}
              animationType="slide"
              presentationStyle="pageSheet"
            >
              <SafeAreaView style={styles.modalContainer}>
                <LinearGradient
                  colors={['#0F0F23', '#1A1A2E']}
                  style={styles.modalBackground}
                >
                  {/* Modal Header */}
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Target Muscles</Text>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setShowMuscleSelectionModal(false)}
                    >
                      <X size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>

                  {/* Muscle Grid */}
                  <ScrollView
                    style={styles.modalScrollView}
                    showsVerticalScrollIndicator={false}
                  >
                    <View style={styles.modalMuscleGrid}>
                      {muscleGroups.map((muscle, index) => (
                        <TouchableOpacity
                          key={muscle.id}
                          style={[
                            styles.modalMuscleItem,
                            selectedMuscles.includes(muscle.id) &&
                              styles.selectedModalMuscle,
                          ]}
                          onPress={() => toggleMuscleSelection(muscle.id)}
                        >
                          <View style={styles.targetMuscleContainer}>
                            <View
                              style={[
                                styles.targetMuscleImageContainer,
                                selectedMuscles.includes(muscle.id) && {
                                  backgroundColor: muscle.color + '40',
                                  borderColor: muscle.color,
                                  borderWidth: 2,
                                },
                              ]}
                            >
                              <Image
                                source={muscle.imageUrl}
                                style={styles.targetMuscleImage}
                                resizeMode="contain"
                              />
                              <View style={styles.targetMuscleOverlay}>
                                <View
                                  style={[
                                    styles.targetMuscleHighlight,
                                    {
                                      backgroundColor: muscle.color,
                                      opacity: selectedMuscles.includes(
                                        muscle.id
                                      )
                                        ? 0.5
                                        : 0.3,
                                    },
                                  ]}
                                />
                              </View>
                              <View style={styles.targetMusclePercentage}>
                                <Text style={styles.targetMusclePercentageText}>
                                  {muscle.percentage}%
                                </Text>
                              </View>
                              {selectedMuscles.includes(muscle.id) && (
                                <View style={styles.selectedCheckmark}>
                                  <Text style={styles.checkmarkText}>✓</Text>
                                </View>
                              )}
                            </View>
                            <Text style={styles.targetMuscleName}>
                              {muscle.name}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>

                  {/* Generate Workout Button */}
                  <View style={styles.modalFooter}>
                    <TouchableOpacity
                      style={styles.generateWorkoutButton}
                      onPress={() => {
                        setShowMuscleSelectionModal(false);
                        generateWorkoutWithGemini();
                      }}
                      disabled={selectedMuscles.length === 0}
                    >
                      <LinearGradient
                        colors={
                          selectedMuscles.length > 0
                            ? ['#6B46C1', '#8B5CF6']
                            : ['#374151', '#4B5563']
                        }
                        style={styles.generateWorkoutGradient}
                      >
                        <Sparkles size={20} color="#FFFFFF" />
                        <Text style={styles.generateWorkoutText}>
                          {selectedMuscles.length > 0
                            ? `Generate Workout (${selectedMuscles.length} muscles)`
                            : 'Select muscles first'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </SafeAreaView>
            </Modal>

            {/* Bolt Chat Modal */}
            <BoltChat
              visible={showBoltChat}
              onClose={() => setShowBoltChat(false)}
              currentWorkout={generatedWorkout}
              onWorkoutModified={handleWorkoutModified}
            />

            {/* Exercise Instructions Modal */}
            {selectedExercise && (
              <ExerciseInstructions
                exercise={selectedExercise}
                visible={showExerciseInstructions}
                onClose={() => {
                  setShowExerciseInstructions(false);
                  setSelectedExercise(null);
                }}
                onStartExercise={handleStartExerciseFromInstructions}
                onReplace={handleReplaceExercise}
              />
            )}
          </LinearGradient>
        </SafeAreaView>
      </TouchableWithoutFeedback>

      {/* Floating Chat with Bolt Button - Outside SafeAreaView */}
      <TouchableOpacity
        style={styles.floatingChatButton}
        onPress={() => setShowBoltChat(true)}
      >
        <LinearGradient
          colors={['#6B46C1', '#8B5CF6']}
          style={styles.floatingChatGradient}
        >
          <MessageCircle size={24} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
    </>
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
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A2E',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  filteredIndicator: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '500',
    marginLeft: 8,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 100,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  targetMusclesSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
    backgroundColor: 'transparent',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addIconButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  showAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#6B46C1',
  },
  showAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addMuscleButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6B46C1',
  },
  muscleScroll: {
    marginRight: -20,
  },
  muscleScrollContent: {
    paddingRight: 20,
  },
  muscleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  saveMusclesButton: {
    borderRadius: 12,
    marginTop: 10,
  },
  saveMusclesGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveMusclesText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveSelectionButton: {
    borderRadius: 8,
  },
  saveSelectionGradient: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveSelectionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  muscleCard: {
    width: 100,
    height: 120,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  selectedMuscle: {
    transform: [{ scale: 1.02 }],
  },
  muscleCardGradient: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  muscleImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#FFFFFF15',
    overflow: 'hidden',
  },
  muscleImage: {
    width: 40,
    height: 40,
  },
  muscleOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 25,
    overflow: 'hidden',
  },
  muscleHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
    borderRadius: 25,
  },

  muscleName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  exerciseCard: {
    marginBottom: 16,
  },
  exerciseGradient: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  exerciseContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#FFFFFF10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  exerciseImage: {
    fontSize: 24,
  },
  muscleGroupIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
  muscleGroupDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#94A3B8',
  },
  exerciseOptions: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  generateButton: {
    borderRadius: 16,
    marginTop: 20,
  },
  generateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  floatingChatButton: {
    position: 'absolute',
    bottom: 5,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    elevation: 10,
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    zIndex: 1000,
  },
  floatingChatGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noMusclesSelected: {
    width: 200,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#374151',
  },
  noMusclesText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  loadingBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 15, 35, 0.95)',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
    backgroundColor: '#1A1A2E',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#6B46C1',
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  loadingSteps: {
    alignItems: 'flex-start',
    gap: 8,
  },
  loadingStep: {
    fontSize: 14,
    color: '#E2E8F0',
    fontWeight: '500',
  },
  targetMuscleScroll: {
    marginRight: -20,
    flexGrow: 0,
  },
  targetMuscleScrollContent: {
    paddingRight: 20,
    flexGrow: 0,
  },
  targetMuscleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    width: 200,
  },
  targetMuscleImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    marginRight: 12,
  },
  targetMuscleImageSelected: {
    borderWidth: 2,
    borderColor: '#6B46C1',
  },
  targetMuscleOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    overflow: 'hidden',
  },
  targetMuscleHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
    borderRadius: 12,
  },
  targetMuscleImage: {
    width: 60,
    height: 60,
  },
  targetMuscleInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  targetMuscleName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  targetMuscleNameSelected: {
    color: '#6B46C1',
  },
  targetMusclePercentage: {
    alignSelf: 'flex-start',
  },
  targetMusclePercentageText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  expandedMuscleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  expandedMuscleItem: {
    width: '22%', // 4 items per row with spacing
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedExpandedMuscle: {
    transform: [{ scale: 1.05 }],
  },
  selectedCheckmark: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  modalBackground: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A2E',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalMuscleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 20,
    gap: 16,
  },
  modalMuscleItem: {
    width: '22%', // 4 items per row
    alignItems: 'center',
    marginBottom: 20,
  },
  selectedModalMuscle: {
    transform: [{ scale: 1.05 }],
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#1A1A2E',
  },
  generateWorkoutButton: {
    borderRadius: 16,
  },
  generateWorkoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 12,
  },
  generateWorkoutText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  oldStartWorkoutButton: {
    borderRadius: 12,
  },
  startWorkoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  startWorkoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // New styles for redesigned interface
  filterSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
    zIndex: 1000,
  },
  filterScroll: {
    marginRight: -20,
  },
  filterScrollContent: {
    paddingRight: 20,
  },
  filterContainer: {
    position: 'relative',
    marginRight: 12,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1A1A2E',
  },
  filterPillActive: {
    backgroundColor: '#374151',
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    marginRight: 4,
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  chevron: {
    transition: 'transform 0.2s ease',
  },
  chevronRotated: {
    transform: [{ rotate: '180deg' }],
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    minWidth: 140,
    marginTop: 8,
    borderRadius: 16,
    zIndex: 1001,
    elevation: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  dropdownGradient: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#374151',
    overflow: 'hidden',
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A3E',
  },
  dropdownOptionActive: {
    backgroundColor: '#6B46C120',
  },
  dropdownOptionLast: {
    borderBottomWidth: 0,
  },
  dropdownOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  dropdownOptionTextActive: {
    color: '#6B46C1',
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#6B46C1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  exercisesSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  workoutExerciseCard: {
    marginBottom: 16,
  },
  supersetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  supersetText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  exerciseCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 16,
  },
  exerciseImagePlaceholder: {
    marginRight: 16,
  },
  exerciseImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  exerciseImageBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#64748B',
    borderRadius: 12,
  },
  muscleIconContainer: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  muscleIcon: {
    width: 16,
    height: 16,
  },
  exerciseDetails: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  exerciseInfo: {
    fontSize: 14,
    color: '#64748B',
  },
  exerciseOptions: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0F0F23',
    justifyContent: 'center',
    alignItems: 'center',
  },
  startWorkoutContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderTopWidth: 0,
    borderTopColor: 'transparent',
    zIndex: 1000,
  },
  startWorkoutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  startWorkoutButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
