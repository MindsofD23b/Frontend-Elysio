import { useTheme } from "@/lib/theme/context";
import { TextInput, TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
    textContentType?:
        | "emailAddress"
        | "password"
        | "telephoneNumber"
        | "oneTimeCode"
        | "none"
        | "newPassword";
    keyboardType?: "default" | "email-address" | "numeric" | "phone-pad" | "number-pad";
    autoComplete?:
        | "off"
        | "username"
        | "email"
        | "tel"
        | "current-password"
        | "sms-otp"
        | "new-password";
    ref?: React.Ref<TextInput> | undefined;
}

export default function Input({ style, ...props }: InputProps) {
    const { theme } = useTheme();
    return (
        <TextInput
            returnKeyType="done"
            submitBehavior="blurAndSubmit"
            autoCapitalize="none"
            placeholderTextColor={theme.primary + "BF"}
            {...props}
            style={[
                {
                    width: "100%",
                    height: 50,
                    borderWidth: 1,
                    borderColor: theme.primary,
                    color: theme.text,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    marginTop: 16,
                },
                style,
            ]}
        />
    );
}
