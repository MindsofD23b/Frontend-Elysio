import { useTheme } from "@/lib/theme/context";
import { createContext, useContext, useState } from "react";
import { StatusBar, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SafeAreaContext = createContext<{
    disableSafeArea: boolean;
    setDisableSafeArea: (v: boolean) => void;
}>({ disableSafeArea: false, setDisableSafeArea: () => {} });

export const useSafeAreaControl = () => useContext(SafeAreaContext);

export default function SafeAreaWrapper({ children }: { children: React.ReactNode }) {
    const { theme } = useTheme();
    const barStyle = useColorScheme() === "dark" ? "light-content" : "dark-content";
    const [disableSafeArea, setDisableSafeArea] = useState(false);

    return (
        <SafeAreaContext.Provider value={{ disableSafeArea, setDisableSafeArea }}>
            <StatusBar barStyle={barStyle} />
            <SafeAreaView
                edges={disableSafeArea ? [] : ["top", "bottom", "left", "right"]}
                style={{ flex: 1, backgroundColor: theme.background }}
            >
                <View style={{ backgroundColor: theme.background, flex: 1 }}>
                    {children}
                </View>
            </SafeAreaView>
        </SafeAreaContext.Provider>
    );
}
