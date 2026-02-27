import { useTheme } from "@/app/theme/context";
import { Pressable, Text } from "react-native";

interface ButtonProps {
    children: React.ReactNode;
    disabled?: boolean;
    onPress: () => void;
}

export default function Button({ children, onPress }: ButtonProps) {
    const { gs } = useTheme();

    return (
        <Pressable onPress={onPress} style={gs.btn}>
            <Text style={gs.btnText}>{children}</Text>
        </Pressable>
    );
}