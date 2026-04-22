import { Stack } from "expo-router";
import { ErrorScreen } from "@/components/ErrorScreen";

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
    return <ErrorScreen error={error} retry={retry} />;
}

export default function FavoritesLayout() {
    return <Stack screenOptions={{ headerShown: false }} />;
}
