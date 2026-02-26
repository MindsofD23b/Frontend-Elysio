import { Stack } from "expo-router";
import BaseTheme from "./baseTheme";

export default function RootLayout() {
  return (
    <BaseTheme>
      <Stack >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack>
    </BaseTheme>
  );
}
