import { useTheme } from "@/app/theme/context";
import { Loader2 as Load } from "lucide-react-native";
import { createContext, useContext, useEffect, useRef } from "react";
import { Animated, Pressable, StyleProp, Text, TextStyle, View, ViewProps, ViewStyle } from "react-native";

// Internal context — variante flows from Button → BtnText automatically
const ButtonContext = createContext<"default" | "outline">("default");

interface ButtonProps {
    children: React.ReactNode;
    disabled?: boolean;
    onPress: () => void;
    style?: StyleProp<ViewStyle>;
    variante?: "default" | "outline";
}

interface BtnTextProps {
    children: React.ReactNode;
    style?: StyleProp<TextStyle>;
}

function Button({ children, onPress, disabled, variante = "default", style }: ButtonProps) {
    const { gs } = useTheme();
    return (
        <ButtonContext.Provider value={variante}>
            <Pressable
                onPress={onPress}
                disabled={disabled}
                style={[gs.btn, variante === "outline" ? gs.btnOutline : gs.btnDefault, disabled ? gs.btnDisabled : null, style]}
            >
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    {children}
                </View>
            </Pressable>
        </ButtonContext.Provider>
    );
}

function BtnText({ children, style }: BtnTextProps) {
    const variante = useContext(ButtonContext);
    const { gs } = useTheme();
    return (
        <Text style={[gs.btnText, variante === "outline" ? gs.btnTextOutline : gs.btnTextDefault, style]}>
            {children}
        </Text>
    );
}

function Loader({ style }: { style?: StyleProp<ViewProps> }) {
    const { theme } = useTheme();
    const spin = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(spin, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const rotate = spin.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });

    return (
        <Animated.View style={[{ transform: [{ rotate }] }, style]}>
            <Load size={18} color={theme.white} />
        </Animated.View>
    );
}

export { Button, BtnText, Loader };