import { Stack } from "expo-router";

const screenOptions = { headerShown: false };

export default function RegisterLayout() {
    return (
        <Stack screenOptions={screenOptions}>
            <Stack.Screen name="index" />
            <Stack.Screen name="withEmail" />
            <Stack.Screen name="sendVerificationEmail" />
            <Stack.Screen name="gender" />
            <Stack.Screen name="addProfilePicture" />
            <Stack.Screen name="addProfileData" />
            <Stack.Screen name="interests" />
            <Stack.Screen name="password" />
        </Stack>
    );
}
