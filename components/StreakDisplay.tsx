import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame, Shield } from 'lucide-react-native';

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  streakShields: number;
  maxShields: number;
  onUseShield?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export default function StreakDisplay({
  currentStreak,
  longestStreak,
  streakShields,
  maxShields,
  onUseShield,
  size = 'medium',
}: StreakDisplayProps) {
  const [flameAnim] = useState(new Animated.Value(1));
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Flame animation intensity based on streak
    const intensity = Math.min(currentStreak / 30, 1); // Max intensity at 30-day streak

    const flameAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(flameAnim, {
          toValue: 1 + intensity * 0.3,
          duration: 1000 + intensity * 500,
          useNativeDriver: true,
        }),
        Animated.timing(flameAnim, {
          toValue: 1,
          duration: 1000 + intensity * 500,
          useNativeDriver: true,
        }),
      ])
    );

    flameAnimation.start();

    return () => flameAnimation.stop();
  }, [currentStreak]);

  useEffect(() => {
    // Pulse animation for high streaks
    if (currentStreak >= 7) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );

      pulseAnimation.start();

      return () => pulseAnimation.stop();
    }
  }, [currentStreak]);

  const getFlameColor = () => {
    if (currentStreak >= 30) return '#F59E0B'; // Gold
    if (currentStreak >= 14) return '#EF4444'; // Red
    if (currentStreak >= 7) return '#F97316'; // Orange
    return '#F59E0B'; // Default orange
  };

  const getFlameSize = () => {
    const baseSize = size === 'small' ? 20 : size === 'large' ? 32 : 24;
    const bonus = Math.min(currentStreak / 10, 1) * 8; // Up to 8px bonus
    return baseSize + bonus;
  };

  const getContainerSize = () => {
    switch (size) {
      case 'small':
        return { width: 80, height: 60 };
      case 'large':
        return { width: 120, height: 90 };
      default:
        return { width: 100, height: 75 };
    }
  };

  const getStreakDescription = () => {
    if (currentStreak === 0) {
      return 'Start your first workout to begin your streak!';
    } else if (currentStreak < 7) {
      return "Keep going! One rest day won't break your streak.";
    } else if (currentStreak < 30) {
      return 'Amazing streak! Remember, one rest day is okay.';
    } else {
      return "Legendary dedication! You've mastered consistency.";
    }
  };

  return (
    <View style={[styles.container, getContainerSize()]}>
      <LinearGradient colors={['#1A1A2E', '#0F0F23']} style={styles.gradient}>
        {/* Main Streak Display */}
        <Animated.View
          style={[
            styles.streakContainer,
            {
              transform: [{ scale: pulseAnim }, { scale: flameAnim }],
            },
          ]}
        >
          <Flame size={getFlameSize()} color={getFlameColor()} />
          <Text
            style={[
              styles.streakNumber,
              { fontSize: size === 'small' ? 16 : size === 'large' ? 24 : 20 },
            ]}
          >
            {currentStreak}
          </Text>
        </Animated.View>

        {/* Streak Label */}
        <Text
          style={[styles.streakLabel, { fontSize: size === 'small' ? 10 : 12 }]}
        >
          Day Streak
        </Text>

        {/* Streak Description for larger sizes */}
        {size === 'large' && (
          <Text style={styles.streakDescription}>{getStreakDescription()}</Text>
        )}

        {/* Longest Streak */}
        {size !== 'small' && longestStreak > currentStreak && (
          <Text style={styles.longestStreak}>Best: {longestStreak}</Text>
        )}

        {/* Streak Shields */}
        {size !== 'small' && (
          <View style={styles.shieldsContainer}>
            {Array.from({ length: maxShields }).map((_, index) => (
              <View key={index} style={styles.shieldSlot}>
                <Shield
                  size={12}
                  color={index < streakShields ? '#3B82F6' : '#64748B'}
                  fill={index < streakShields ? '#3B82F6' : 'transparent'}
                />
              </View>
            ))}
          </View>
        )}

        {/* Use Shield Button */}
        {onUseShield && streakShields > 0 && size === 'large' && (
          <TouchableOpacity
            style={styles.useShieldButton}
            onPress={onUseShield}
          >
            <Text style={styles.useShieldText}>Use Shield</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>

      {/* Streak Effects */}
      {currentStreak >= 7 && (
        <View style={styles.effectsContainer}>
          {Array.from({ length: Math.min(currentStreak / 7, 5) }).map(
            (_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.sparkle,
                  {
                    opacity: flameAnim.interpolate({
                      inputRange: [1, 1.3],
                      outputRange: [0.3, 0.8],
                    }),
                    left: `${20 + index * 15}%`,
                    top: `${10 + (index % 2) * 20}%`,
                  },
                ]}
              >
                <Text style={styles.sparkleText}>✨</Text>
              </Animated.View>
            )
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  gradient: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1A1A2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakContainer: {
    alignItems: 'center',
    marginBottom: 4,
  },
  streakNumber: {
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
  },
  streakLabel: {
    color: '#94A3B8',
    fontWeight: '500',
    marginBottom: 4,
  },
  streakDescription: {
    color: '#94A3B8',
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 8,
  },
  longestStreak: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 8,
  },
  shieldsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 4,
  },
  shieldSlot: {
    marginHorizontal: 2,
  },
  useShieldButton: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  useShieldText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  effectsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  sparkle: {
    position: 'absolute',
  },
  sparkleText: {
    fontSize: 12,
  },
});
