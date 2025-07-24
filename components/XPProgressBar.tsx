import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap } from 'lucide-react-native';

interface XPProgressBarProps {
  currentXP: number;
  maxXP: number;
  level: number;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
}

export default function XPProgressBar({
  currentXP,
  maxXP,
  level,
  showLabel = true,
  size = 'medium',
  animated = true,
}: XPProgressBarProps) {
  const [progressAnim] = useState(new Animated.Value(0));
  const [glowAnim] = useState(new Animated.Value(0));

  const percentage = (currentXP / maxXP) * 100;

  useEffect(() => {
    if (animated) {
      // Animate progress bar
      Animated.timing(progressAnim, {
        toValue: percentage,
        duration: 1000,
        useNativeDriver: false,
      }).start();

      // Animate glow effect
      const glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: false,
          }),
        ])
      );
      glowAnimation.start();

      return () => glowAnimation.stop();
    } else {
      progressAnim.setValue(percentage);
    }
  }, [currentXP, maxXP, animated]);

  const getBarHeight = () => {
    switch (size) {
      case 'small': return 6;
      case 'medium': return 8;
      case 'large': return 12;
      default: return 8;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small': return 12;
      case 'medium': return 14;
      case 'large': return 16;
      default: return 14;
    }
  };

  return (
    <View style={styles.container}>
      {showLabel && (
        <View style={styles.labelContainer}>
          <View style={styles.levelContainer}>
            <Zap size={16} color="#6B46C1" />
            <Text style={[styles.levelText, { fontSize: getFontSize() }]}>
              Level {level}
            </Text>
          </View>
          <Text style={[styles.xpText, { fontSize: getFontSize() - 2 }]}>
            {currentXP}/{maxXP} XP
          </Text>
        </View>
      )}

      <View style={[styles.progressContainer, { height: getBarHeight() }]}>
        {/* Background */}
        <View style={styles.progressBackground} />
        
        {/* Glow effect */}
        <Animated.View
          style={[
            styles.progressGlow,
            {
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.8],
              }),
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
                extrapolate: 'clamp',
              }),
            },
          ]}
        />

        {/* Progress fill */}
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
                extrapolate: 'clamp',
              }),
            },
          ]}
        >
          <LinearGradient
            colors={['#6B46C1', '#8B5CF6', '#A855F7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          />
        </Animated.View>

        {/* Lightning sparks */}
        {percentage > 80 && (
          <Animated.View
            style={[
              styles.spark,
              {
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1],
                }),
                right: '5%',
              },
            ]}
          >
            <Zap size={12} color="#F59E0B" />
          </Animated.View>
        )}
      </View>

      {showLabel && size !== 'small' && (
        <Text style={styles.nextLevelText}>
          {maxXP - currentXP} XP to Level {level + 1}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelText: {
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  xpText: {
    fontWeight: '500',
    color: '#94A3B8',
  },
  progressContainer: {
    position: 'relative',
    backgroundColor: '#1A1A2E',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1A1A2E',
  },
  progressGlow: {
    position: 'absolute',
    top: -2,
    left: 0,
    bottom: -2,
    backgroundColor: '#6B46C1',
    borderRadius: 8,
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: 6,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },
  spark: {
    position: 'absolute',
    top: -6,
  },
  nextLevelText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
});