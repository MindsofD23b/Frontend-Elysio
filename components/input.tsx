import { useTheme } from "@/app/theme/context";
import { StyleProp, TextInput, TextStyle } from "react-native";

interface InputProps {
    placeholder: string;
    secureTextEntry?: boolean;
    textContentType?: "emailAddress" | "password" | "telephoneNumber";
    keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
    autoComplete?: "off" | "username" | "email" | "tel" | "current-password";
    onChangeText?: (text: string) => void;
    value?: string;
    style?: StyleProp<TextStyle>;
}

export default function Input({ placeholder, secureTextEntry, textContentType, keyboardType, autoComplete, onChangeText, value, style }: InputProps) {
    const { theme } = useTheme();
    return (
        <TextInput
            placeholder={placeholder}
            textContentType={textContentType}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            onChangeText={onChangeText}
            value={value}
            autoComplete={autoComplete}
            placeholderTextColor={theme.primary + "BF"}
            style={[{
                width: "100%",
                height: 50,
                borderWidth: 1,
                borderColor: theme.primary,
                borderRadius: 8,
                paddingHorizontal: 12,
                marginTop: 16,
            }, style]}
        />
    )
}