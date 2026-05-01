import { useTheme } from "@/lib/theme/context";
import { Text, View, TextInputProps } from "react-native";
import Input from "@/components/input";

interface LabeledInputProps extends TextInputProps {
    label: string;
    error?: string;
    keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
    autoComplete?:
        | "off"
        | "username"
        | "email"
        | "tel"
        | "current-password"
        | "sms-otp"
        | "new-password";
    textContentType?:
        | "emailAddress"
        | "password"
        | "telephoneNumber"
        | "oneTimeCode"
        | "none"
        | "newPassword";
}

export default function LabeledInput({
    label,
    error,
    style,
    ...props
}: LabeledInputProps) {
    const { theme } = useTheme();

    return (
        <View style={{ width: "100%", marginTop: 14 }}>
            <Text
                style={{
                    fontSize: 14,
                    fontWeight: "600",
                    marginBottom: 6,
                    color: theme.primary,
                }}
            >
                {label}
            </Text>
            <Input
                {...props}
                style={[
                    {
                        height: 52,
                        borderWidth: 0,
                        borderRadius: 18,
                        paddingHorizontal: 16,
                        fontSize: 15,
                        marginTop: 0,
                        backgroundColor: theme.card,
                    },
                    style,
                ]}
            />
            {error ? (
                <Text style={{ color: "red", fontSize: 12, marginTop: 4 }}>{error}</Text>
            ) : null}
        </View>
    );
}
