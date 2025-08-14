// app/_layout.tsx
import { Stack } from 'expo-router';
import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerTintColor: '#064e3b',
          headerStyle: { backgroundColor: '#ecfdf5' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ title: 'Sign In' }} />
        <Stack.Screen name="listing/[id]" options={{ title: 'Listing' }} />
      </Stack>
    </AuthProvider>
  );
}
