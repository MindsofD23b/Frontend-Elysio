import { useTheme } from "@/lib/theme/context";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Pressable, View } from "react-native";

interface BackWrapperProps {
    children?: React.ReactNode;
    p?: boolean;
    bg?: string;
}

export default function BackWrapper({ children, p = true, bg }: BackWrapperProps) {
    const { theme } = useTheme();
    const background = bg ?? theme.background;

    return (
        <>
            <View style={{ height: "100%", backgroundColor: background }}>
                <Pressable onPress={() => router.back()}>
                    <ChevronLeft
                        color={theme.base}
                        style={{ marginLeft: 20, marginTop: 30 }}
                    />
                </Pressable>
                <View style={{ flex: 1, padding: p ? 20 : 0 }}>{children}</View>
            </View>
        </>
    );
}
