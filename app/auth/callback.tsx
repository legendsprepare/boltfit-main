import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const { user, hasCompletedOnboarding } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      if (user) {
        // Check if user has completed onboarding
        const hasOnboarding = await hasCompletedOnboarding();

        if (hasOnboarding) {
          // Existing user, go to main app
          router.replace('/(tabs)');
        } else {
          // New user, redirect to onboarding with Google data
          router.replace({
            pathname: '/onboarding',
            params: {
              signupData: JSON.stringify({
                name:
                  user.user_metadata?.full_name ||
                  user.user_metadata?.name ||
                  'Google User',
                email: user.email || '',
                isGoogleUser: true,
              }),
            },
          });
        }
      }
    };

    if (user) {
      handleCallback();
    }
  }, [user, router, hasCompletedOnboarding]);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F0F23', '#1A1A2E', '#0F0F23']}
        style={styles.background}
      >
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#6B46C1" />
          <Text style={styles.loadingText}>Completing sign in...</Text>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
  },
});
