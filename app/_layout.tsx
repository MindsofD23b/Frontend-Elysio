import { Stack } from 'expo-router';
import BaseTheme from './baseTheme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SafeAreaWrapper from '@/components/SafeArea';

export default function RootLayout() {
  return (
    <BaseTheme>
      <SafeAreaProvider>
        <SafeAreaWrapper>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
          </Stack>
        </SafeAreaWrapper>
      </SafeAreaProvider>
    </BaseTheme>
  );
}
