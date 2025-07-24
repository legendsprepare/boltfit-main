import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Zap } from 'lucide-react-native';

interface AnimatedLightningBoltProps {
  level: number;
  size?: 'small' | 'medium' | 'large';
}

export default function AnimatedLightningBolt({
  level,
  size = 'medium',
}: AnimatedLightningBoltProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  // Get level-based styling
  const getLevelStyle = () => {
    if (level >= 50) {
      return {
        color: '#FFD700', // Gold
        glowColor: '#FFD700',
        size: size === 'large' ? 48 : size === 'small' ? 16 : 24,
        glowIntensity: 0.8,
      };
    } else if (level >= 30) {
      return {
        color: '#FF6B35', // Orange
        glowColor: '#FF6B35',
        size: size === 'large' ? 44 : size === 'small' ? 14 : 20,
        glowIntensity: 0.6,
      };
    } else if (level >= 20) {
      return {
        color: '#6B46C1', // Purple
        glowColor: '#8B5CF6',
        size: size === 'large' ? 42 : size === 'small' ? 13 : 18,
        glowIntensity: 0.5,
      };
    } else if (level >= 10) {
      return {
        color: '#3B82F6', // Blue
        glowColor: '#60A5FA',
        size: size === 'large' ? 40 : size === 'small' ? 12 : 16,
        glowIntensity: 0.4,
      };
    } else {
      return {
        color: '#94A3B8', // Gray
        glowColor: '#CBD5E1',
        size: size === 'large' ? 38 : size === 'small' ? 11 : 15,
        glowIntensity: 0.2,
      };
    }
  };

  const levelStyle = getLevelStyle();

  useEffect(() => {
    // Pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    // Glow animation
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        }),
      ])
    );

    // Sparkle animation for higher levels
    const sparkleAnimation =
      level >= 20
        ? Animated.loop(
            Animated.sequence([
              Animated.timing(sparkleAnim, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: true,
              }),
              Animated.timing(sparkleAnim, {
                toValue: 0,
                duration: 2000,
                useNativeDriver: true,
              }),
            ])
          )
        : null;

    pulseAnimation.start();
    glowAnimation.start();
    if (sparkleAnimation) {
      sparkleAnimation.start();
    }

    return () => {
      pulseAnimation.stop();
      glowAnimation.stop();
      if (sparkleAnimation) {
        sparkleAnimation.stop();
      }
    };
  }, [level]);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, levelStyle.glowIntensity],
  });

  const sparkleOpacity = sparkleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.8],
  });

  return (
    <View style={styles.container}>
      {/* Glow effect */}
      <Animated.View
        style={[
          styles.glow,
          {
            opacity: glowOpacity,
            backgroundColor: levelStyle.glowColor,
            width: levelStyle.size * 2,
            height: levelStyle.size * 2,
            borderRadius: levelStyle.size,
          },
        ]}
      />

      {/* Main lightning bolt */}
      <Animated.View
        style={[
          styles.boltContainer,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <Zap size={levelStyle.size} color={levelStyle.color} />
      </Animated.View>

      {/* Sparkle effect for higher levels */}
      {level >= 20 && (
        <Animated.View
          style={[
            styles.sparkle,
            {
              opacity: sparkleOpacity,
            },
          ]}
        >
          <Text style={[styles.sparkleText, { color: levelStyle.color }]}>
            ✨
          </Text>
        </Animated.View>
      )}

      {/* Level indicator for higher levels */}
      {level >= 30 && (
        <View style={styles.levelBadge}>
          <Text style={[styles.levelText, { color: levelStyle.color }]}>
            {level}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    borderRadius: 20,
  },
  boltContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkle: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  sparkleText: {
    fontSize: 12,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#1A1A2E',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#374151',
  },
  levelText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
