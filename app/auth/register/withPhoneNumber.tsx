import BackWrapper from "@/components/backwrapper";
import { useTheme } from "../../theme/context";
import { Text, TextInput, View } from "react-native";
import { BtnText, Button, Loader } from "@/components/button";
import { useEffect, useState } from "react";
import parsePhoneNumberFromString, { parseIncompletePhoneNumber, CountryCode } from "libphonenumber-js";
import { router } from "expo-router";
import CountryPicker, { CountryCode as CC } from "react-native-country-picker-modal";
import { z } from "zod";

const schema = z.object({
    tel: z.string().refine((val) => {
        const parsed = parseIncompletePhoneNumber(val);
        return !!parsed && parsed.toString().length >= 5;
    }, "Invalid phone number"),
});

type FormData = {
    tel: string;
};

export default function WithPhoneNumber() {
    useEffect(() => {
        router.prefetch('/(tabs)');
    }, []);

    const { gs, theme } = useTheme();

    const [countryCode, setCountryCode] = useState<CC>("CH");
    const [tel, setTel] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ tel?: { message: string }; password?: { message: string } }>({});

    const onSubmit = (data: FormData) => {
        console.log("Validating phone number:", data.tel);

        const validation = schema.safeParse(data);
        if (!validation.success) {
            console.log("Validation errors:", validation.error.format());
            setErrors((prev) => ({ ...prev, tel: { message: validation.error.format().tel?._errors[0] || "Invalid phone number" } }));
            return;
        }

        const telStriped = data.tel.startsWith('0') ? data.tel.startsWith('00') ? data.tel.substring(2, data.tel.length) : data.tel.substring(1, data.tel.length) : data.tel;

        const parsedInternational = parsePhoneNumberFromString(telStriped, countryCode as CountryCode)?.formatInternational();
        const parsedNational = parsePhoneNumberFromString(telStriped, countryCode as CountryCode)?.formatNational();


        console.log("Internatnional Parsed phone number:", parsedInternational);
        console.log("Natnional Parsed phone number:", parsedNational);
        if (!parsedInternational || parsedInternational.toString().length < 5) {
            setErrors((prev) => ({ ...prev, tel: { message: "Invalid phone number" } }));
            return;
        }

        setLoading(true);
        console.log(data);
        setTimeout(() => {
            setLoading(false);
            router.push({ pathname: '/auth/register/sendVerificationPhone', params: { tel: parsedInternational.toString() } });
        }, 2000);
    };


    return (
        <>
            <BackWrapper>
                <View style={{ flex: 1, flexDirection: "column", width: "100%", height: "100%" }}>
                    <Text style={[gs.h1, { marginTop: 35 }]}>Enter your Phone Number</Text>
                    <Text style={[gs.bodyText, { marginTop: 10, color: theme.base + "54" }]}>
                        Please enter your{" "}
                        <Text style={{ fontWeight: "bold" }}>Phone Number</Text>
                    </Text>
                    <View style={{
                        width: "100%", marginTop: 30, flexDirection: "row", alignItems: "center", gap: 20,
                        borderColor: theme.primary, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12
                    }}>
                        <CountryPicker
                            theme={{
                                primaryColor: theme.primary,
                                backgroundColor: theme.background,
                                onBackgroundTextColor: theme.text,
                                filterPlaceholderTextColor: theme.text,
                            }}
                            withModal
                            withFilter
                            withFlag
                            countryCode={countryCode}
                            containerButtonStyle={{
                                alignSelf: "flex-start",
                                paddingVertical: 8,
                                translateY: 8,
                                alignItems: "center",
                                justifyContent: "center"

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
                            onChangeText={(text) => setTel(text)}
                            value={tel}
                        />
                        {errors.tel && (
                            <Text style={{ color: "red", fontSize: 12 }}>
                                {errors.tel.message}
                            </Text>
                        )}
                    </View>
                    <Button style={{ marginTop: "auto", marginBottom: 30 }} onPress={() => onSubmit({ tel })} disabled={loading}>
                        {loading ? <Loader /> : <BtnText>Continue</BtnText>}
                    </Button>
                </View>
            </BackWrapper>
        </>
    );
}