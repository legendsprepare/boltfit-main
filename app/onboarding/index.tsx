import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Zap,
  Target,
  Users,
  TrendingUp,
  ChevronRight,
  CheckCircle,
  User,
  Ruler,
  Scale,
  Calendar,
  Clock,
  ArrowLeft,
  Dumbbell,
  Home,
  Building,
  Smartphone,
  Share2,
  X,
  ChevronDown,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useLocalSearchParams } from 'expo-router';

export default function OnboardingScreen() {
  const router = useRouter();
  const { updateProfile, signUp, user } = useAuth();
  const params = useLocalSearchParams();

  // Parse signup data from params (optional - for Google users or legacy flow)
  const signupData = params.signupData
    ? JSON.parse(params.signupData as string)
    : null;

  const [currentStep, setCurrentStep] = useState(0);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [equipmentSearchQuery, setEquipmentSearchQuery] = useState('');
  const [frequencyTab, setFrequencyTab] = useState('days-per-week');

  const [onboardingData, setOnboardingData] = useState({
    // Personal Info
    gender: '',
    dateOfBirth: '',
    birthMonth: '',
    birthDay: '',
    birthYear: '',
    height: '',
    heightFeet: '',
    heightInches: '',
    weight: '',
    preferredUnits: 'imperial',

    // Fitness Goals & Experience
    topTrainingGoal: '',
    experienceLevel: '',
    currentStrengthRoutine: '',
    whyHere: '',
    howDidYouHear: '',

    // Equipment & Workout Preferences
    workoutLocation: '',
    equipment: [] as string[],
    workoutFrequency: '',
    specificDays: [] as string[],
    workoutPreviewTime: '9:00 AM',
    enableNotifications: false,

    // Account Information
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',

    // Program summary data
    trainingStyle: 'Strength Training',
    muscleSplit: 'Full Body',
    exerciseDifficulty: 'Beginner',
  });

  const steps = [
    {
      title: 'What is your top training goal?',
      subtitle: '',
      component: 'topTrainingGoal',
      stepNumber: 1,
      totalSteps: 12,
    },
    {
      title: 'How would you describe your experience level?',
      subtitle: '',
      component: 'experienceLevel',
      stepNumber: 2,
      totalSteps: 12,
    },
    {
      title: 'Which best describes your current strength training routine?',
      subtitle: '',
      component: 'currentStrengthRoutine',
      stepNumber: 3,
      totalSteps: 12,
    },
    {
      title: "Which best describes why you're here?",
      subtitle: '',
      component: 'whyHere',
      stepNumber: 4,
      totalSteps: 12,
    },
    {
      title: 'How did you hear about BoltLab?',
      subtitle: '',
      component: 'howDidYouHear',
      stepNumber: 5,
      totalSteps: 12,
    },
    {
      title: 'Where do you exercise?',
      subtitle:
        'BoltLab will compile a starter equipment list based on the location you pick.',
      component: 'workoutLocation',
      stepNumber: 6,
      totalSteps: 12,
    },
    {
      title: 'Available Equipment',
      subtitle: '',
      component: 'availableEquipment',
      stepNumber: 7,
      totalSteps: 12,
    },
    {
      title: 'How often do you want to workout?',
      subtitle: '',
      component: 'workoutFrequency',
      stepNumber: 8,
      totalSteps: 12,
    },
    {
      title: 'Your Body Stats',
      subtitle: 'Enter manually',
      component: 'bodyStats',
      stepNumber: 9,
      totalSteps: 12,
    },
    {
      title: 'On the days you exercise, do you want a preview of your workout?',
      subtitle: '',
      component: 'workoutPreviews',
      stepNumber: 10,
      totalSteps: 12,
    },
    {
      title: 'Create Your Account',
      subtitle: 'Enter your details to get started with BoltLab',
      component: 'accountCreation',
      stepNumber: 11,
      totalSteps: 12,
    },
    {
      title: 'Your Program',
      subtitle:
        'Review your program details. You can always update these later in the app.',
      component: 'programSummary',
      stepNumber: 12,
      totalSteps: 12,
    },
  ];

  // Training Goals
  const trainingGoals = [
    {
      id: 'get-stronger',
      label: 'Get Stronger',
      description: 'Make measurable progress in strength.',
    },
    {
      id: 'build-muscle',
      label: 'Build Muscle',
      description: 'Add more lean mass and muscle size.',
    },
    {
      id: 'improve-composition',
      label: 'Improve Composition',
      description: 'Reduce overall body fat percentage.',
    },
    {
      id: 'reduce-bodyweight',
      label: 'Reduce Bodyweight',
      description: 'Lose weight and get leaner.',
    },
  ];

  // Experience Levels
  const experienceLevels = [
    {
      id: 'expert',
      label: 'Expert',
      description:
        'You know the principles of strength training inside and out.',
    },
    {
      id: 'foundational',
      label: 'Foundational',
      description: 'You understand the basics of building a good workout.',
    },
    {
      id: 'novice',
      label: 'Novice',
      description: 'You are still new to strength training.',
    },
  ];

  // Current Strength Routine
  const strengthRoutines = [
    {
      id: 'consistent',
      label: 'I strength train consistently',
    },
    {
      id: 'struggle-consistency',
      label: 'I struggle with consistency',
    },
    {
      id: 're-establishing',
      label: 'I am re-establishing a routine',
    },
    {
      id: 'never-had-routine',
      label: 'I have never had a routine',
    },
  ];

  // Why Here
  const whyHereOptions = [
    {
      id: 'see-progress',
      label: 'See more progress without the hassle of planning',
    },
    {
      id: 'refresh-routine',
      label: 'Refresh my routine with engaging workouts',
    },
    {
      id: 'other',
      label: 'Other',
    },
  ];

  // How Did You Hear
  const howDidYouHearOptions = [
    {
      id: 'instagram-facebook',
      label: 'Instagram/Facebook Ad',
    },
    {
      id: 'tiktok',
      label: 'TikTok Ad',
    },
    {
      id: 'friends-family',
      label: 'Friends/Family',
    },
    {
      id: 'social-media',
      label: 'Social Media Post',
    },
  ];

  // Workout Locations
  const workoutLocations = [
    {
      id: 'large-gym',
      label: 'Large Gym',
      description:
        'Full fitness clubs such as Anytime, Planet Fitness, Golds, 24-Hour, Equinox',
    },
    {
      id: 'small-gym',
      label: 'Small Gym',
      description: 'Compact public gym with limited equipment',
    },
    {
      id: 'garage-gym',
      label: 'Garage Gym',
      description: 'Barbells, squat rack, dumbbells and more',
    },
    {
      id: 'at-home',
      label: 'At Home',
      description:
        'Limited equipment such as dumbbells, bands, pull-up bars etc',
    },
    {
      id: 'bodyweight-only',
      label: 'Bodyweight Only',
      description: 'Work out anywhere without gym equipment',
    },
    {
      id: 'custom',
      label: 'Custom',
      description: 'Start from scratch and build your own equipment list',
    },
  ];

  // Equipment Categories
  const equipmentCategories = {
    'plated-machines': [
      { id: 'leg-press', label: 'Leg Press', selected: false },
      { id: 'smith-machine', label: 'Smith Machine', selected: false },
      {
        id: 'hammerstrength',
        label: 'Hammerstrength (Leverage) Machine (all forms)',
        selected: false,
      },
    ],
    'benches-racks': [
      { id: 'squat-rack', label: 'Squat Rack', selected: false },
      { id: 'flat-bench', label: 'Flat Bench', selected: false },
      { id: 'incline-bench', label: 'Incline Bench', selected: false },
      { id: 'decline-bench', label: 'Decline Bench', selected: false },
    ],
    'cable-machines': [
      { id: 'crossover-cable', label: 'Crossover Cable', selected: false },
      { id: 'lat-pulldown', label: 'Lat Pulldown Cable', selected: false },
      { id: 'hi-lo-pulley', label: 'Hi-Lo Pulley Cable', selected: false },
      { id: 'row-cable', label: 'Row Cable', selected: false },
      { id: 'rope-cable', label: 'Rope Cable', selected: false },
    ],
    'bars-plates': [
      { id: 'barbells', label: 'Barbells', selected: false },
      { id: 'ez-bar', label: 'EZ Bar', selected: false },
    ],
    'resistance-bands': [
      {
        id: 'handle-bands',
        label: 'Handle Bands',
        description: 'XXX-Light, X-Light...',
        selected: true,
      },
      {
        id: 'mini-loop-bands',
        label: 'Mini Loop Bands',
        description: 'XXX-Light, X-Light...',
        selected: true,
      },
    ],
    'exercise-balls': [
      { id: 'bosu-balance', label: 'BOSU® Balance Trainer', selected: false },
    ],
    'small-weights': [
      {
        id: 'dumbbells',
        label: 'Dumbbells',
        description: '2.5, 3.0, 5.0, 8.0...',
        selected: true,
      },
      {
        id: 'kettlebells',
        label: 'Kettlebells',
        description: '9.0, 13.0, 18.0, 26.0...',
        selected: true,
      },
    ],
  };

  // Workout Frequencies
  const workoutFrequencies = [
    { id: '1-day', label: '1 day a week' },
    { id: '2-days', label: '2 days a week' },
    { id: '3-days', label: '3 days a week' },
    { id: '4-days', label: '4 days a week' },
    { id: '5-days', label: '5 days a week' },
    { id: '6-days', label: '6 days a week' },
    { id: '7-days', label: '7 days a week' },
  ];

  // Specific Days
  const specificDaysOptions = [
    { id: 'monday', label: 'Monday' },
    { id: 'tuesday', label: 'Tuesday' },
    { id: 'wednesday', label: 'Wednesday' },
    { id: 'thursday', label: 'Thursday' },
    { id: 'friday', label: 'Friday' },
    { id: 'saturday', label: 'Saturday' },
    { id: 'sunday', label: 'Sunday' },
  ];

  // Gender options
  const genderOptions = [
    { id: 'man', label: 'Man' },
    { id: 'woman', label: 'Woman' },
    { id: 'other', label: 'Other' },
    { id: 'prefer-not-to-say', label: 'Prefer not to say' },
  ];

  // Time options for workout previews
  const timeOptions = [
    '6:00 AM',
    '7:00 AM',
    '8:00 AM',
    '9:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '1:00 PM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM',
    '5:00 PM',
    '6:00 PM',
    '7:00 PM',
    '8:00 PM',
    '9:00 PM',
  ];

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      await completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      // On first step, go back to previous screen
      router.back();
    }
  };

  const handleSkip = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const completeOnboarding = async () => {
    try {
      // Validate password match
      if (onboardingData.password !== onboardingData.confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }

      if (onboardingData.password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters long');
        return;
      }

      console.log('Completing onboarding...');

      let userId: string;

      if (signupData?.isGoogleUser && user) {
        // For Google users, we already have an account
        userId = user.id;
        console.log('Using existing Google account, user ID:', userId);
      } else {
        // Create account with the information collected in onboarding
        console.log('Creating account and completing onboarding...');

        const { data: authData, error: authError } = await signUp(
          onboardingData.email,
          onboardingData.password,
          onboardingData.fullName
        );

        if (authError) {
          console.error('Error creating account:', authError);
          Alert.alert('Error', authError.message || 'Failed to create account');
          return;
        }

        if (!authData?.user) {
          Alert.alert('Error', 'Account creation failed - please try again');
          return;
        }

        userId = authData.user.id;
        console.log('Account created, user ID:', userId);
      }

      // Convert height and weight to metric for database storage
      const heightInCm = convertHeightToCm(
        onboardingData.height,
        onboardingData.preferredUnits
      );
      const weightInKg = convertWeightToKg(
        onboardingData.weight,
        onboardingData.preferredUnits
      );

      // Calculate age from date of birth
      let age = null;
      let dateOfBirth = '';

      if (
        onboardingData.birthYear &&
        onboardingData.birthMonth &&
        onboardingData.birthDay
      ) {
        dateOfBirth = `${
          onboardingData.birthYear
        }-${onboardingData.birthMonth.padStart(
          2,
          '0'
        )}-${onboardingData.birthDay.padStart(2, '0')}`;
        age = new Date().getFullYear() - parseInt(onboardingData.birthYear);
      } else if (onboardingData.dateOfBirth) {
        // Fallback for existing dateOfBirth field
        dateOfBirth = onboardingData.dateOfBirth;
        age =
          new Date().getFullYear() -
          new Date(onboardingData.dateOfBirth).getFullYear();
      }

      // Prepare complete onboarding data for database
      const onboardingDataForDB = {
        user_id: userId,
        // Personal Information
        gender: onboardingData.gender || null,
        preferred_units: onboardingData.preferredUnits || 'metric',
        height_cm: heightInCm || null,
        weight_kg: weightInKg || null,
        age: age,

        // Fitness Goals & Experience
        experience_level: onboardingData.experienceLevel || null,
        fitness_goals: onboardingData.topTrainingGoal
          ? [onboardingData.topTrainingGoal]
          : [],

        // Equipment & Workout Preferences
        equipment: onboardingData.equipment || [],
        workout_frequency: onboardingData.workoutFrequency || null,
        workout_duration: '30-45', // Default based on typical selection
        time_availability: 'flexible', // Default value

        // Additional onboarding data (stored as JSON for flexibility)
        limitations: [],
        motivation_style: onboardingData.whyHere
          ? [onboardingData.whyHere]
          : [],
        workout_style: onboardingData.currentStrengthRoutine
          ? [onboardingData.currentStrengthRoutine]
          : [],
      };

      console.log('Saving onboarding data:', onboardingDataForDB);

      // Save onboarding data to database using UPSERT to avoid duplicates
      const { error: onboardingError } = await supabase
        .from('onboarding_data')
        .upsert(onboardingDataForDB, {
          onConflict: 'user_id',
        });

      if (onboardingError) {
        console.error('Error saving onboarding data:', onboardingError);
        Alert.alert(
          'Error',
          'Failed to save onboarding data. Please try again.'
        );
        return;
      } else {
        console.log('Onboarding data saved successfully');
      }

      // Save additional onboarding metadata (for analytics and future features)
      const metadataPayload = {
        user_id: userId,
        how_did_you_hear: onboardingData.howDidYouHear || null,
        workout_location: onboardingData.workoutLocation || null,
        workout_preview_time: onboardingData.workoutPreviewTime || null,
        notifications_enabled: onboardingData.enableNotifications || false,
        onboarding_completed_at: new Date().toISOString(),
        onboarding_version: '1.0',
      };

      // Try to save metadata, but don't block the flow if it fails
      try {
        const { error: metadataError } = await supabase
          .from('user_metadata')
          .upsert(metadataPayload, {
            onConflict: 'user_id',
          });

        if (metadataError) {
          console.warn('Warning: Could not save user metadata:', metadataError);
        } else {
          console.log('User metadata saved successfully');
        }
      } catch (metadataError) {
        console.warn('Warning: Metadata save failed:', metadataError);
      }

      console.log(
        'Onboarding completed successfully, navigating to main app...'
      );

      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert('Error', 'Failed to complete setup - please try again');
    }
  };

  // Helper functions for unit conversions
  const convertHeightToCm = (height: string, units: string): number => {
    if (units === 'metric') {
      return parseInt(height) || 0;
    } else {
      // Imperial: use separate feet and inches fields
      const feet = parseInt(onboardingData.heightFeet) || 0;
      const inches = parseInt(onboardingData.heightInches) || 0;
      return Math.round((feet * 12 + inches) * 2.54);
    }
  };

  const convertWeightToKg = (weight: string, units: string): number => {
    if (!weight) return 0;

    const weightNum = parseFloat(weight);
    if (units === 'metric') {
      return weightNum;
    } else {
      // Convert pounds to kg
      return Math.round(weightNum * 0.453592 * 100) / 100;
    }
  };

  const selectOption = (field: string, value: string) => {
    setOnboardingData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleEquipment = (equipmentId: string) => {
    setOnboardingData((prev) => ({
      ...prev,
      equipment: prev.equipment.includes(equipmentId)
        ? prev.equipment.filter((id) => id !== equipmentId)
        : [...prev.equipment, equipmentId],
    }));
  };

  const toggleSpecificDay = (dayId: string) => {
    setOnboardingData((prev) => ({
      ...prev,
      specificDays: prev.specificDays.includes(dayId)
        ? prev.specificDays.filter((id) => id !== dayId)
        : [...prev.specificDays, dayId],
    }));
  };

  const updateField = (field: string, value: string | boolean) => {
    setOnboardingData((prev) => ({ ...prev, [field]: value }));
  };

  // Modal components
  const renderGenderModal = () => (
    <Modal visible={showGenderModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Gender</Text>
            <TouchableOpacity onPress={() => setShowGenderModal(false)}>
              <X size={24} color="#94A3B8" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={genderOptions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.modalOption,
                  onboardingData.gender === item.label &&
                    styles.selectedModalOption,
                ]}
                onPress={() => {
                  updateField('gender', item.label);
                  setShowGenderModal(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    onboardingData.gender === item.label &&
                      styles.selectedModalOptionText,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  const renderTimeModal = () => (
    <Modal visible={showTimePicker} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Time</Text>
            <TouchableOpacity onPress={() => setShowTimePicker(false)}>
              <X size={24} color="#94A3B8" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={timeOptions}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.modalOption,
                  onboardingData.workoutPreviewTime === item &&
                    styles.selectedModalOption,
                ]}
                onPress={() => {
                  updateField('workoutPreviewTime', item);
                  setShowTimePicker(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    onboardingData.workoutPreviewTime === item &&
                      styles.selectedModalOptionText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  // Render functions for each step
  const renderTopTrainingGoal = () => (
    <View style={styles.stepContent}>
      <View style={styles.optionsColumn}>
        {trainingGoals.map((goal) => (
          <TouchableOpacity
            key={goal.id}
            style={[
              styles.levelCard,
              onboardingData.topTrainingGoal === goal.id &&
                styles.selectedLevel,
            ]}
            onPress={() => selectOption('topTrainingGoal', goal.id)}
          >
            <Text
              style={[
                styles.levelTitle,
                onboardingData.topTrainingGoal === goal.id &&
                  styles.selectedLevelText,
              ]}
            >
              {goal.label}
            </Text>
            <Text
              style={[
                styles.levelDescription,
                onboardingData.topTrainingGoal === goal.id &&
                  styles.selectedLevelDescription,
              ]}
            >
              {goal.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderExperienceLevel = () => (
    <View style={styles.stepContent}>
      <View style={styles.optionsColumn}>
        {experienceLevels.map((level) => (
          <TouchableOpacity
            key={level.id}
            style={[
              styles.levelCard,
              onboardingData.experienceLevel === level.id &&
                styles.selectedLevel,
            ]}
            onPress={() => selectOption('experienceLevel', level.id)}
          >
            <Text
              style={[
                styles.levelTitle,
                onboardingData.experienceLevel === level.id &&
                  styles.selectedLevelText,
              ]}
            >
              {level.label}
            </Text>
            <Text
              style={[
                styles.levelDescription,
                onboardingData.experienceLevel === level.id &&
                  styles.selectedLevelDescription,
              ]}
            >
              {level.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCurrentStrengthRoutine = () => (
    <View style={styles.stepContent}>
      <View style={styles.optionsColumn}>
        {strengthRoutines.map((routine) => (
          <TouchableOpacity
            key={routine.id}
            style={[
              styles.routineCard,
              onboardingData.currentStrengthRoutine === routine.id &&
                styles.selectedRoutine,
            ]}
            onPress={() => selectOption('currentStrengthRoutine', routine.id)}
          >
            <Text
              style={[
                styles.routineText,
                onboardingData.currentStrengthRoutine === routine.id &&
                  styles.selectedRoutineText,
              ]}
            >
              {routine.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderWhyHere = () => (
    <View style={styles.stepContent}>
      <View style={styles.optionsColumn}>
        {whyHereOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.routineCard,
              onboardingData.whyHere === option.id && styles.selectedRoutine,
            ]}
            onPress={() => selectOption('whyHere', option.id)}
          >
            <Text
              style={[
                styles.routineText,
                onboardingData.whyHere === option.id &&
                  styles.selectedRoutineText,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderHowDidYouHear = () => (
    <View style={styles.stepContent}>
      <View style={styles.optionsColumn}>
        {howDidYouHearOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.routineCard,
              onboardingData.howDidYouHear === option.id &&
                styles.selectedRoutine,
            ]}
            onPress={() => selectOption('howDidYouHear', option.id)}
          >
            <Text
              style={[
                styles.routineText,
                onboardingData.howDidYouHear === option.id &&
                  styles.selectedRoutineText,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderWorkoutLocation = () => (
    <View style={styles.stepContent}>
      <View style={styles.optionsColumn}>
        {workoutLocations.map((location) => (
          <TouchableOpacity
            key={location.id}
            style={[
              styles.levelCard,
              onboardingData.workoutLocation === location.id &&
                styles.selectedLevel,
            ]}
            onPress={() => selectOption('workoutLocation', location.id)}
          >
            <Text
              style={[
                styles.levelTitle,
                onboardingData.workoutLocation === location.id &&
                  styles.selectedLevelText,
              ]}
            >
              {location.label}
            </Text>
            <Text
              style={[
                styles.levelDescription,
                onboardingData.workoutLocation === location.id &&
                  styles.selectedLevelDescription,
              ]}
            >
              {location.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderAvailableEquipment = () => {
    const filteredEquipment = Object.entries(equipmentCategories).flatMap(
      ([categoryKey, items]) =>
        items.filter((item) =>
          item.label.toLowerCase().includes(equipmentSearchQuery.toLowerCase())
        )
    );

    return (
      <View style={styles.stepContent}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for equipment..."
          placeholderTextColor="#94A3B8"
          value={equipmentSearchQuery}
          onChangeText={(text) => setEquipmentSearchQuery(text)}
        />
        <ScrollView
          style={styles.equipmentScroll}
          showsVerticalScrollIndicator={false}
        >
          {filteredEquipment.length === 0 &&
            equipmentSearchQuery.length > 0 && (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>
                  No equipment found for "{equipmentSearchQuery}"
                </Text>
              </View>
            )}
          {filteredEquipment.length > 0 && (
            <>
              {Object.entries(equipmentCategories).map(
                ([categoryKey, items]) => (
                  <View key={categoryKey} style={styles.equipmentCategory}>
                    <Text style={styles.categoryTitle}>
                      {categoryKey === 'plated-machines' && 'Plated machines'}
                      {categoryKey === 'benches-racks' && 'Benches & racks'}
                      {categoryKey === 'cable-machines' && 'Cable machines'}
                      {categoryKey === 'bars-plates' && 'Bars & plates'}
                      {categoryKey === 'resistance-bands' && 'Resistance bands'}
                      {categoryKey === 'exercise-balls' &&
                        'Exercise balls & more'}
                      {categoryKey === 'small-weights' && 'Small weights'}
                    </Text>
                    {items
                      .filter((item) =>
                        item.label
                          .toLowerCase()
                          .includes(equipmentSearchQuery.toLowerCase())
                      )
                      .map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          style={[
                            styles.equipmentItem,
                            (onboardingData.equipment.includes(item.id) ||
                              item.selected) &&
                              styles.selectedEquipmentItem,
                          ]}
                          onPress={() => toggleEquipment(item.id)}
                        >
                          <View style={styles.equipmentInfo}>
                            <Text
                              style={[
                                styles.equipmentLabel,
                                (onboardingData.equipment.includes(item.id) ||
                                  item.selected) &&
                                  styles.selectedEquipmentLabel,
                              ]}
                            >
                              {item.label}
                            </Text>
                            {item.description && (
                              <Text
                                style={[
                                  styles.equipmentDescription,
                                  (onboardingData.equipment.includes(item.id) ||
                                    item.selected) &&
                                    styles.selectedEquipmentDescription,
                                ]}
                              >
                                {item.description}
                              </Text>
                            )}
                          </View>
                          <View
                            style={[
                              styles.checkbox,
                              (onboardingData.equipment.includes(item.id) ||
                                item.selected) &&
                                styles.checkedBox,
                            ]}
                          />
                        </TouchableOpacity>
                      ))}
                  </View>
                )
              )}
            </>
          )}
        </ScrollView>
      </View>
    );
  };

  const renderWorkoutFrequency = () => (
    <View style={styles.stepContent}>
      <View style={styles.frequencyTabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            frequencyTab === 'days-per-week' && styles.activeTab,
          ]}
          onPress={() => setFrequencyTab('days-per-week')}
        >
          <Text
            style={
              frequencyTab === 'days-per-week'
                ? styles.activeTabText
                : styles.tabText
            }
          >
            Days Per Week
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            frequencyTab === 'specific-days' && styles.activeTab,
          ]}
          onPress={() => setFrequencyTab('specific-days')}
        >
          <Text
            style={
              frequencyTab === 'specific-days'
                ? styles.activeTabText
                : styles.tabText
            }
          >
            Specific Days
          </Text>
        </TouchableOpacity>
      </View>

      {frequencyTab === 'days-per-week' ? (
        <View style={styles.optionsColumn}>
          {workoutFrequencies.map((frequency) => (
            <TouchableOpacity
              key={frequency.id}
              style={[
                styles.routineCard,
                onboardingData.workoutFrequency === frequency.id &&
                  styles.selectedRoutine,
              ]}
              onPress={() => selectOption('workoutFrequency', frequency.id)}
            >
              <Text
                style={[
                  styles.routineText,
                  onboardingData.workoutFrequency === frequency.id &&
                    styles.selectedRoutineText,
                ]}
              >
                {frequency.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.optionsColumn}>
          {specificDaysOptions.map((day) => (
            <TouchableOpacity
              key={day.id}
              style={[
                styles.routineCard,
                onboardingData.specificDays.includes(day.id) &&
                  styles.selectedRoutine,
              ]}
              onPress={() => toggleSpecificDay(day.id)}
            >
              <Text
                style={[
                  styles.routineText,
                  onboardingData.specificDays.includes(day.id) &&
                    styles.selectedRoutineText,
                ]}
              >
                {day.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderWorkoutPreviews = () => (
    <View style={styles.stepContent}>
      <Text style={styles.exampleLabel}>Example:</Text>

      <View style={styles.notificationExample}>
        <View style={styles.notificationHeader}>
          <View style={styles.appIcon}>
            <Zap size={20} color="#FFFFFF" />
          </View>
          <View style={styles.notificationInfo}>
            <Text style={styles.appName}>BoltLab</Text>
            <Text style={styles.notificationTime}>1h ago</Text>
          </View>
        </View>
        <Text style={styles.notificationTitle}>
          Today's Workout: Chest, Shoulders, Abs
        </Text>
        <Text style={styles.notificationBody}>
          Barbell Bench Press • Dumbbell Shoulder Raise • Cable Crossover Fly •
          Abs Rollout
        </Text>
      </View>

      <Text style={styles.timeLabel}>
        Choose a time to receive your preview:
      </Text>

      <TouchableOpacity
        style={styles.timeSelector}
        onPress={() => setShowTimePicker(true)}
      >
        <Text style={styles.timeField}>Time</Text>
        <View style={styles.timeValueContainer}>
          <Text style={styles.timeValue}>
            {onboardingData.workoutPreviewTime}
          </Text>
          <ChevronDown size={20} color="#94A3B8" />
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderBodyStats = () => (
    <View style={styles.stepContent}>
      <Text style={styles.orText}>OR</Text>

      <Text style={styles.manualTitle}>Enter manually</Text>
      <Text style={styles.manualSubtitle}>Optional and can be added later</Text>

      <View style={styles.unitsToggle}>
        <TouchableOpacity
          style={[
            styles.unitOption,
            onboardingData.preferredUnits === 'metric' &&
              styles.activeUnitOption,
          ]}
          onPress={() => updateField('preferredUnits', 'metric')}
        >
          <Text
            style={[
              styles.unitText,
              onboardingData.preferredUnits === 'metric' &&
                styles.activeUnitText,
            ]}
          >
            Metric
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.unitOption,
            onboardingData.preferredUnits === 'imperial' &&
              styles.activeUnitOption,
          ]}
          onPress={() => updateField('preferredUnits', 'imperial')}
        >
          <Text
            style={[
              styles.unitText,
              onboardingData.preferredUnits === 'imperial' &&
                styles.activeUnitText,
            ]}
          >
            Imperial
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Gender</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowGenderModal(true)}
        >
          <Text style={styles.dropdownText}>
            {onboardingData.gender || 'Select gender'}
          </Text>
          <ChevronDown size={20} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Date of Birth</Text>
        <View style={styles.dateInputContainer}>
          <TextInput
            style={[styles.textInput, styles.dateInput]}
            placeholder="MM"
            placeholderTextColor="#64748B"
            value={onboardingData.birthMonth}
            onChangeText={(value) => updateField('birthMonth', value)}
            keyboardType="numeric"
            maxLength={2}
          />
          <Text style={styles.dateSeparator}>/</Text>
          <TextInput
            style={[styles.textInput, styles.dateInput]}
            placeholder="DD"
            placeholderTextColor="#64748B"
            value={onboardingData.birthDay}
            onChangeText={(value) => updateField('birthDay', value)}
            keyboardType="numeric"
            maxLength={2}
          />
          <Text style={styles.dateSeparator}>/</Text>
          <TextInput
            style={[styles.textInput, styles.yearInput]}
            placeholder="YYYY"
            placeholderTextColor="#64748B"
            value={onboardingData.birthYear}
            onChangeText={(value) => updateField('birthYear', value)}
            keyboardType="numeric"
            maxLength={4}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          Height{' '}
          {onboardingData.preferredUnits === 'metric' ? '(cm)' : '(ft/in)'}
        </Text>
        {onboardingData.preferredUnits === 'metric' ? (
          <TextInput
            style={styles.textInput}
            placeholder="Enter height in cm"
            placeholderTextColor="#64748B"
            value={onboardingData.height}
            onChangeText={(value) => updateField('height', value)}
            keyboardType="numeric"
          />
        ) : (
          <View style={styles.heightInputContainer}>
            <TextInput
              style={[styles.textInput, styles.heightInput]}
              placeholder="5"
              placeholderTextColor="#64748B"
              value={onboardingData.heightFeet}
              onChangeText={(value) => updateField('heightFeet', value)}
              keyboardType="numeric"
              maxLength={1}
            />
            <Text style={styles.heightLabel}>ft</Text>
            <TextInput
              style={[styles.textInput, styles.heightInput]}
              placeholder="10"
              placeholderTextColor="#64748B"
              value={onboardingData.heightInches}
              onChangeText={(value) => updateField('heightInches', value)}
              keyboardType="numeric"
              maxLength={2}
            />
            <Text style={styles.heightLabel}>in</Text>
          </View>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          Weight {onboardingData.preferredUnits === 'metric' ? '(kg)' : '(lbs)'}
        </Text>
        <TextInput
          style={styles.textInput}
          placeholder={`Enter weight in ${
            onboardingData.preferredUnits === 'metric' ? 'kg' : 'lbs'
          }`}
          placeholderTextColor="#64748B"
          value={onboardingData.weight}
          onChangeText={(value) => updateField('weight', value)}
          keyboardType="numeric"
        />
      </View>
    </View>
  );

  const renderProgramSummary = () => {
    // Determine training goal label
    const goalLabel =
      trainingGoals.find((g) => g.id === onboardingData.topTrainingGoal)
        ?.label || 'Build Muscle';

    // Determine equipment profile
    let equipmentProfile = 'Custom';
    if (onboardingData.workoutLocation === 'at-home')
      equipmentProfile = 'Home Gym';
    else if (onboardingData.workoutLocation === 'large-gym')
      equipmentProfile = 'Full Gym';
    else if (onboardingData.workoutLocation === 'garage-gym')
      equipmentProfile = 'Garage Gym';

    // Determine difficulty
    let difficulty = 'Beginner';
    if (onboardingData.experienceLevel === 'expert') difficulty = 'Advanced';
    else if (onboardingData.experienceLevel === 'foundational')
      difficulty = 'Intermediate';

    return (
      <View style={styles.stepContent}>
        <View style={styles.programHeader}>
          <Text style={styles.programTitle}>{goalLabel}</Text>
        </View>

        <View style={styles.programDetails}>
          <View style={styles.programItem}>
            <View style={styles.programIcon}>
              <Dumbbell size={20} color="#64748B" />
            </View>
            <View style={styles.programInfo}>
              <Text style={styles.programLabel}>Training Style</Text>
              <Text style={styles.programValue}>Strength Training</Text>
            </View>
          </View>

          <View style={styles.programItem}>
            <View style={styles.programIcon}>
              <Calendar size={20} color="#64748B" />
            </View>
            <View style={styles.programInfo}>
              <Text style={styles.programLabel}>Muscle Split</Text>
              <Text style={styles.programValue}>Full Body</Text>
            </View>
          </View>

          <View style={styles.programItem}>
            <View style={styles.programIcon}>
              <Target size={20} color="#64748B" />
            </View>
            <View style={styles.programInfo}>
              <Text style={styles.programLabel}>Equipment Profile</Text>
              <Text style={styles.programValue}>{equipmentProfile}</Text>
            </View>
          </View>

          <View style={styles.programItem}>
            <View style={styles.programIcon}>
              <TrendingUp size={20} color="#64748B" />
            </View>
            <View style={styles.programInfo}>
              <Text style={styles.programLabel}>Exercise Difficulty</Text>
              <Text style={styles.programValue}>{difficulty}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderStepContent = () => {
    switch (steps[currentStep].component) {
      case 'topTrainingGoal':
        return renderTopTrainingGoal();
      case 'experienceLevel':
        return renderExperienceLevel();
      case 'currentStrengthRoutine':
        return renderCurrentStrengthRoutine();
      case 'whyHere':
        return renderWhyHere();
      case 'howDidYouHear':
        return renderHowDidYouHear();
      case 'workoutLocation':
        return renderWorkoutLocation();
      case 'availableEquipment':
        return renderAvailableEquipment();
      case 'workoutFrequency':
        return renderWorkoutFrequency();
      case 'workoutPreviews':
        return renderWorkoutPreviews();
      case 'accountCreation':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.manualTitle}>Create Your Account</Text>
            <Text style={styles.manualSubtitle}>
              Enter your details to get started with BoltLab
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your full name"
                placeholderTextColor="#64748B"
                value={onboardingData.fullName}
                onChangeText={(value) => updateField('fullName', value)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your email"
                placeholderTextColor="#64748B"
                value={onboardingData.email}
                onChangeText={(value) => updateField('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={[
                  styles.textInput,
                  onboardingData.password.length > 0 &&
                    onboardingData.password.length < 6 &&
                    styles.errorInput,
                ]}
                placeholder="Enter your password (min 6 characters)"
                placeholderTextColor="#64748B"
                value={onboardingData.password}
                onChangeText={(value) => updateField('password', value)}
                secureTextEntry
              />
              {onboardingData.password.length > 0 &&
                onboardingData.password.length < 6 && (
                  <Text style={styles.errorText}>
                    Password must be at least 6 characters
                  </Text>
                )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <TextInput
                style={[
                  styles.textInput,
                  onboardingData.confirmPassword.length > 0 &&
                    onboardingData.password !==
                      onboardingData.confirmPassword &&
                    styles.errorInput,
                ]}
                placeholder="Confirm your password"
                placeholderTextColor="#64748B"
                value={onboardingData.confirmPassword}
                onChangeText={(value) => updateField('confirmPassword', value)}
                secureTextEntry
              />
              {onboardingData.confirmPassword.length > 0 &&
                onboardingData.password !== onboardingData.confirmPassword && (
                  <Text style={styles.errorText}>Passwords do not match</Text>
                )}
              {onboardingData.confirmPassword.length > 0 &&
                onboardingData.password === onboardingData.confirmPassword &&
                onboardingData.password.length >= 6 && (
                  <Text style={styles.successText}>✓ Passwords match</Text>
                )}
            </View>

            <View style={styles.warningContainer}>
              <Text style={styles.warningIcon}>🔒</Text>
              <Text style={styles.warningText}>
                Your account will be created securely. Password must be at least
                6 characters long.
              </Text>
            </View>
          </View>
        );
      case 'bodyStats':
        return renderBodyStats();
      case 'programSummary':
        return renderProgramSummary();
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return onboardingData.topTrainingGoal !== '';
      case 1:
        return onboardingData.experienceLevel !== '';
      case 2:
        return onboardingData.currentStrengthRoutine !== '';
      case 3:
        return onboardingData.whyHere !== '';
      case 4:
        return onboardingData.howDidYouHear !== '';
      case 5:
        return onboardingData.workoutLocation !== '';
      case 6:
        return true; // Equipment is optional
      case 7:
        return frequencyTab === 'days-per-week'
          ? onboardingData.workoutFrequency !== ''
          : onboardingData.specificDays.length > 0;
      case 8:
        return true; // Body stats are optional
      case 9:
        return true; // Workout previews are optional
      case 10:
        return (
          onboardingData.fullName.trim() !== '' &&
          onboardingData.email.trim() !== '' &&
          onboardingData.password !== '' &&
          onboardingData.confirmPassword !== '' &&
          onboardingData.password === onboardingData.confirmPassword &&
          onboardingData.password.length >= 6
        );
      case 11:
        return true; // Program summary
      default:
        return false;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.background}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${((currentStep + 1) / steps.length) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {currentStep + 1} of {steps.length}
            </Text>
          </View>

          <View style={styles.headerRight}>
            {currentStep < steps.length - 1 ? (
              <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.headerSpacer} />
            )}
          </View>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {steps[currentStep].component !== 'availableEquipment' && (
              <>
                <Text style={styles.stepTitle}>{steps[currentStep].title}</Text>
                {steps[currentStep].subtitle && (
                  <Text style={styles.stepSubtitle}>
                    {steps[currentStep].subtitle}
                  </Text>
                )}
              </>
            )}
            {renderStepContent()}
          </View>
        </ScrollView>

        {/* Navigation */}
        <View style={styles.navigation}>
          {steps[currentStep].component === 'workoutPreviews' ? (
            <View style={styles.previewButtons}>
              <TouchableOpacity
                style={[
                  styles.notNowButton,
                  onboardingData.enableNotifications === false &&
                    styles.selectedNotNowButton,
                ]}
                onPress={() => {
                  updateField('enableNotifications', false);
                  handleNext();
                }}
              >
                <Text
                  style={[
                    styles.notNowText,
                    onboardingData.enableNotifications === false &&
                      styles.selectedNotNowText,
                  ]}
                >
                  Not Now
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.enableButton}
                onPress={() => {
                  updateField('enableNotifications', true);
                  handleNext();
                }}
              >
                <LinearGradient
                  colors={
                    onboardingData.enableNotifications === true
                      ? ['#6B46C1', '#8B5CF6']
                      : ['#374151', '#4B5563']
                  }
                  style={styles.enableButtonGradient}
                >
                  <Text style={styles.enableText}>Enable Notifications</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.nextButton,
                !canProceed() && styles.disabledButton,
              ]}
              onPress={handleNext}
              disabled={!canProceed()}
            >
              <LinearGradient
                colors={
                  canProceed() ? ['#6B46C1', '#8B5CF6'] : ['#374151', '#4B5563']
                }
                style={styles.nextButtonGradient}
              >
                <Text style={styles.nextButtonText}>
                  {currentStep === steps.length - 1
                    ? 'Get Your Program'
                    : 'Next'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {renderGenderModal()}
      {renderTimeModal()}
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
    backgroundColor: '#0F0F23',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    minHeight: 80,
  },
  headerLeft: {
    width: 60,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerRight: {
    width: 60,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 24,
    height: 24,
  },
  backButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    height: 40,
    marginTop: 6,
  },
  progressBackground: {
    width: '100%',
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6B46C1',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  skipButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  stepTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'left',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'left',
    marginBottom: 40,
  },
  stepContent: {
    flex: 1,
    minHeight: 400,
  },
  optionsColumn: {
    gap: 16,
  },
  levelCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1A1A2E',
  },
  selectedLevel: {
    backgroundColor: '#6B46C1',
    borderColor: '#6B46C1',
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  selectedLevelText: {
    color: '#FFFFFF',
  },
  levelDescription: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
  selectedLevelDescription: {
    color: '#E2E8F0',
  },
  routineCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#1A1A2E',
  },
  selectedRoutine: {
    backgroundColor: '#6B46C1',
    borderColor: '#6B46C1',
  },
  routineText: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
  },
  selectedRoutineText: {
    color: '#FFFFFF',
  },

  equipmentScroll: {
    flex: 1,
  },
  equipmentCategory: {
    marginBottom: 30,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  selectedEquipmentItem: {
    backgroundColor: '#6B46C1',
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  selectedEquipmentLabel: {
    color: '#FFFFFF',
  },
  equipmentDescription: {
    fontSize: 14,
    color: '#94A3B8',
  },
  selectedEquipmentDescription: {
    color: '#E2E8F0',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#4B5563',
  },
  checkedBox: {
    backgroundColor: '#6B46C1',
    borderColor: '#6B46C1',
  },
  searchInput: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 20,
  },
  noResultsContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#94A3B8',
  },
  frequencyTabs: {
    flexDirection: 'row',
    marginBottom: 30,
    backgroundColor: '#1A1A2E',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#6B46C1',
  },
  tabText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  activeTabText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  exampleLabel: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 16,
  },
  notificationExample: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  appIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#6B46C1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  notificationInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  notificationTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 18,
  },
  timeLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  timeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
  },
  timeField: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  timeValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeValue: {
    fontSize: 16,
    color: '#94A3B8',
    marginRight: 8,
  },
  previewButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  notNowButton: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  selectedNotNowButton: {
    backgroundColor: '#6B46C1',
  },
  notNowText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  selectedNotNowText: {
    color: '#FFFFFF',
  },
  enableButton: {
    flex: 1,
    borderRadius: 12,
  },
  enableButtonGradient: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  enableText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  orText: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 20,
  },
  manualTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'left',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  manualSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'left',
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 8,
  },
  dropdown: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
  },
  textInput: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateInput: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 4,
  },
  yearInput: {
    flex: 1.5,
    textAlign: 'center',
    marginHorizontal: 4,
  },
  dateSeparator: {
    fontSize: 18,
    color: '#94A3B8',
    marginHorizontal: 8,
  },
  heightInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heightInput: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 4,
  },
  heightLabel: {
    fontSize: 16,
    color: '#94A3B8',
    marginHorizontal: 8,
  },
  unitsToggle: {
    flexDirection: 'row',
    backgroundColor: '#1A1A2E',
    borderRadius: 8,
    padding: 4,
    marginBottom: 30,
  },
  unitOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeUnitOption: {
    backgroundColor: '#6B46C1',
  },
  unitText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  activeUnitText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  errorInput: {
    borderColor: '#DC2626',
    borderWidth: 1,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 4,
  },
  successText: {
    fontSize: 12,
    color: '#22C55E',
    marginTop: 4,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  warningIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  warningText: {
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
  },
  programHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  programTitle: {
    fontSize: 48,
    fontWeight: '700',
    color: '#6B46C1',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  programDetails: {
    gap: 20,
  },
  programItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 20,
  },
  programIcon: {
    marginRight: 16,
  },
  programInfo: {
    flex: 1,
  },
  programLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  programValue: {
    fontSize: 14,
    color: '#94A3B8',
  },
  navigation: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 20,
  },
  nextButton: {
    borderRadius: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
  nextButtonGradient: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    width: '80%',
    maxHeight: '70%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  modalOptionText: {
    fontSize: 18,
    color: '#FFFFFF',
    flex: 1,
  },
  selectedModalOption: {
    backgroundColor: '#6B46C1',
  },
  selectedModalOptionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
