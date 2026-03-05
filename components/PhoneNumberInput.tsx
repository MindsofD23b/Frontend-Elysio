import { useTheme } from "@/app/theme/context";
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
    onSubmit: () => void;
}

export default function PhoneNumberInput({ onSubmit }: IPhoneNumberInput) {
    const { theme } = useTheme();

    const [countryCode, setCountryCode] = useState<CC>("CH");
    const [tel, setTel] = useState("");
    const [errors, setErrors] = useState<{
        tel?: { message: string };
        password?: { message: string };
    }>({});

    onSubmit = () => {
        console.log("Validating phone number:", tel);

        const validation = schema.safeParse({ tel });
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

        const telStriped = tel.startsWith("0")
            ? tel.startsWith("00")
                ? tel.substring(2, tel.length)
                : tel.substring(1, tel.length)
            : tel;

        const parsedInternational = parsePhoneNumberFromString(
            telStriped,
            countryCode as CountryCode,
        )?.formatInternational();
        const parsedNational = parsePhoneNumberFromString(
            telStriped,
            countryCode as CountryCode,
        )?.formatNational();

        console.log("Internatnional Parsed phone number:", parsedInternational);
        console.log("Natnional Parsed phone number:", parsedNational);
        if (!parsedInternational || parsedInternational.toString().length < 5) {
            setErrors((prev) => ({ ...prev, tel: { message: "Invalid phone number" } }));
            return;
        }

        console.log({ tel });
        router.push({
            pathname: "/auth/register/sendVerificationPhone",
            params: { tel: parsedInternational.toString() },
        });
    };

    return (
        <>
            <View
                style={{
                    width: "100%",
                    marginTop: 30,
                    flexDirection: "row",
                    alignItems: "center",
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
