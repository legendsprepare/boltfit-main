import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Zap,
  Heart,
  Mail,
  Globe,
  Shield,
  FileText,
  ExternalLink,
  Target,
  Users,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function AboutScreen() {
  const router = useRouter();

  const openURL = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  const renderInfoItem = (
    icon: any,
    title: string,
    subtitle: string,
    onPress?: () => void
  ) => (
    <TouchableOpacity
      style={styles.infoItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <LinearGradient
        colors={['#1A1A2E', '#0F0F23']}
        style={styles.infoGradient}
      >
        <View style={styles.infoLeft}>
          <View style={styles.infoIcon}>
            {React.createElement(icon, { size: 20, color: '#6B46C1' })}
          </View>
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>{title}</Text>
            <Text style={styles.infoSubtitle}>{subtitle}</Text>
          </View>
        </View>
        {onPress && <ExternalLink size={16} color="#64748B" />}
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F0F23', '#1A1A2E', '#0F0F23']}
        style={styles.background}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>About</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* App Logo & Info */}
          <View style={styles.appSection}>
            <View style={styles.logoContainer}>
              <View style={styles.logoBackground}>
                <Zap size={48} color="#6B46C1" />
              </View>
              <Text style={styles.appName}>BoltLab</Text>
              <Text style={styles.appVersion}>Version 1.0.0</Text>
              <Text style={styles.appDescription}>
                Your lightning-fast fitness companion. Transform your workouts
                with gamified progress tracking and social challenges.
              </Text>
            </View>
          </View>

          {/* App Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What makes BoltLab special?</Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Zap size={16} color="#F59E0B" />
                <Text style={styles.featureText}>
                  Lightning-fast workouts designed for busy lifestyles
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Target size={16} color="#10B981" />
                <Text style={styles.featureText}>
                  Gamified progress with XP, levels, and achievements
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Heart size={16} color="#EF4444" />
                <Text style={styles.featureText}>
                  Smart streak system with rest day protection
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Users size={16} color="#3B82F6" />
                <Text style={styles.featureText}>
                  Social features to connect with fellow athletes
                </Text>
              </View>
            </View>
          </View>

          {/* Contact & Legal */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support & Legal</Text>
            {renderInfoItem(
              Mail,
              'Contact Support',
              'support@boltlab.com',
              () => openURL('mailto:support@boltlab.com')
            )}
            {renderInfoItem(Globe, 'Website', 'www.boltlab.com', () =>
              openURL('https://www.boltlab.com')
            )}
            {renderInfoItem(
              Shield,
              'Privacy Policy',
              'How we protect your data',
              () => openURL('https://www.boltlab.com/privacy')
            )}
            {renderInfoItem(
              FileText,
              'Terms of Service',
              'App usage terms and conditions',
              () => openURL('https://www.boltlab.com/terms')
            )}
          </View>

          {/* Credits */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Credits</Text>
            <View style={styles.creditsCard}>
              <LinearGradient
                colors={['#1A1A2E', '#0F0F23']}
                style={styles.creditsGradient}
              >
                <Text style={styles.creditsText}>
                  Built with ❤️ by the BoltLab team{'\n'}
                  Powered by React Native & Supabase{'\n'}
                  Icons by Lucide React{'\n'}
                  Special thanks to our beta testers
                </Text>
              </LinearGradient>
            </View>
          </View>

          {/* Build Info */}
          <View style={styles.buildInfo}>
            <Text style={styles.buildText}>Build: 1.0.0 (20250117)</Text>
            <Text style={styles.buildText}>
              © 2025 BoltLab. All rights reserved.
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
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
  backButton: {
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
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  appSection: {
    paddingVertical: 30,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6B46C1' + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  appVersion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B46C1',
    marginBottom: 16,
  },
  appDescription: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#E2E8F0',
    marginLeft: 12,
    flex: 1,
  },
  infoItem: {
    marginBottom: 12,
  },
  infoGradient: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1A1A2E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6B46C1' + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  infoSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
  },
  creditsCard: {
    marginBottom: 16,
  },
  creditsGradient: {
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1A1A2E',
  },
  creditsText: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 22,
    textAlign: 'center',
  },
  buildInfo: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  buildText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
});
