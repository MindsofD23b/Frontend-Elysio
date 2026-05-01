import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Settings2 } from "lucide-react-native";

export function DebugFAB() {
    if (!__DEV__) return null;
    return (
        <TouchableOpacity
            style={s.btn}
            onPress={() => router.push("/(protected)/debugSheet")}
        >
            <Text style={s.txt}>
                <Settings2 />
            </Text>
        </TouchableOpacity>
    );
}

const s = StyleSheet.create({
    btn: {
        position: "absolute",
        bottom: 60,
        right: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#1e1e1e",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "#3a3a3a",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
    },
    txt: { color: "#888", fontSize: 18 },
});
