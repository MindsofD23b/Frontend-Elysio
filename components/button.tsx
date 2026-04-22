import { useTheme } from "@/lib/theme/context";
import { createContext, useContext } from "react";
import {
    ActivityIndicator,
    Pressable,
    PressableProps,
    StyleProp,
    Text,
    TextStyle,
    View,
    ViewStyle,
} from "react-native";

const ButtonContext = createContext<"default" | "outline">("default");

interface IButtonProps extends PressableProps {
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

function Button({
    children,
    onPress,
    disabled,
    variante = "default",
    style,
    ...other
}: IButtonProps) {
    const { gs } = useTheme();

    return (
        <ButtonContext.Provider value={variante}>
            <Pressable
                {...other}
                onPress={onPress}
                disabled={disabled}
                style={[
                    gs.btn,
                    variante === "outline" ? gs.btnOutline : gs.btnDefault,
                    disabled ? gs.btnDisabled : null,
                    style,
                ]}
            >
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                    }}
                >
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
        <Text
            style={[
                gs.btnText,
                variante === "outline" ? gs.btnTextOutline : gs.btnTextDefault,
                style,
            ]}
        >
            {children}
        </Text>
    );
}

function Loader() {
    const { theme } = useTheme();

    return <ActivityIndicator color={theme.white} />;
}

export { Button, BtnText, Loader };
