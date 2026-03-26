import { Redirect, Stack } from "expo-router";

const isLoggedIn = false;

export default function AuthLayout() {
    if (isLoggedIn) {
        return <Redirect href="/" />;
    }

    return <Stack screenOptions={{ headerShown: false }} />;
}