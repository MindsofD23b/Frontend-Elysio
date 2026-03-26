import { Redirect, Stack } from "expo-router";

const isLoggedIn = false;

export default function ProtectedLayout() {
    if (!isLoggedIn) {
        return <Redirect href="/login" />;
    }

    return <Stack screenOptions={{ headerShown: false }} />;
}
