import { Stack } from "expo-router";
import BaseTheme from "./baseTheme";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/app/theme/context";
import SafeAreaWrapper from "@/components/SafeArea";

export default function RootLayout() {
  const { theme } = useTheme();

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
