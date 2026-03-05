import { useRef, useState } from "react";
import { View, TextInput, StyleProp, ViewStyle } from "react-native";
import Input from "@/components/input";
import { useStore } from "@/hooks/index.d";

interface OTPInputsProps {
    onChange?: (code: string) => void;
    style?: StyleProp<ViewStyle>;
}

export default function OTPInputs({ onChange, style }: OTPInputsProps) {
    const [code, setCode] = useState(["", "", "", "", ""]);
    const inputs = useRef<TextInput[]>([]);
    const [value, setValue] = useStore("token");

    const updateCode = (newCode: string[]) => {
        setCode(newCode);
        onChange?.(newCode.join(""));
    };

    const handleChange = (text: string, index: number) => {
        if (text.length > 1) {
            const pasted = text.slice(0, code.length).split("");
            const newCode = [...code];

            pasted.forEach((char, i) => {
                newCode[i] = char;
            });

            updateCode(newCode);

            const lastIndex = pasted.length - 1;
            inputs.current[lastIndex]?.focus();

            return;
        }

        const newCode = [...code];
        newCode[index] = text;
        updateCode(newCode);

        if (text && index < inputs.current.length - 1) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (key: string, index: number) => {
        if (key === "Backspace") {
            const newCode = [...code];

            if (newCode[index]) {
                newCode[index] = "";
                setCode(newCode);
                onChange?.(newCode.join(""));
            } else if (index > 0) {
                inputs.current[index - 1]?.focus();
                newCode[index - 1] = "";
                setCode(newCode);
                onChange?.(newCode.join(""));
            }
        }
    };

    return (
        <View style={[{ flexDirection: "row", justifyContent: "space-between" }, style]}>
            {code.map((digit, index) => (
                <Input
                    key={index}
                    value={digit}
                    placeholder=""
                    keyboardType="numeric"
                    maxLength={index === 0 ? code.length : 1}
                    textAlign="center"
                    textContentType={index === 0 ? "oneTimeCode" : "none"}
                    autoComplete={index === 0 ? "sms-otp" : "off"}
                    style={{
                        width: 50,
                        marginTop: 0,
                        paddingHorizontal: 0,
                    }}
                    onChangeText={(text) => handleChange(text, index)}
                    onKeyPress={({ nativeEvent }) =>
                        handleKeyPress(nativeEvent.key, index)
                    }
                    ref={(ref) => {
                        if (ref) inputs.current[index] = ref;
                    }}
                />
            ))}
        </View>
    );
}
