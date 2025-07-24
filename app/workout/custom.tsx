import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Search,
  Dumbbell,
  Timer,
  Target,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { exerciseLibrary } from '@/data/exercises';
import { Exercise } from '@/types/workout';

interface CustomExercise {
  id: string;
  exercise: Exercise;
  sets: number;
  reps: number;
  weight: number;
  restTime: number;
}

interface CustomWorkout {
  name: string;
  exercises: CustomExercise[];
  estimatedDuration: number;
}

export default function CustomWorkoutScreen() {
  const router = useRouter();
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState<CustomExercise[]>([]);
  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const addExercise = (exercise: Exercise) => {
    const newExercise: CustomExercise = {
      id: Date.now().toString() + exercise.id,
      exercise,
      sets: 3,
      reps: 10,
      weight: 0,
      restTime: 60,
    };
    setExercises([...exercises, newExercise]);
    setShowExerciseLibrary(false);
  };

  const removeExercise = (exerciseId: string) => {
    setExercises(exercises.filter((ex) => ex.id !== exerciseId));
  };

  const updateExercise = (
    exerciseId: string,
    field: keyof CustomExercise,
    value: any
  ) => {
    setExercises(
      exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, [field]: value } : ex
      )
    );
  };

  const calculateDuration = () => {
    const totalSets = exercises.reduce((sum, ex) => sum + ex.sets, 0);
    const totalRestTime = exercises.reduce(
      (sum, ex) => sum + ex.sets * ex.restTime,
      0
    );
    const workingTime = totalSets * 45; // Assume 45 seconds per set
    return Math.round((totalRestTime + workingTime) / 60); // Convert to minutes
  };

  const saveWorkout = () => {
    if (!workoutName.trim()) {
      Alert.alert('Error', 'Please enter a workout name');
      return;
    }

    if (exercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise');
      return;
    }

    const workout: CustomWorkout = {
      name: workoutName,
      exercises,
      estimatedDuration: calculateDuration(),
    };

    // Navigate to active workout with custom workout data
    router.push({
      pathname: '/workout/active',
      params: {
        customWorkoutData: JSON.stringify(workout),
      },
    });
  };

  const filteredExercises = exerciseLibrary.filter(
    (exercise) =>
      exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderExerciseLibraryItem = (exercise: Exercise) => (
    <TouchableOpacity
      key={exercise.id}
      style={styles.libraryItem}
      onPress={() => addExercise(exercise)}
    >
      <LinearGradient
        colors={['#1A1A2E', '#0F0F23']}
        style={styles.libraryItemGradient}
      >
        <View style={styles.libraryItemContent}>
          <View style={styles.libraryItemIcon}>
            <Dumbbell size={20} color="#6B46C1" />
          </View>
          <View style={styles.libraryItemInfo}>
            <Text style={styles.libraryItemName}>{exercise.name}</Text>
            <Text style={styles.libraryItemMuscle}>{exercise.muscleGroup}</Text>
          </View>
          <Plus size={20} color="#6B46C1" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderCustomExercise = (
    customExercise: CustomExercise,
    index: number
  ) => (
    <View key={customExercise.id} style={styles.exerciseCard}>
      <LinearGradient
        colors={['#1A1A2E', '#0F0F23']}
        style={styles.exerciseGradient}
      >
        <View style={styles.exerciseHeader}>
          <Text style={styles.exerciseName}>
            {customExercise.exercise.name}
          </Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => removeExercise(customExercise.id)}
          >
            <Trash2 size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>

        <View style={styles.exerciseInputs}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Sets</Text>
            <TextInput
              style={styles.numberInput}
              value={customExercise.sets.toString()}
              onChangeText={(text) =>
                updateExercise(customExercise.id, 'sets', parseInt(text) || 0)
              }
              keyboardType="numeric"
              placeholder="3"
              placeholderTextColor="#64748B"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Reps</Text>
            <TextInput
              style={styles.numberInput}
              value={customExercise.reps.toString()}
              onChangeText={(text) =>
                updateExercise(customExercise.id, 'reps', parseInt(text) || 0)
              }
              keyboardType="numeric"
              placeholder="10"
              placeholderTextColor="#64748B"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Weight (lbs)</Text>
            <TextInput
              style={styles.numberInput}
              value={customExercise.weight.toString()}
              onChangeText={(text) =>
                updateExercise(customExercise.id, 'weight', parseInt(text) || 0)
              }
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#64748B"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Rest (sec)</Text>
            <TextInput
              style={styles.numberInput}
              value={customExercise.restTime.toString()}
              onChangeText={(text) =>
                updateExercise(
                  customExercise.id,
                  'restTime',
                  parseInt(text) || 0
                )
              }
              keyboardType="numeric"
              placeholder="60"
              placeholderTextColor="#64748B"
            />
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  if (showExerciseLibrary) {
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
              onPress={() => setShowExerciseLibrary(false)}
            >
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add Exercise</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Search */}
          <View style={styles.searchSection}>
            <View style={styles.searchContainer}>
              <Search size={20} color="#6B46C1" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search exercises..."
                placeholderTextColor="#64748B"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* Exercise Library */}
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {filteredExercises.map(renderExerciseLibraryItem)}
          </ScrollView>
        </LinearGradient>
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
          <Text style={styles.headerTitle}>Custom Workout</Text>
          <TouchableOpacity
            style={styles.saveHeaderButton}
            onPress={saveWorkout}
          >
            <Save size={20} color="#6B46C1" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Workout Name */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Workout Name</Text>
            <TextInput
              style={styles.workoutNameInput}
              placeholder="Enter workout name..."
              placeholderTextColor="#64748B"
              value={workoutName}
              onChangeText={setWorkoutName}
            />
          </View>

          {/* Workout Summary */}
          {exercises.length > 0 && (
            <View style={styles.section}>
              <View style={styles.summaryCard}>
                <LinearGradient
                  colors={['#1A1A2E', '#0F0F23']}
                  style={styles.summaryGradient}
                >
                  <View style={styles.summaryStats}>
                    <View style={styles.summaryItem}>
                      <Target size={20} color="#6B46C1" />
                      <Text style={styles.summaryValue}>
                        {exercises.length}
                      </Text>
                      <Text style={styles.summaryLabel}>Exercises</Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Dumbbell size={20} color="#10B981" />
                      <Text style={styles.summaryValue}>
                        {exercises.reduce((sum, ex) => sum + ex.sets, 0)}
                      </Text>
                      <Text style={styles.summaryLabel}>Total Sets</Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Timer size={20} color="#F59E0B" />
                      <Text style={styles.summaryValue}>
                        {calculateDuration()}
                      </Text>
                      <Text style={styles.summaryLabel}>Est. Minutes</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            </View>
          )}

          {/* Exercises */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Exercises</Text>
              <TouchableOpacity
                style={styles.addExerciseButton}
                onPress={() => setShowExerciseLibrary(true)}
              >
                <Plus size={16} color="#FFFFFF" />
                <Text style={styles.addExerciseText}>Add</Text>
              </TouchableOpacity>
            </View>

            {exercises.length === 0 ? (
              <View style={styles.emptyState}>
                <Dumbbell size={48} color="#64748B" />
                <Text style={styles.emptyStateText}>
                  No exercises added yet
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  Tap "Add" to start building your workout
                </Text>
              </View>
            ) : (
              exercises.map(renderCustomExercise)
            )}
          </View>

          {/* Save Button */}
          {exercises.length > 0 && (
            <View style={styles.section}>
              <TouchableOpacity style={styles.saveButton} onPress={saveWorkout}>
                <LinearGradient
                  colors={['#6B46C1', '#8B5CF6']}
                  style={styles.saveButtonGradient}
                >
                  <Save size={20} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>Start Workout</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
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
  saveHeaderButton: {
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
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  workoutNameInput: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#1A1A2E',
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryGradient: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1A1A2E',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6B46C1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  addExerciseText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EF4444' + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputGroup: {
    flex: 1,
    marginHorizontal: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 8,
  },
  numberInput: {
    backgroundColor: '#0F0F23',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  saveButton: {
    borderRadius: 16,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 12,
  },
  libraryItem: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  libraryItemGradient: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1A1A2E',
  },
  libraryItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  libraryItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6B46C1' + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  libraryItemInfo: {
    flex: 1,
  },
  libraryItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  libraryItemMuscle: {
    fontSize: 14,
    color: '#94A3B8',
  },
});
