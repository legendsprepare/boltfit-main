import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Play,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Star,
  Target,
  Settings,
} from 'lucide-react-native';
import { Exercise } from '@/types/workout';

const { width } = Dimensions.get('window');

// Helper function to get exercise image
const getExerciseImage = (
  exerciseId: string,
  imageType: 'demonstration' | 'start' | 'end' = 'demonstration'
) => {
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

    // Determine which image to load based on type
    const imageIndex = imageType === 'start' ? '0' : '1';

    // Try to require the image based on the folder structure
    switch (folderName) {
      case '3_4_Sit-Up':
        return imageType === 'start'
          ? require('@/assets/images/exercises/3_4_Sit-Up/images/0.jpg')
          : require('@/assets/images/exercises/3_4_Sit-Up/images/1.jpg');
      case 'Barbell_Bench_Press_-_Medium_Grip':
        return imageType === 'start'
          ? require('@/assets/images/exercises/Barbell_Bench_Press_-_Medium_Grip/images/0.jpg')
          : require('@/assets/images/exercises/Barbell_Bench_Press_-_Medium_Grip/images/1.jpg');
      case 'Bent_Over_Two-Dumbbell_Row':
        return imageType === 'start'
          ? require('@/assets/images/exercises/Bent_Over_Two-Dumbbell_Row/images/0.jpg')
          : require('@/assets/images/exercises/Bent_Over_Two-Dumbbell_Row/images/1.jpg');
      case 'Barbell_Curl':
        return imageType === 'start'
          ? require('@/assets/images/exercises/Barbell_Curl/images/0.jpg')
          : require('@/assets/images/exercises/Barbell_Curl/images/1.jpg');
      case 'Body-Up':
        return imageType === 'start'
          ? require('@/assets/images/exercises/Body-Up/images/0.jpg')
          : require('@/assets/images/exercises/Body-Up/images/1.jpg');
      default:
        return null;
    }
  } catch (error) {
    console.log('Error loading exercise image:', error);
    return null;
  }
};

interface ExerciseInstructionsProps {
  exercise: Exercise;
  visible: boolean;
  onClose: () => void;
  onStartExercise: (exercise: Exercise) => void;
  onReplace?: (exercise: Exercise) => void;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner':
      return '#10B981';
    case 'intermediate':
      return '#F59E0B';
    case 'advanced':
      return '#EF4444';
    default:
      return '#6B46C1';
  }
};

const getDifficultyStars = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner':
      return 1;
    case 'intermediate':
      return 2;
    case 'advanced':
      return 3;
    default:
      return 1;
  }
};

export default function ExerciseInstructions({
  exercise,
  visible,
  onClose,
  onStartExercise,
  onReplace,
}: ExerciseInstructionsProps) {
  const [selectedImageType, setSelectedImageType] = useState<
    'demonstration' | 'start' | 'end'
  >('demonstration');
  const [imageError, setImageError] = useState(false);
  const difficultyColor = getDifficultyColor(exercise.difficulty);
  const difficultyStars = getDifficultyStars(exercise.difficulty);

  const handleImageError = () => {
    setImageError(true);
  };

  const renderInstructionsList = (
    title: string,
    instructions: string[],
    icon: any
  ) => {
    if (!instructions || instructions.length === 0) return null;

    return (
      <View style={styles.instructionsSection}>
        <View style={styles.sectionHeader}>
          {React.createElement(icon, { size: 20, color: '#6B46C1' })}
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {instructions.map((instruction, index) => (
          <View key={index} style={styles.instructionItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepText}>{index + 1}</Text>
            </View>
            <Text style={styles.instructionText}>{instruction}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderImageSelector = () => {
    const imageOptions = [
      {
        key: 'demonstration',
        label: 'Demo',
        image: exercise.images?.demonstration,
      },
      { key: 'start', label: 'Start', image: exercise.images?.startPosition },
      { key: 'end', label: 'End', image: exercise.images?.endPosition },
    ].filter((option) => option.image);

    if (imageOptions.length <= 1) return null;

    return (
      <View style={styles.imageSelector}>
        {imageOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.imageSelectorButton,
              selectedImageType === option.key && styles.selectedImageButton,
            ]}
            onPress={() => setSelectedImageType(option.key as any)}
          >
            <Text
              style={[
                styles.imageSelectorText,
                selectedImageType === option.key && styles.selectedImageText,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const getCurrentImage = () => {
    return getExerciseImage(exercise.id, selectedImageType);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#0F0F23', '#1A1A2E', '#0F0F23']}
          style={styles.background}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Exercise Guide</Text>
            <View style={styles.headerButtons}>
              {onReplace && (
                <TouchableOpacity
                  style={styles.replaceButton}
                  onPress={() => {
                    onReplace(exercise);
                    onClose();
                  }}
                >
                  <LinearGradient
                    colors={['#F59E0B', '#F97316']}
                    style={styles.replaceButtonGradient}
                  >
                    <Settings size={16} color="#FFFFFF" />
                    <Text style={styles.replaceButtonText}>Replace</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.startButton}
                onPress={() => {
                  onStartExercise(exercise);
                  onClose();
                }}
              >
                <LinearGradient
                  colors={['#6B46C1', '#8B5CF6']}
                  style={styles.startButtonGradient}
                >
                  <Play size={16} color="#FFFFFF" />
                  <Text style={styles.startButtonText}>Start</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Exercise Info */}
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <Text style={styles.muscleGroup}>{exercise.muscleGroup}</Text>

              <View style={styles.exerciseMeta}>
                <View style={styles.difficultyContainer}>
                  <View style={styles.starsContainer}>
                    {[...Array(3)].map((_, index) => (
                      <Star
                        key={index}
                        size={12}
                        color={difficultyColor}
                        fill={
                          index < difficultyStars
                            ? difficultyColor
                            : 'transparent'
                        }
                      />
                    ))}
                  </View>
                  <Text
                    style={[styles.difficultyText, { color: difficultyColor }]}
                  >
                    {exercise.difficulty?.charAt(0).toUpperCase() +
                      exercise.difficulty?.slice(1)}
                  </Text>
                </View>

                <View style={styles.equipmentContainer}>
                  <Text style={styles.equipmentText}>{exercise.equipment}</Text>
                </View>
              </View>
            </View>

            {/* Exercise Image */}
            <View style={styles.imageSection}>
              {renderImageSelector()}
              <View style={styles.imageContainer}>
                {!imageError && getCurrentImage() ? (
                  <Image
                    source={{ uri: getCurrentImage() }}
                    style={styles.exerciseImage}
                    onError={handleImageError}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Text style={styles.placeholderText}>
                      No image available
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Target Muscles */}
            {exercise.targetMuscles && exercise.targetMuscles.length > 0 && (
              <View style={styles.targetMusclesSection}>
                <View style={styles.sectionHeader}>
                  <Target size={20} color="#6B46C1" />
                  <Text style={styles.sectionTitle}>Target Muscles</Text>
                </View>
                <View style={styles.musclesList}>
                  {exercise.targetMuscles.map((muscle, index) => (
                    <View key={index} style={styles.muscleTag}>
                      <Text style={styles.muscleTagText}>{muscle}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Instructions */}
            {renderInstructionsList(
              'Setup',
              exercise.instructions?.setup,
              CheckCircle
            )}
            {renderInstructionsList(
              'Execution',
              exercise.instructions?.execution,
              Play
            )}
            {renderInstructionsList(
              'Pro Tips',
              exercise.instructions?.tips,
              Lightbulb
            )}
            {renderInstructionsList(
              'Common Mistakes',
              exercise.instructions?.commonMistakes,
              AlertTriangle
            )}

            {/* Video Link */}
            {exercise.videoUrl && (
              <View style={styles.videoSection}>
                <TouchableOpacity style={styles.videoButton}>
                  <LinearGradient
                    colors={['#1A1A2E', '#0F0F23']}
                    style={styles.videoButtonGradient}
                  >
                    <Play size={20} color="#6B46C1" />
                    <Text style={styles.videoButtonText}>Watch Video Demo</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    </Modal>
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
  closeButton: {
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
  startButton: {
    borderRadius: 20,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  exerciseHeader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  exerciseName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  muscleGroup: {
    fontSize: 16,
    color: '#6B46C1',
    fontWeight: '600',
    marginBottom: 16,
  },
  exerciseMeta: {
    flexDirection: 'row',
    gap: 20,
  },
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: '600',
  },
  equipmentContainer: {
    backgroundColor: '#1A1A2E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  equipmentText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  imageSection: {
    marginBottom: 30,
  },
  imageSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  imageSelectorButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#1A1A2E',
  },
  selectedImageButton: {
    backgroundColor: '#6B46C1',
  },
  imageSelectorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  selectedImageText: {
    color: '#FFFFFF',
  },
  imageContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1A1A2E',
  },
  exerciseImage: {
    width: '100%',
    height: 200,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#64748B',
  },
  targetMusclesSection: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  musclesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  muscleTag: {
    backgroundColor: '#6B46C1' + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  muscleTagText: {
    fontSize: 14,
    color: '#6B46C1',
    fontWeight: '500',
  },
  instructionsSection: {
    marginBottom: 30,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6B46C1',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  stepText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    color: '#E2E8F0',
    lineHeight: 24,
  },
  videoSection: {
    marginBottom: 30,
    paddingBottom: 20,
  },
  videoButton: {
    borderRadius: 16,
  },
  videoButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1A1A2E',
    gap: 8,
  },
  videoButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B46C1',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  replaceButton: {
    borderRadius: 20,
  },
  replaceButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  replaceButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
