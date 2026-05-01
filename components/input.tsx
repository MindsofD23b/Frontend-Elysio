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
    keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
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
                    height: 52,
                    borderWidth: 0,
                    borderRadius: 18,
                    paddingHorizontal: 16,
                    fontSize: 15,
                    marginTop: 0,
                    backgroundColor: theme.card,
                    color: theme.text,
                },
                style,
            ]}
        />
    );
}
