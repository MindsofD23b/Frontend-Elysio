import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/app/theme/context";
import Input from "@/components/input";

type Props = {
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    keyboardType?: "default" | "email-address" | "phone-pad" | "number-pad";
    autoComplete?: "email" | "tel" | "off" | "username" | "current-password";
};

export default function Field({
    label,
    placeholder,
    value,
    onChangeText,
    keyboardType,
    autoComplete,
}: Props) {
    const { theme } = useTheme();

    const styles = StyleSheet.create({
        inputWrap: {
            width: "100%",
        },
        label: {
            marginTop: 11,
            fontSize: 14,
            fontWeight: "600",
            marginBottom: -7,
            lineHeight: 12,
            color: theme.primary,
        },
    });

    return (
        <View style={styles.inputWrap}>
            <Text style={styles.label}>{label}</Text>

            <Input
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
                autoComplete={autoComplete}
            />
        </View>
    );
}
