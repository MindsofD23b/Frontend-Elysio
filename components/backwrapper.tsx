import { useTheme } from "@/app/theme/context";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Pressable, View } from "react-native";

interface BackWrapperProps {
    children: React.ReactNode;
}

export default function BackWrapper({ children }: BackWrapperProps) {
    const { theme } = useTheme();

    return (
        <>
            <View style={{ height: "100%", backgroundColor: theme.background }}>
                <Pressable onPress={() => router.back()}>
                    <ChevronLeft
                        color={theme.base}
                        style={{ marginLeft: 20, marginTop: 30 }}
                    />
                </Pressable>
                <View style={{ flex: 1, padding: 20 }}>{children}</View>
            </View>
        </>
    );
}
