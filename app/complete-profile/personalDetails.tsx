import { useTheme } from "@/lib/theme/context";
import BackWrapper from "@/components/backwrapper";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Input from "@/components/input";
import PhoneNumberInput from "@/components/PhoneNumberInput";
import { BtnText, Button } from "@/components/button";
import { useState } from "react";
import { router } from "expo-router";
import { useCompleteProfileStore } from "@/utils/completeProfileStore";
import { CountryCode } from "libphonenumber-js";
import { getLocales } from "expo-localization";

const inputStyle = {
    height: 52,
    borderWidth: 0,
    borderRadius: 18,
    paddingHorizontal: 16,
    fontSize: 15,
    marginTop: 0,
} as const;

function Field({
    label,
    placeholder,
    value,
    onChangeText,
    keyboardType,
    autoCapitalize,
    autoCorrect,
    error,
}: {
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (v: string) => void;
    keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
    autoCapitalize?: "none" | "words" | "sentences" | "characters";
    autoCorrect?: boolean;
    error?: string;
}) {
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
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
                autoCorrect={autoCorrect}
                style={[inputStyle, { backgroundColor: theme.card }]}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

export default function CompleteProfilePersonalDetails() {
    const { gs, theme } = useTheme();
    const { data, setPersonalDetails } = useCompleteProfileStore();

    const [dateOfBirth, setDateOfBirth] = useState(data.dateOfBirth);
    const [country, setCountry] = useState(data.country || "CH");
    const [language] = useState(data.language || getLocales()[0]?.languageCode || "en");
    const [jobTitle, setJobTitle] = useState(data.jobTitle);
    const [aboutMe, setAboutMe] = useState(data.aboutMe);
    const [city, setCity] = useState(data.city);
    const [phonePrefix, setPhonePrefix] = useState(data.phonePrefix);
    const [phoneNumber, setPhoneNumber] = useState(data.phoneNumber);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const formatDate = (v: string) => {
        const d = v.replace(/\D/g, "").slice(0, 8);
        if (d.length <= 4) return d;
        if (d.length <= 6) return `${d.slice(0, 4)}-${d.slice(4)}`;
        return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
    };

    const validateDate = (v: string) => {
        if (!v.trim()) return false;
        if (!/^\d{4}-\d{2}-\d{2}$/.test(v.trim())) return false;
        return !Number.isNaN(new Date(v.trim()).getTime());
    };

    const handlePhone = (
        cc: CountryCode,
        prefix: string,
        tel: string,
        national: string | undefined,
    ) => {
        setPhonePrefix(prefix);
        setCountry(cc);
        setPhoneNumber((national || tel || "").replace(/\s+/g, ""));
        if (errors.phoneNumber) setErrors((p) => ({ ...p, phoneNumber: "" }));
    };

    const onSubmit = () => {
        const next: Record<string, string> = {};
        if (!validateDate(dateOfBirth))
            next.dateOfBirth = "Enter a valid date (YYYY-MM-DD).";
        if (!jobTitle.trim()) next.jobTitle = "Job title is required.";
        if (!aboutMe.trim()) next.aboutMe = "Tell us a bit about yourself.";

        if (Object.keys(next).length > 0) {
            setErrors(next);
            return;
        }

        setPersonalDetails({
            dateOfBirth: dateOfBirth.trim(),
            country: country.trim().toUpperCase(),
            language: language.trim().toLowerCase(),
            jobTitle: jobTitle.trim(),
            aboutMe: aboutMe.trim(),
            city: city.trim(),
            phonePrefix: phonePrefix.trim(),
            phoneNumber: phoneNumber.trim(),
        });

        router.push("/complete-profile/profilePicture");
    };

    return (
        <BackWrapper>
            <ScrollView
                style={{ flex: 1, width: "100%" }}
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={[gs.h1, { marginTop: 35 }]}>About you</Text>
                <Text style={[gs.bodyText, { marginTop: 10, color: theme.base + "54" }]}>
                    A few more details to complete your profile.
                </Text>

                <View style={styles.form}>
                    <View style={{ width: "100%", marginTop: 14 }}>
                        <Text style={[styles.label, { color: theme.primary }]}>
                            Phone number
                        </Text>
                        <View style={{ marginTop: 6 }}>
                            <PhoneNumberInput sendData={handlePhone} />
                        </View>
                        {errors.phoneNumber && (
                            <Text style={styles.errorText}>{errors.phoneNumber}</Text>
                        )}
                    </View>

                    <Field
                        label="Date of birth"
                        placeholder="1995-08-24"
                        value={dateOfBirth}
                        onChangeText={(v) => {
                            setDateOfBirth(formatDate(v));
                            if (errors.dateOfBirth)
                                setErrors((p) => ({ ...p, dateOfBirth: "" }));
                        }}
                        keyboardType="numeric"
                        autoCapitalize="none"
                        autoCorrect={false}
                        error={errors.dateOfBirth}
                    />

                    <Field
                        label="Job title"
                        placeholder="Software Engineer"
                        value={jobTitle}
                        onChangeText={(v) => {
                            setJobTitle(v);
                            if (errors.jobTitle)
                                setErrors((p) => ({ ...p, jobTitle: "" }));
                        }}
                        error={errors.jobTitle}
                    />

                    <Field
                        label="About me"
                        placeholder="I love hiking, coffee and good conversations…"
                        value={aboutMe}
                        onChangeText={(v) => {
                            setAboutMe(v);
                            if (errors.aboutMe) setErrors((p) => ({ ...p, aboutMe: "" }));
                        }}
                        error={errors.aboutMe}
                    />

                    <Field
                        label="City"
                        placeholder="Zurich"
                        value={city}
                        onChangeText={setCity}
                        autoCapitalize="words"
                        autoCorrect={false}
                    />

                    <Field
                        label="Country code"
                        placeholder="CH"
                        value={country}
                        onChangeText={setCountry}
                        autoCapitalize="characters"
                        autoCorrect={false}
                    />
                </View>

                <Button onPress={onSubmit} style={{ marginTop: 24 }}>
                    <BtnText>Continue</BtnText>
                </Button>
            </ScrollView>
        </BackWrapper>
    );
}

const styles = StyleSheet.create({
    scroll: { paddingBottom: 32, flexGrow: 1 },
    form: { marginTop: 6, gap: 0 },
    label: { fontSize: 14, fontWeight: "600" },
    errorText: { color: "red", fontSize: 12, marginTop: 4 },
});
