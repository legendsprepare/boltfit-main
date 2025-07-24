import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Zap,
  Dumbbell,
  User,
  Settings,
  Info,
  Play,
  Star,
  MoreHorizontal,
} from 'lucide-react-native';
import { Exercise } from '@/types/workout';

interface ExerciseCardProps {
  exercise: Exercise;
  onStart: (exercise: Exercise) => void;
  onShowDetails?: (exercise: Exercise) => void;
  showFullDetails?: boolean;
}

const getMuscleGroupIcon = (muscleGroup: string) => {
  switch (muscleGroup.toLowerCase()) {
    case 'chest':
    case 'back':
    case 'shoulders':
      return Dumbbell;
    case 'legs':
      return User;
    case 'arms':
      return Settings;
    default:
      return Dumbbell;
  }
};

const getCategoryColor = (category: string | undefined) => {
  if (!category) return '#6B46C1';
  switch (category) {
    case 'strength':
      return '#6B46C1';
    case 'cardio':
      return '#3B82F6';
    case 'flexibility':
      return '#10B981';
    case 'balance':
      return '#F59E0B';
    default:
      return '#6B46C1';
  }
};

// Helper function to get exercise image
const getExerciseImage = (exerciseId: string) => {
  try {
    // Convert exercise ID to folder name (match the folder structure)
    const folderMap: { [key: string]: string } = {
      '34-situp': '3_4_Sit-Up',
      'barbell-bench-press': 'Barbell_Bench_Press_-_Medium_Grip',
      'barbell-bench-press-medium-grip': 'Barbell_Bench_Press_-_Medium_Grip',
      'dumbbell-bent-over-row': 'Bent_Over_Two-Dumbbell_Row',
      'bent-over-two-dumbbell-row': 'Bent_Over_Two-Dumbbell_Row',
      'barbell-curl': 'Barbell_Curl',
      'dumbbell-fly': 'Bent-Arm_Dumbbell_Pullover', // Using similar exercise as fallback
      pushups: 'Push-ups', // This might not exist, will fall back to placeholder
      'body-up': 'Body-Up',
      bodyup: 'Body-Up',
      'good-morning': 'Good_Morning',
      'jogging-treadmill': 'Jogging,_Treadmill',
      situp: 'Sit-Up',
      'sit-up': 'Sit-Up',
    };

    const folderName = folderMap[exerciseId] || exerciseId;

    // Try to require the image based on the folder structure
    // This is a simplified approach - in a real app, you'd have a more robust mapping
    switch (folderName) {
      case '3_4_Sit-Up':
        return require('@/assets/images/exercises/3_4_Sit-Up/images/0.jpg');
      case 'Barbell_Bench_Press_-_Medium_Grip':
        return require('@/assets/images/exercises/Barbell_Bench_Press_-_Medium_Grip/images/0.jpg');
      case 'Bent_Over_Two-Dumbbell_Row':
        return require('@/assets/images/exercises/Bent_Over_Two-Dumbbell_Row/images/0.jpg');
      case 'Barbell_Curl':
        return require('@/assets/images/exercises/Barbell_Curl/images/0.jpg');
      case 'Body-Up':
        return require('@/assets/images/exercises/Body-Up/images/0.jpg');
      default:
        return null;
    }
  } catch (error) {
    console.log('Error loading exercise image:', error);
    return null;
  }
};

export default function ExerciseCard({
  exercise,
  onStart,
  onShowDetails,
  showFullDetails = false,
}: ExerciseCardProps) {
  const [imageError, setImageError] = useState(false);
  const categoryColor = getCategoryColor(exercise.category);
  const MuscleIcon = getMuscleGroupIcon(exercise.muscleGroup);
  const exerciseImage = getExerciseImage(exercise.id);

  const handleImageError = () => {
    setImageError(true);
  };

  const showInstructions = () => {
    if (onShowDetails) {
      onShowDetails(exercise);
    } else {
      // Show basic instructions in an alert if no custom handler
      const setupInstructions =
        exercise.instructions?.setup?.slice(0, 3).join('\n• ') ||
        'No instructions available';
      Alert.alert(`${exercise.name} Instructions`, `• ${setupInstructions}`, [
        { text: 'Got it!' },
      ]);
    }
  };

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={['#1A1A2E', '#0F0F23']}
        style={styles.cardGradient}
      >
        {/* Exercise Image */}
        <View style={styles.imageContainer}>
          {!imageError && exerciseImage ? (
            <Image
              source={exerciseImage}
              style={styles.exerciseImage}
              onError={handleImageError}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.imagePlaceholder,
                { backgroundColor: categoryColor + '20' },
              ]}
            >
              <MuscleIcon size={24} color={categoryColor} />
            </View>
          )}

          {/* Muscle Group Icon Overlay */}
          <View style={styles.muscleIconOverlay}>
            <MuscleIcon size={20} color="#FFFFFF" />
          </View>
        </View>

        {/* Exercise Info */}
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <Text style={styles.exerciseDetails}>
            {exercise.sets || 3} sets • {exercise.reps || 8} reps •{' '}
            {exercise.weight || 0} lb
          </Text>
        </View>

        {/* More Options */}
        <TouchableOpacity style={styles.moreButton} onPress={showInstructions}>
          <MoreHorizontal size={20} color="#94A3B8" />
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 16,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  exerciseImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  muscleIconOverlay: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '400',
  },
  moreButton: {
    padding: 8,
  },
});
