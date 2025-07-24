import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, Plus, Minus } from 'lucide-react-native';
import { WorkoutSet } from '@/types/workout';

interface SetTrackerProps {
  setNumber: number;
  onCompleteSet: (weight: number, reps: number) => void;
  previousSet?: WorkoutSet;
  exerciseType: 'strength' | 'cardio' | 'flexibility' | 'hiit';
  exerciseData?: any; // The current exercise data with equipment info
  generatedSets?: number;
  generatedReps?: number;
  generatedWeight?: number;
}

export default function SetTracker({
  setNumber,
  onCompleteSet,
  previousSet,
  exerciseType,
  exerciseData,
  generatedSets,
  generatedReps,
  generatedWeight,
}: SetTrackerProps) {
  // Auto-fill with generated values or previous set values
  const [weight, setWeight] = useState(() => {
    if (previousSet?.weight) return previousSet.weight.toString();
    if (generatedWeight && generatedWeight > 0)
      return generatedWeight.toString();
    return '';
  });

  const [reps, setReps] = useState(() => {
    if (previousSet?.reps) return previousSet.reps.toString();
    if (generatedReps) return generatedReps.toString();
    return '';
  });

  const [duration, setDuration] = useState('');

  // Check if this exercise requires weight (not bodyweight)
  const requiresWeight = () => {
    if (!exerciseData) return exerciseType === 'strength';

    // Check if equipment suggests bodyweight exercise
    const equipment = exerciseData.equipment?.toLowerCase() || '';
    const bodyweightEquipment = ['none', 'bodyweight', 'mat', ''];

    // If user has gym access, they can do weighted exercises
    const hasGymAccess =
      exerciseData.equipment?.toLowerCase().includes('gym') ||
      exerciseData.equipment?.toLowerCase() === 'barbell' ||
      exerciseData.equipment?.toLowerCase() === 'dumbbells' ||
      exerciseData.equipment?.toLowerCase() === 'kettlebells';

    // Only require weight if it's a strength exercise and not bodyweight
    return (
      exerciseType === 'strength' &&
      !bodyweightEquipment.includes(equipment) &&
      hasGymAccess
    );
  };

  const handleWeightChange = (value: string) => {
    // Only allow numbers and decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    setWeight(numericValue);
  };

  const handleRepsChange = (value: string) => {
    // Only allow whole numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    setReps(numericValue);
  };

  const adjustWeight = (increment: number) => {
    const currentWeight = parseFloat(weight) || 0;
    const newWeight = Math.max(0, currentWeight + increment);
    setWeight(newWeight.toString());
  };

  const adjustReps = (increment: number) => {
    const currentReps = parseInt(reps) || 0;
    const newReps = Math.max(0, currentReps + increment);
    setReps(newReps.toString());
  };

  const handleCompleteSet = () => {
    const weightValue = requiresWeight() ? parseFloat(weight) || 0 : 0;
    const repsValue = parseInt(reps) || 0;

    if (repsValue <= 0) {
      return; // Don't complete if reps are invalid
    }

    if (requiresWeight() && weightValue <= 0) {
      return; // Don't complete if weight is required but invalid
    }

    onCompleteSet(weightValue, repsValue);
  };

  const isValid = () => {
    const repsValid = parseInt(reps) > 0;
    if (!requiresWeight()) {
      return repsValid;
    }
    return repsValid && parseFloat(weight) > 0;
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1A1A2E', '#0F0F23']} style={styles.gradient}>
        <View style={styles.header}>
          <Text style={styles.setTitle}>Set {setNumber}</Text>
          {previousSet && (
            <Text style={styles.previousSet}>
              Previous: {requiresWeight() ? `${previousSet.weight}kg × ` : ''}
              {previousSet.reps} reps
            </Text>
          )}
          {generatedReps && setNumber === 1 && (
            <Text style={styles.recommendedSet}>
              Recommended:{' '}
              {requiresWeight() && generatedWeight
                ? `${generatedWeight}kg × `
                : ''}
              {generatedReps} reps
            </Text>
          )}
        </View>

        <View style={styles.inputContainer}>
          {requiresWeight() && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Weight (kg)</Text>
              <View style={styles.inputRow}>
                <TouchableOpacity
                  style={styles.adjustButton}
                  onPress={() => adjustWeight(-2.5)}
                >
                  <Minus size={16} color="#6B46C1" />
                </TouchableOpacity>
                <TextInput
                  style={styles.input}
                  value={weight}
                  onChangeText={handleWeightChange}
                  placeholder="0"
                  placeholderTextColor="#64748B"
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={styles.adjustButton}
                  onPress={() => adjustWeight(2.5)}
                >
                  <Plus size={16} color="#6B46C1" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {exerciseType === 'strength' ? 'Reps' : 'Duration (min)'}
            </Text>
            <View style={styles.inputRow}>
              <TouchableOpacity
                style={styles.adjustButton}
                onPress={() => adjustReps(-1)}
              >
                <Minus size={16} color="#6B46C1" />
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                value={reps}
                onChangeText={handleRepsChange}
                placeholder="0"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={styles.adjustButton}
                onPress={() => adjustReps(1)}
              >
                <Plus size={16} color="#6B46C1" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.completeButton, !isValid() && styles.disabledButton]}
          onPress={handleCompleteSet}
          disabled={!isValid()}
        >
          <LinearGradient
            colors={isValid() ? ['#6B46C1', '#8B5CF6'] : ['#64748B', '#475569']}
            style={styles.completeButtonGradient}
          >
            <Check size={20} color="#FFFFFF" />
            <Text style={styles.completeButtonText}>Complete Set</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  gradient: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1A1A2E',
  },
  header: {
    marginBottom: 20,
  },
  setTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  previousSet: {
    fontSize: 14,
    color: '#94A3B8',
  },
  recommendedSet: {
    fontSize: 14,
    color: '#6B46C1',
    marginTop: 4,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adjustButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6B46C1' + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: '#0F0F23',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1A1A2E',
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginHorizontal: 12,
  },
  completeButton: {
    borderRadius: 12,
  },
  disabledButton: {
    opacity: 0.5,
  },
  completeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});
