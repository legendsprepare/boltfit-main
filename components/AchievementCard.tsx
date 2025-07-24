import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Lock } from 'lucide-react-native';

interface AchievementCardProps {
  achievement: {
    id: string;
    title: string;
    description: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    xpReward: number;
    unlocked: boolean;
    unlockedDate?: Date;
    progress?: number;
    maxProgress?: number;
  };
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
}

export default function AchievementCard({
  achievement,
  onPress,
  size = 'medium',
  showProgress = true,
}: AchievementCardProps) {
  const [glowAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (achievement.unlocked) {
      // Glow animation for unlocked achievements
      const glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 2000,
            useNativeDriver: false,
          }),
        ])
      );
      glowAnimation.start();

      return () => glowAnimation.stop();
    }
  }, [achievement.unlocked]);

  const getRarityColors = () => {
    switch (achievement.rarity) {
      case 'common':
        return {
          primary: '#94A3B8',
          secondary: '#64748B',
          glow: '#94A3B8',
        };
      case 'rare':
        return {
          primary: '#3B82F6',
          secondary: '#1D4ED8',
          glow: '#3B82F6',
        };
      case 'epic':
        return {
          primary: '#8B5CF6',
          secondary: '#7C3AED',
          glow: '#8B5CF6',
        };
      case 'legendary':
        return {
          primary: '#F59E0B',
          secondary: '#D97706',
          glow: '#F59E0B',
        };
      default:
        return {
          primary: '#94A3B8',
          secondary: '#64748B',
          glow: '#94A3B8',
        };
    }
  };

  const colors = getRarityColors();
  const progressPercentage = achievement.maxProgress 
    ? ((achievement.progress || 0) / achievement.maxProgress) * 100 
    : 0;

  const getCardSize = () => {
    switch (size) {
      case 'small':
        return { width: 120, height: 100 };
      case 'large':
        return { width: 200, height: 160 };
      default:
        return { width: 160, height: 130 };
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small': return 20;
      case 'large': return 32;
      default: return 24;
    }
  };

  const getFontSizes = () => {
    switch (size) {
      case 'small':
        return { title: 12, description: 10, xp: 10 };
      case 'large':
        return { title: 16, description: 14, xp: 12 };
      default:
        return { title: 14, description: 12, xp: 11 };
    }
  };

  const fontSizes = getFontSizes();

  return (
    <TouchableOpacity
      style={[styles.container, getCardSize()]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.cardWrapper,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Glow effect for unlocked achievements */}
        {achievement.unlocked && (
          <Animated.View
            style={[
              styles.glowEffect,
              {
                shadowColor: colors.glow,
                shadowOpacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 0.8],
                }),
                shadowRadius: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [4, 12],
                }),
              },
            ]}
          />
        )}

        <LinearGradient
          colors={
            achievement.unlocked
              ? [colors.primary + '30', colors.secondary + '20']
              : ['#1A1A2E', '#0F0F23']
          }
          style={[
            styles.gradient,
            {
              borderColor: achievement.unlocked ? colors.primary : '#1A1A2E',
              opacity: achievement.unlocked ? 1 : 0.6,
            },
          ]}
        >
          {/* Rarity Border */}
          <View
            style={[
              styles.rarityBorder,
              {
                borderTopColor: colors.primary,
                borderTopWidth: 3,
              },
            ]}
          />

          {/* Achievement Icon */}
          <View style={styles.iconContainer}>
            {achievement.unlocked ? (
              <Text style={[styles.iconEmoji, { fontSize: getIconSize() }]}>
                {achievement.icon}
              </Text>
            ) : (
              <Lock size={getIconSize()} color="#64748B" />
            )}
          </View>

          {/* Achievement Info */}
          <View style={styles.infoContainer}>
            <Text
              style={[
                styles.title,
                {
                  fontSize: fontSizes.title,
                  color: achievement.unlocked ? '#FFFFFF' : '#64748B',
                },
              ]}
              numberOfLines={1}
            >
              {achievement.title}
            </Text>
            
            {size !== 'small' && (
              <Text
                style={[
                  styles.description,
                  {
                    fontSize: fontSizes.description,
                    color: achievement.unlocked ? '#94A3B8' : '#475569',
                  },
                ]}
                numberOfLines={2}
              >
                {achievement.description}
              </Text>
            )}

            {/* XP Reward */}
            <View style={styles.xpContainer}>
              <Trophy size={12} color={colors.primary} />
              <Text
                style={[
                  styles.xpText,
                  {
                    fontSize: fontSizes.xp,
                    color: colors.primary,
                  },
                ]}
              >
                +{achievement.xpReward} XP
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          {showProgress && achievement.maxProgress && !achievement.unlocked && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progressPercentage}%`,
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {achievement.progress || 0}/{achievement.maxProgress}
              </Text>
            </View>
          )}

          {/* Unlocked Date */}
          {achievement.unlocked && achievement.unlockedDate && size === 'large' && (
            <Text style={styles.unlockedDate}>
              Unlocked {achievement.unlockedDate.toLocaleDateString()}
            </Text>
          )}
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 8,
  },
  cardWrapper: {
    flex: 1,
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 18,
    backgroundColor: 'transparent',
  },
  gradient: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    position: 'relative',
  },
  rarityBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  iconEmoji: {
    lineHeight: 32,
  },
  infoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  description: {
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 8,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
  },
  xpText: {
    fontWeight: '600',
    marginLeft: 4,
  },
  progressContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#1A1A2E',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
  unlockedDate: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
});