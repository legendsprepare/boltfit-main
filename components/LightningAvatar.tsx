import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, RadialGradient, Stop } from 'react-native-svg';

export type AvatarLevel = 'spark' | 'bolt' | 'storm' | 'thunder-god';
export type AvatarColor = 'purple' | 'orange' | 'blue' | 'gold';

interface LightningAvatarProps {
  level: AvatarLevel;
  xp: number;
  maxXp: number;
  color?: AvatarColor;
  size?: 'small' | 'medium' | 'large';
  showStats?: boolean;
  isActive?: boolean;
  onLevelUp?: () => void;
}

const colorSchemes = {
  purple: {
    primary: '#6B46C1',
    secondary: '#8B5CF6',
    glow: '#A855F7',
    accent: '#C084FC',
  },
  orange: {
    primary: '#F59E0B',
    secondary: '#FBBF24',
    glow: '#FCD34D',
    accent: '#FDE68A',
  },
  blue: {
    primary: '#3B82F6',
    secondary: '#60A5FA',
    glow: '#93C5FD',
    accent: '#DBEAFE',
  },
  gold: {
    primary: '#D97706',
    secondary: '#F59E0B',
    glow: '#FBBF24',
    accent: '#FEF3C7',
  },
};

const levelConfig = {
  'spark': {
    name: 'Spark',
    size: 0.8,
    complexity: 1,
    glowIntensity: 0.6,
  },
  'bolt': {
    name: 'Bolt',
    size: 1.0,
    complexity: 2,
    glowIntensity: 0.8,
  },
  'storm': {
    name: 'Storm',
    size: 1.2,
    complexity: 3,
    glowIntensity: 1.0,
  },
  'thunder-god': {
    name: 'Thunder God',
    size: 1.4,
    complexity: 4,
    glowIntensity: 1.2,
  },
};

const sizeConfig = {
  small: { container: 60, avatar: 40 },
  medium: { container: 80, avatar: 60 },
  large: { container: 120, avatar: 90 },
};

export default function LightningAvatar({
  level,
  xp,
  maxXp,
  color = 'purple',
  size = 'medium',
  showStats = true,
  isActive = false,
  onLevelUp,
}: LightningAvatarProps) {
  const [pulseAnim] = useState(new Animated.Value(1));
  const [glowAnim] = useState(new Animated.Value(0));
  const [crackleAnim] = useState(new Animated.Value(0));
  const [levelUpAnim] = useState(new Animated.Value(0));

  const colors = colorSchemes[color];
  const levelData = levelConfig[level];
  const sizes = sizeConfig[size];

  useEffect(() => {
    // Pulsing animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
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
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    );

    // Crackling animation
    const crackleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(crackleAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.timing(crackleAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.delay(Math.random() * 2000 + 1000),
      ])
    );

    pulseAnimation.start();
    glowAnimation.start();
    crackleAnimation.start();

    return () => {
      pulseAnim.stopAnimation();
      glowAnim.stopAnimation();
      crackleAnim.stopAnimation();
    };
  }, []);

  useEffect(() => {
    if (isActive) {
      const activeAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
      activeAnimation.start();
    }
  }, [isActive]);

  const triggerLevelUp = () => {
    Animated.sequence([
      Animated.timing(levelUpAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.back(2)),
        useNativeDriver: true,
      }),
      Animated.timing(levelUpAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      onLevelUp?.();
    });
  };

  const renderLightningBolt = () => {
    const scale = levelData.size;
    const avatarSize = sizes.avatar * scale;
    
    return (
      <Svg width={avatarSize} height={avatarSize} viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id="lightningGradient" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={colors.accent} stopOpacity="1" />
            <Stop offset="50%" stopColor={colors.primary} stopOpacity="1" />
            <Stop offset="100%" stopColor={colors.secondary} stopOpacity="0.8" />
          </RadialGradient>
        </Defs>
        
        {/* Main lightning bolt */}
        <Path
          d="M50 10 L30 40 L45 40 L35 90 L70 35 L55 35 L65 10 Z"
          fill="url(#lightningGradient)"
          stroke={colors.glow}
          strokeWidth="2"
        />
        
        {/* Additional complexity based on level */}
        {levelData.complexity >= 2 && (
          <Path
            d="M25 25 L20 35 L30 35 L15 55 L40 30 L35 30 L45 15 Z"
            fill={colors.secondary}
            opacity="0.7"
          />
        )}
        
        {levelData.complexity >= 3 && (
          <Path
            d="M75 20 L70 30 L80 30 L65 50 L90 25 L85 25 L95 10 Z"
            fill={colors.accent}
            opacity="0.6"
          />
        )}
        
        {levelData.complexity >= 4 && (
          <>
            <Path
              d="M15 60 L10 70 L20 70 L5 90 L30 65 L25 65 L35 50 Z"
              fill={colors.glow}
              opacity="0.5"
            />
            <Path
              d="M85 55 L80 65 L90 65 L75 85 L100 60 L95 60 L105 45 Z"
              fill={colors.glow}
              opacity="0.5"
            />
          </>
        )}
      </Svg>
    );
  };

  const progressPercentage = (xp / maxXp) * 100;

  return (
    <View style={styles.container}>
      {/* Avatar Container */}
      <View style={[styles.avatarContainer, { width: sizes.container, height: sizes.container }]}>
        {/* Outer Glow */}
        <Animated.View
          style={[
            styles.outerGlow,
            {
              width: sizes.container + 20,
              height: sizes.container + 20,
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.8],
              }),
              transform: [
                {
                  scale: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.1],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={[colors.glow + '40', colors.primary + '20', 'transparent']}
            style={styles.glowGradient}
          />
        </Animated.View>

        {/* Main Avatar */}
        <Animated.View
          style={[
            styles.avatar,
            {
              transform: [
                { scale: pulseAnim },
                {
                  scale: levelUpAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.5],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={[colors.primary + '30', colors.secondary + '20']}
            style={styles.avatarBackground}
          >
            {renderLightningBolt()}
          </LinearGradient>
        </Animated.View>

        {/* Crackling Effects */}
        <Animated.View
          style={[
            styles.crackleEffect,
            {
              opacity: crackleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.6],
              }),
            },
          ]}
        >
          {Array.from({ length: levelData.complexity * 2 }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.crackle,
                {
                  backgroundColor: colors.accent,
                  left: `${Math.random() * 80 + 10}%`,
                  top: `${Math.random() * 80 + 10}%`,
                  animationDelay: `${Math.random() * 2}s`,
                },
              ]}
            />
          ))}
        </Animated.View>
      </View>

      {/* Stats */}
      {showStats && (
        <View style={styles.statsContainer}>
          <Text style={[styles.levelText, { color: colors.primary }]}>
            {levelData.name}
          </Text>
          
          {/* XP Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: colors.primary + '20' }]}>
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                style={[styles.progressFill, { width: `${progressPercentage}%` }]}
              />
            </View>
            <Text style={styles.xpText}>
              {xp}/{maxXp} XP
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerGlow: {
    position: 'absolute',
    borderRadius: 1000,
  },
  glowGradient: {
    flex: 1,
    borderRadius: 1000,
  },
  avatar: {
    borderRadius: 1000,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBackground: {
    width: '100%',
    height: '100%',
    borderRadius: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6B46C1',
  },
  crackleEffect: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 1000,
  },
  crackle: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  statsContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  levelText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: 80,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  xpText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
});