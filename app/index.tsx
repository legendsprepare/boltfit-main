import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function IndexScreen() {
  const { session, loading } = useAuth();

  if (loading) {
    return null; // Or a loading screen
  }

  if (session) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/landing" />;
  }
}