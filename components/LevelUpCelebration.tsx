import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, Trophy, Star } from 'lucide-react-native';
import LightningAvatar from './LightningAvatar';

interface LevelUpCelebrationProps {
  visible: boolean;
  newLevel: number;
  onComplete: () => void;
}

const { width, height } = Dimensions.get('window');

export default function LevelUpCelebration({
  visible,
  newLevel,
  onComplete,
}: LevelUpCelebrationProps) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.5));
  const [lightningAnim] = useState(new Animated.Value(0));
  const [sparkleAnims] = useState(
    Array.from({ length: 8 }, () => new Animated.Value(0))
  );

  useEffect(() => {
    if (visible) {
      // Start celebration animation sequence
      Animated.sequence([
        // Fade in background
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        // Scale in main content
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        // Lightning strikes
        Animated.timing(lightningAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();

      // Sparkle animations
      sparkleAnims.forEach((anim, index) => {
        Animated.loop(
          Animated.sequence([
            Animated.delay(index * 200),
            Animated.timing(anim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      });

      // Auto-complete after 3 seconds
      const timer = setTimeout(() => {
        handleComplete();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleComplete = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.5,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete();
      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.5);
      lightningAnim.setValue(0);
      sparkleAnims.forEach(anim => anim.setValue(0));
    });
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      <LinearGradient
        colors={['#0F0F23', '#1A1A2E', '#0F0F23']}
        style={styles.background}
      >
        {/* Lightning Effects */}
        <Animated.View
          style={[
            styles.lightningContainer,
            {
              opacity: lightningAnim,
              transform: [
                {
                  scale: lightningAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1.2],
                  }),
                },
              ],
            },
          ]}
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.lightningBolt,
                {
                  left: `${10 + index * 15}%`,
                  top: `${20 + (index % 2) * 40}%`,
                  opacity: lightningAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 1, 0.3],
                  }),
                },
              ]}
            >
              <Zap size={24 + index * 4} color="#6B46C1" />
            </Animated.View>
          ))}
        </Animated.View>

        {/* Main Content */}
        <Animated.View
          style={[
            styles.content,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <LightningAvatar
              level="bolt"
              xp={0}
              maxXP={100}
              color="purple"
              size="large"
              showStats={false}
              isActive={true}
            />
          </View>

          {/* Level Up Text */}
          <Text style={styles.levelUpText}>LEVEL UP!</Text>
          <Text style={styles.newLevelText}>Level {newLevel}</Text>
          <Text style={styles.congratsText}>
            Your lightning grows stronger! ⚡
          </Text>

          {/* Rewards */}
          <View style={styles.rewardsContainer}>
            <View style={styles.rewardItem}>
              <Trophy size={20} color="#F59E0B" />
              <Text style={styles.rewardText}>New Abilities Unlocked</Text>
            </View>
            <View style={styles.rewardItem}>
              <Star size={20} color="#6B46C1" />
              <Text style={styles.rewardText}>Avatar Enhanced</Text>
            </View>
          </View>
        </Animated.View>

        {/* Sparkles */}
        {sparkleAnims.map((anim, index) => (
          <Animated.View
            key={index}
            style={[
              styles.sparkle,
              {
                left: `${Math.random() * 80 + 10}%`,
                top: `${Math.random() * 80 + 10}%`,
                opacity: anim,
                transform: [
                  {
                    scale: anim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, 1.5, 0],
                    }),
                  },
                  {
                    rotate: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.sparkleText}>✨</Text>
          </Animated.View>
        ))}
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightningContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  lightningBolt: {
    position: 'absolute',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  avatarContainer: {
    marginBottom: 30,
  },
  levelUpText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#6B46C1',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: '#6B46C1',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  newLevelText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  congratsText: {
    fontSize: 18,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  rewardsContainer: {
    alignItems: 'center',
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#1A1A2E',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#6B46C1',
  },
  rewardText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  sparkle: {
    position: 'absolute',
  },
  sparkleText: {
    fontSize: 20,
  },
});