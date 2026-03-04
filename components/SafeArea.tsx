import { useTheme } from "@/app/theme/context";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar, useColorScheme, View } from "react-native";

export default function SafeAreaWrapper({ children }: { children: React.ReactNode }) {
    const { theme } = useTheme();

    const barStyle = useColorScheme() === "dark" ? "light-content" : "dark-content";

    return (
        <>
            <StatusBar barStyle={barStyle} />
            <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
                <View style={{ backgroundColor: theme.background, flex: 1 }}>
                    {children}
                </View>
            </SafeAreaView>
        </>
    );
}
