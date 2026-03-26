import { useTheme } from "@/lib/theme/context";
import { router } from "expo-router";
import {
    CountryCode,
    parseIncompletePhoneNumber,
    parsePhoneNumberFromString,
} from "libphonenumber-js";
import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import CountryPicker, { CountryCode as CC } from "react-native-country-picker-modal";
import { z } from "zod";

const schema = z.object({
    tel: z.string().refine((val) => {
        const parsed = parseIncompletePhoneNumber(val);
        return !!parsed && parsed.toString().length >= 5;
    }, "Invalid phone number"),
});

interface IPhoneNumberInput {
    sendData: (tel: string, intTel: string, natTel: string | undefined) => void;
}

export default function PhoneNumberInput({ sendData }: IPhoneNumberInput) {
    const { theme } = useTheme();

    const [countryCode, setCountryCode] = useState<CC>("CH");
    const [tel, setTel] = useState("");
    const [errors, setErrors] = useState<{
        tel?: { message: string };
        password?: { message: string };
    }>({});

    const onInputExit = (text: string) => {
        console.log("Validating phone number:", text);

        const validation = schema.safeParse({ tel: text });

        if (!validation.success) {
            console.log("Validation errors:", validation.error.format());
            setErrors((prev) => ({
                ...prev,
                tel: {
                    message:
                        validation.error.format().tel?._errors[0] ||
                        "Invalid phone number",
                },
            }));
            return;
        }

        const telStriped = text.startsWith("0")
            ? text.startsWith("00")
                ? text.substring(2)
                : text.substring(1)
            : text;

        const parsedInternational = parsePhoneNumberFromString(
            telStriped,
            countryCode as CountryCode,
        )?.formatInternational();

        const parsedNational = parsePhoneNumberFromString(
            telStriped,
            countryCode as CountryCode,
        )?.formatNational();

        console.log("International Parsed phone number:", parsedInternational);
        console.log("National Parsed phone number:", parsedNational);

        if (!parsedInternational || parsedInternational.length < 5) {
            setErrors((prev) => ({
                ...prev,
                tel: { message: "Invalid phone number" },
            }));
            return;
        }

        sendData(text, parsedInternational, parsedNational);
    };

    return (
        <>
            <View
                style={{
                    width: "100%",
                    flexDirection: "row",
                    alignItems: "center",
                    marginVertical: 16,
                    gap: 20,
                    borderColor: theme.primary,
                    borderWidth: 1,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                }}
            >
                <CountryPicker
                    theme={{
                        primaryColor: theme.primary,
                        backgroundColor: theme.background,
                        onBackgroundTextColor: theme.text,
                        filterPlaceholderTextColor: theme.text,
                    }}
                    withFlag
                    withModal
                    withFilter
                    withEmoji
                    countryCode={countryCode}
                    containerButtonStyle={{
                        alignSelf: "flex-start",
                        paddingVertical: 8,
                        translateY: 8,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                    onSelect={(country) => setCountryCode(country.cca2)}
                />
                <TextInput
                    placeholder="Phone Number"
                    keyboardType="phone-pad"
                    returnKeyType="done"
                    submitBehavior="blurAndSubmit"
                    autoCapitalize="none"
                    autoComplete="tel"
                    style={{ color: theme.text }}
                    onChangeText={(text) => setTel(text)}
                    onBlur={() => onInputExit(tel)}
                    value={tel}
                />
                {errors.tel && (
                    <Text style={{ color: "red", fontSize: 12 }}>
                        {errors.tel.message}
                    </Text>
                )}
            </View>
        </>
    );
}
