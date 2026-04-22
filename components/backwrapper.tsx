import { useTheme } from "@/lib/theme/context";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Pressable, View } from "react-native";

interface BackWrapperProps {
    children?: React.ReactNode;
    p?: boolean;
    m?: boolean;
}

export default function BackWrapper({ children, p = true, m = false }: BackWrapperProps) {
    const { theme } = useTheme();

    return (
        <>
            <View
                style={{
                    height: "100%",
                    backgroundColor: theme.background,
                    paddingTop: m ? 30 : 0,
                }}
            >
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
