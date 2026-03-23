import { useTheme } from "@/lib/theme/context";
import { StyleProp, TextInput, TextInputKeyPressEvent, TextStyle } from "react-native";

interface InputProps {
    placeholder: string;
    secureTextEntry?: boolean;
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
    onChangeText?: (text: string) => void;
    passwordRules?: string;
    value?: string;
    style?: StyleProp<TextStyle>;
    maxLength?: number;
    textAlign?: "left" | "center" | "right";
    onKeyPress?: (e: TextInputKeyPressEvent) => void | undefined;
    ref?: React.Ref<TextInput> | undefined;
    readonly?: boolean;
}

export default function Input({
    readonly,
    placeholder,
    secureTextEntry,
    textContentType,
    keyboardType,
    autoComplete,
    onChangeText,
    value,
    style,
    maxLength,
    textAlign,
    passwordRules,
    onKeyPress,
    ref,
}: InputProps) {
    const { theme } = useTheme();
    return (
        <TextInput
            readOnly={readonly}
            placeholder={placeholder}
            textContentType={textContentType}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            onChangeText={onChangeText}
            value={value}
            autoComplete={autoComplete}
            passwordRules={passwordRules}
            returnKeyType="done"
            submitBehavior="blurAndSubmit"
            autoCapitalize="none"
            onKeyPress={onKeyPress}
            ref={ref}
            maxLength={maxLength}
            textAlign={textAlign}
            placeholderTextColor={theme.primary + "BF"}
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
