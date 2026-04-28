import { useTheme } from "@/lib/theme/context";
import { createContext, useContext, useState } from "react";
import { StatusBar, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Edge = "top" | "bottom" | "left" | "right";

const ALL_EDGES: Edge[] = ["top", "bottom", "left", "right"];

const SafeAreaContext = createContext<{
    disabledEdges: Edge[];
    setDisableSafeArea: (v: boolean) => void;
    setDisabledEdges: (edges: Edge[]) => void;
}>({ disabledEdges: [], setDisableSafeArea: () => {}, setDisabledEdges: () => {} });

export const useSafeAreaControl = () => useContext(SafeAreaContext);

export default function SafeAreaWrapper({ children }: { children: React.ReactNode }) {
    const { theme } = useTheme();
    const barStyle = useColorScheme() === "dark" ? "light-content" : "dark-content";
    const [disabledEdges, setDisabledEdges] = useState<Edge[]>([]);

    const setDisableSafeArea = (v: boolean) => setDisabledEdges(v ? ALL_EDGES : []);

    const activeEdges = ALL_EDGES.filter((e) => !disabledEdges.includes(e));

    return (
        <SafeAreaContext.Provider
            value={{ disabledEdges, setDisableSafeArea, setDisabledEdges }}
        >
            <StatusBar barStyle={barStyle} />
            <SafeAreaView
                edges={activeEdges}
                style={{ flex: 1, backgroundColor: theme.background }}
            >
                <View style={{ backgroundColor: theme.background, flex: 1 }}>
                    {children}
                </View>
            </SafeAreaView>
        </SafeAreaContext.Provider>
    );
}
