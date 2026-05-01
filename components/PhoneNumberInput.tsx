import { useTheme } from "@/lib/theme/context";
import {
    AsYouType,
    CountryCode,
    getExtPrefix,
    parseIncompletePhoneNumber,
    parsePhoneNumberFromString,
} from "libphonenumber-js";
import { useState } from "react";
import { Text, TextInput, View, ViewStyle } from "react-native";
import CountryPicker, { CountryCode as CC } from "react-native-country-picker-modal";
import { z } from "zod";

const schema = z.object({
    tel: z.string().refine((val) => {
        const parsed = parseIncompletePhoneNumber(val);
        return !!parsed && parsed.toString().length >= 5;
    }, "Invalid phone number"),
});

interface IPhoneNumberInput {
    sendData: (
        cc: CountryCode,
        prefix: string,
        tel: string,
        natTel: string | undefined,
    ) => void;
    style?: ViewStyle;
    initialValue?: string;
}

export default function PhoneNumberInput({
    sendData,
    style,
    initialValue,
}: IPhoneNumberInput) {
    const { theme } = useTheme();

    const [countryCode, setCountryCode] = useState<CC>("CH");
    const [tel, setTel] = useState(() => {
        if (!initialValue) return "";
        const parsed = parsePhoneNumberFromString(
            initialValue,
            countryCode as CountryCode,
        );
        if (parsed) return parsed.formatNational();
        return new AsYouType(countryCode as CountryCode).input(initialValue);
    });
    const [errors, setErrors] = useState<{ tel?: { message: string } }>({});

    function onInputExit(text: string) {
        const validation = schema.safeParse({ tel: text });

        if (!validation.success) {
            setErrors({
                tel: {
                    message:
                        validation.error.format().tel?._errors[0] ??
                        "Invalid phone number",
                },
            });
            return;
        }

        setErrors({});

        const prefix = getExtPrefix(countryCode as CountryCode);
        const stripped = text.startsWith("00")
            ? text.substring(2)
            : text.startsWith("0")
              ? text.substring(1)
              : text;

        const parsedInternational = parsePhoneNumberFromString(
            stripped,
            countryCode as CountryCode,
        )?.formatInternational();
        const parsedNational = parsePhoneNumberFromString(
            stripped,
            countryCode as CountryCode,
        )?.formatNational();

        if (!parsedInternational || parsedInternational.length < 5) {
            setErrors({ tel: { message: "Invalid phone number" } });
            return;
        }

        sendData(countryCode as CountryCode, prefix, text, parsedNational);
    }

    return (
        <View
            style={[
                {
                    width: "100%",
                    flexDirection: "row",
                    alignItems: "center",
                    marginVertical: 16,
                    gap: 20,
                    borderColor: theme.primary,
                    borderWidth: 1,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                },
                style,
            ]}
        >
            <CountryPicker
                theme={{
                    primaryColorVariant: theme.base,
                    primaryColor: theme.primary,
                    backgroundColor: theme.background,
                    onBackgroundTextColor: theme.text,
                    filterPlaceholderTextColor: theme.text,
                }}
                withFlag
                withModal
                withFilter
                withEmoji
                withAlphaFilter={false}
                countryCode={countryCode}
                preferredCountries={["US", "GB", "CH", "DE", "FR"]}
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
                style={{ color: theme.text, flex: 1 }}
                onChangeText={(text) =>
                    setTel(new AsYouType(countryCode as CountryCode).input(text))
                }
                onBlur={() => onInputExit(tel)}
                value={tel}
            />
            {errors.tel && (
                <Text style={{ color: "red", fontSize: 12 }}>{errors.tel.message}</Text>
            )}
        </View>
    );
}
