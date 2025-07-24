import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LightningAvatar, { AvatarColor } from './LightningAvatar';
import { useAvatarSystem } from '@/hooks/useAvatarSystem';

interface AvatarCustomizationProps {
  onClose?: () => void;
}

const colorOptions: { color: AvatarColor; name: string; description: string }[] = [
  { color: 'purple', name: 'Lightning Purple', description: 'Classic BoltLab energy' },
  { color: 'orange', name: 'Achievement Gold', description: 'For the accomplished' },
  { color: 'blue', name: 'Storm Blue', description: 'Cool and powerful' },
  { color: 'gold', name: 'Thunder Gold', description: 'Ultimate prestige' },
];

export default function AvatarCustomization({ onClose }: AvatarCustomizationProps) {
  const { avatarState, changeColor } = useAvatarSystem();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1A1A2E', '#0F0F23']}
        style={styles.background}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Customize Your Lightning Avatar</Text>
          <Text style={styles.headerSubtitle}>
            Choose your electrical essence
          </Text>
        </View>

        {/* Current Avatar Preview */}
        <View style={styles.previewSection}>
          <LightningAvatar
            level={avatarState.level}
            xp={avatarState.xp}
            maxXp={avatarState.maxXp}
            color={avatarState.color}
            size="large"
            showStats={true}
          />
        </View>

        {/* Color Options */}
        <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Lightning Colors</Text>
          
          {colorOptions.map((option) => (
            <TouchableOpacity
              key={option.color}
              style={styles.colorOption}
              onPress={() => changeColor(option.color)}
            >
              <LinearGradient
                colors={['#1A1A2E', '#0F0F23']}
                style={[
                  styles.colorOptionGradient,
                  avatarState.color === option.color && styles.selectedOption
                ]}
              >
                <View style={styles.colorOptionLeft}>
                  <LightningAvatar
                    level={avatarState.level}
                    xp={avatarState.xp}
                    maxXp={avatarState.maxXp}
                    color={option.color}
                    size="small"
                    showStats={false}
                  />
                  <View style={styles.colorOptionInfo}>
                    <Text style={styles.colorOptionName}>{option.name}</Text>
                    <Text style={styles.colorOptionDescription}>{option.description}</Text>
                  </View>
                </View>
                
                {avatarState.color === option.color && (
                  <View style={styles.selectedIndicator}>
                    <Text style={styles.selectedText}>✓</Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          ))}

          {/* Evolution Preview */}
          <View style={styles.evolutionSection}>
            <Text style={styles.sectionTitle}>Evolution Stages</Text>
            <Text style={styles.evolutionDescription}>
              Your avatar evolves as you progress through your fitness journey
            </Text>
            
            <View style={styles.evolutionGrid}>
              {(['spark', 'bolt', 'storm', 'thunder-god'] as const).map((level, index) => (
                <View key={level} style={styles.evolutionItem}>
                  <LightningAvatar
                    level={level}
                    xp={50}
                    maxXp={100}
                    color={avatarState.color}
                    size="small"
                    showStats={false}
                  />
                  <Text style={[
                    styles.evolutionLabel,
                    avatarState.level === level && styles.currentEvolution
                  ]}>
                    {level.charAt(0).toUpperCase() + level.slice(1).replace('-', ' ')}
                  </Text>
                  {avatarState.level === level && (
                    <Text style={styles.currentLabel}>Current</Text>
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Avatar Stats</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{avatarState.totalWorkouts}</Text>
                <Text style={styles.statLabel}>Workouts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{avatarState.achievements}</Text>
                <Text style={styles.statLabel}>Achievements</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{avatarState.xp}</Text>
                <Text style={styles.statLabel}>Current XP</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Close Button */}
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <LinearGradient
              colors={['#6B46C1', '#8B5CF6']}
              style={styles.closeButtonGradient}
            >
              <Text style={styles.closeButtonText}>Done</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </LinearGradient>
    </View>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
  },
  previewSection: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  optionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  colorOption: {
    marginBottom: 12,
  },
  colorOptionGradient: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1A1A2E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedOption: {
    borderColor: '#6B46C1',
    borderWidth: 2,
  },
  colorOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorOptionInfo: {
    marginLeft: 16,
    flex: 1,
  },
  colorOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  colorOptionDescription: {
    fontSize: 14,
    color: '#94A3B8',
  },
  selectedIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#6B46C1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  evolutionSection: {
    marginTop: 30,
    marginBottom: 30,
  },
  evolutionDescription: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 20,
    lineHeight: 20,
  },
  evolutionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  evolutionItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1A1A2E',
  },
  evolutionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 8,
    textAlign: 'center',
  },
  currentEvolution: {
    color: '#6B46C1',
  },
  currentLabel: {
    fontSize: 12,
    color: '#6B46C1',
    fontWeight: '600',
    marginTop: 4,
  },
  statsSection: {
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1A1A2E',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6B46C1',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#94A3B8',
  },
  closeButton: {
    margin: 20,
  },
  closeButtonGradient: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});