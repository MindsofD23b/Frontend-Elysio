import { Stack } from 'expo-router';

export default function RegisterLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="gender" />
      <Stack.Screen name="addProfile" />
      <Stack.Screen name="interests" />
      <Stack.Screen name="password" />
    </Stack>
  );
}
