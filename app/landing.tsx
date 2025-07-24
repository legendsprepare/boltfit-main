import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, Target, Trophy, Users, ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function LandingScreen() {
  const router = useRouter();

  const features = [
    {
      icon: Zap,
      title: 'Lightning Workouts',
      description:
        'High-intensity training sessions designed for maximum results',
      color: '#6B46C1',
    },
    {
      icon: Target,
      title: 'Goal Tracking',
      description: 'Set and achieve your fitness goals with precision tracking',
      color: '#F59E0B',
    },
    {
      icon: Trophy,
      title: 'Achievements',
      description: 'Unlock rewards and celebrate your fitness milestones',
      color: '#3B82F6',
    },
    {
      icon: Users,
      title: 'Social Community',
      description: 'Connect with like-minded fitness enthusiasts',
      color: '#10B981',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F0F23', '#1A1A2E', '#0F0F23']}
        style={styles.background}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBackground}>
              <Zap size={40} color="#6B46C1" />
            </View>
            <Text style={styles.logoText}>BoltLab</Text>
          </View>

          <Text style={styles.heroTitle}>
            Supercharge Your{'\n'}
            <Text style={styles.heroTitleAccent}>Fitness Journey</Text>
          </Text>

          <Text style={styles.heroSubtitle}>
            Join the lightning-fast fitness revolution with workouts designed to
            energize and transform your body
          </Text>

          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push('/onboarding')}
          >
            <LinearGradient
              colors={['#6B46C1', '#8B5CF6']}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaButtonText}>Get Started</Text>
              <ArrowRight size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.signInButtonText}>
              Already have an account? Sign in
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statsCard}>
            <LinearGradient
              colors={['#1A1A2E', '#0F0F23']}
              style={styles.statsGradient}
            >
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>10K+</Text>
                  <Text style={styles.statLabel}>Active Users</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>50+</Text>
                  <Text style={styles.statLabel}>Workouts</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>95%</Text>
                  <Text style={styles.statLabel}>Success Rate</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>
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
  heroSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBackground: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6B46C1' + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 42,
  },
  heroTitleAccent: {
    color: '#6B46C1',
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  ctaButton: {
    marginBottom: 20,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  signInButton: {
    paddingVertical: 12,
  },
  signInButtonText: {
    fontSize: 16,
    color: '#6B46C1',
    fontWeight: '500',
  },
  featuresSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  featuresTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    marginBottom: 16,
  },
  featureGradient: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1A1A2E',
    alignItems: 'center',
    minHeight: 160,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  statsCard: {
    marginBottom: 16,
  },
  statsGradient: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1A1A2E',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6B46C1',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#94A3B8',
  },
});
