import { useTheme } from "@/lib/theme/context";
import BackWrapper from "@/components/backwrapper";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Input from "@/components/input";
import PhoneNumberInput from "@/components/PhoneNumberInput";
import { BtnText, Button, Loader } from "@/components/button";
import { useState } from "react";
import { router } from "expo-router";
import { useFetch } from "@/hooks";
import { useRegisterStore } from "@/utils/registerStore";
import { Theme } from "@/lib/theme/theme";

type RegisterResponse = {
    message?: string;
    error?: string;
    statusCode?: number;
};

type FormErrors = {
    firstName?: { message: string };
    lastName?: { message: string };
    phoneNumber?: { message: string };
    dateOfBirth?: { message: string };
    jobTitle?: { message: string };
    aboutMe?: { message: string };
    acceptedTerms?: { message: string };
    acceptedPrivacyPolicy?: { message: string };
    general?: { message: string };
};

export default function AddProfileDataPage() {
    const { gs, theme } = useTheme();
    const styles = makeStyles(theme);
    const { data, setPersonalDetails, reset } = useRegisterStore();

    const [phonePrefix, setPhonePrefix] = useState(data.phonePrefix || "");
    const [phoneNumber, setPhoneNumber] = useState(data.phoneNumber || "");
    const [firstName, setFirstName] = useState(data.firstName || "");
    const [lastName, setLastName] = useState(data.lastName || "");
    const [dateOfBirth, setDateOfBirth] = useState(data.dateOfBirth || "");
    const [country, setCountry] = useState(data.country || "CH");
    const [language, setLanguage] = useState(data.language || "de");
    const [jobTitle, setJobTitle] = useState(data.jobTitle || "");
    const [aboutMe, setAboutMe] = useState(data.aboutMe || "");
    const [acceptedTerms, setAcceptedTerms] = useState(data.acceptedTerms || false);
    const [acceptedPrivacyPolicy, setAcceptedPrivacyPolicy] = useState(
        data.acceptedPrivacyPolicy || false,
    );

    const [errors, setErrors] = useState<FormErrors>({});

    const [, loading, fetchError, registerUser] = useFetch<RegisterResponse>(
        "/auth/register",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        },
        {
            manual: true,
            useCache: false,
        },
    );

    function handleTelefonData(
        prefix: string,
        tel: string,
        internationalTel: string,
        nationalTel: string | undefined,
    ) {
        const normalizedPrefix =
            internationalTel && tel ? internationalTel.replace(tel, "").trim() : "";

        setPhonePrefix(normalizedPrefix);
        setPhoneNumber((nationalTel || tel || "").replace(/\s+/g, ""));

        if (errors.phoneNumber) {
            setErrors((prev) => ({
                ...prev,
                phoneNumber: undefined,
            }));
        }
    }

    const formatDateInput = (value: string) => {
        const digitsOnly = value.replace(/\D/g, "").slice(0, 8);

        if (digitsOnly.length <= 4) return digitsOnly;
        if (digitsOnly.length <= 6) {
            return `${digitsOnly.slice(0, 4)}-${digitsOnly.slice(4)}`;
        }

        return `${digitsOnly.slice(0, 4)}-${digitsOnly.slice(4, 6)}-${digitsOnly.slice(6, 8)}`;
    };

    const validateDate = (value: string) => {
        const trimmed = value.trim();

        if (!trimmed) return false;

        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(trimmed)) return false;

        const date = new Date(trimmed);
        return !Number.isNaN(date.getTime());
    };

    const validate = () => {
        const nextErrors: FormErrors = {};

        if (!firstName.trim()) {
            nextErrors.firstName = { message: "First name is required" };
        }

        if (!lastName.trim()) {
            nextErrors.lastName = { message: "Last name is required" };
        }

        if (!phoneNumber.trim()) {
            nextErrors.phoneNumber = { message: "Phone number is required" };
        }

        if (!validateDate(dateOfBirth)) {
            nextErrors.dateOfBirth = {
                message: "Please enter a valid date in YYYY-MM-DD format",
            };
        }

        if (!jobTitle.trim()) {
            nextErrors.jobTitle = { message: "Job title is required" };
        }

        if (!aboutMe.trim()) {
            nextErrors.aboutMe = { message: "About me is required" };
        }

        if (!acceptedTerms) {
            nextErrors.acceptedTerms = {
                message: "You must accept the terms",
            };
        }

        if (!acceptedPrivacyPolicy) {
            nextErrors.acceptedPrivacyPolicy = {
                message: "You must accept the privacy policy",
            };
        }

        return nextErrors;
    };

    const onSubmit = async () => {
        const nextErrors = validate();
        setErrors({});

        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            return;
        }

        const personalPayload = {
            phonePrefix: phonePrefix.trim(),
            phoneNumber: phoneNumber.trim(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            dateOfBirth: dateOfBirth.trim(),
            country: country.trim().toUpperCase(),
            language: language.trim().toLowerCase(),
            jobTitle: jobTitle.trim(),
            aboutMe: aboutMe.trim(),
            acceptedTerms,
            acceptedPrivacyPolicy,
        };

        setPersonalDetails(personalPayload);

        const finalPayload = {
            email: data.email,
            password: data.password,
            phonePrefix: personalPayload.phonePrefix,
            phoneNumber: personalPayload.phoneNumber,
            gender: data.gender,
            firstName: personalPayload.firstName,
            lastName: personalPayload.lastName,
            dateOfBirth: personalPayload.dateOfBirth,
            country: personalPayload.country,
            language: personalPayload.language,
            jobTitle: personalPayload.jobTitle,
            aboutMe: personalPayload.aboutMe,
            acceptedTerms: personalPayload.acceptedTerms,
            acceptedPrivacyPolicy: personalPayload.acceptedPrivacyPolicy,
            interests: data.interests,
        };

        try {
            const response = await registerUser({
                body: JSON.stringify(finalPayload),
            });

            if (response?.statusCode && response.statusCode >= 400) {
                setErrors({
                    general: {
                        message: response.message || "Registration failed",
                    },
                });
                return;
            }

            const registeredEmail = data.email;
            reset();

            router.replace({
                pathname: "/register/sendVerificationEmail",
                params: { email: registeredEmail },
            });
        } catch (err) {
            setErrors({
                general: {
                    message: err instanceof Error ? err.message : "Registration failed",
                },
            });
        }
    };

    return (
        <BackWrapper>
            <ScrollView
                style={{ flex: 1, width: "100%" }}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={[gs.h1, { marginTop: 35 }]}>Finish your Profile</Text>

                <Text style={[gs.bodyText, { marginTop: 10, color: theme.base + "54" }]}>
                    Complete your profile details to create your account
                </Text>

                <View style={styles.form}>
                    <PhoneNumberInput sendData={handleTelefonData} />
                    {errors.phoneNumber && (
                        <Text style={styles.errorText}>{errors.phoneNumber.message}</Text>
                    )}

                    <Input
                        placeholder="First name"
                        value={firstName}
                        onChangeText={(val) => {
                            setFirstName(val);
                            if (errors.firstName) {
                                setErrors((prev) => ({
                                    ...prev,
                                    firstName: undefined,
                                }));
                            }
                        }}
                    />
                    {errors.firstName && (
                        <Text style={styles.errorText}>{errors.firstName.message}</Text>
                    )}

                    <Input
                        placeholder="Last name"
                        value={lastName}
                        onChangeText={(val) => {
                            setLastName(val);
                            if (errors.lastName) {
                                setErrors((prev) => ({
                                    ...prev,
                                    lastName: undefined,
                                }));
                            }
                        }}
                    />
                    {errors.lastName && (
                        <Text style={styles.errorText}>{errors.lastName.message}</Text>
                    )}

                    <Input
                        placeholder="Date of birth (YYYY-MM-DD)"
                        value={dateOfBirth}
                        onChangeText={(val) => {
                            setDateOfBirth(formatDateInput(val));

                            if (errors.dateOfBirth) {
                                setErrors((prev) => ({
                                    ...prev,
                                    dateOfBirth: undefined,
                                }));
                            }
                        }}
                        keyboardType="numeric"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {errors.dateOfBirth && (
                        <Text style={styles.errorText}>{errors.dateOfBirth.message}</Text>
                    )}

                    <Input
                        placeholder="Job title"
                        value={jobTitle}
                        onChangeText={(val) => {
                            setJobTitle(val);
                            if (errors.jobTitle) {
                                setErrors((prev) => ({
                                    ...prev,
                                    jobTitle: undefined,
                                }));
                            }
                        }}
                    />
                    {errors.jobTitle && (
                        <Text style={styles.errorText}>{errors.jobTitle.message}</Text>
                    )}

                    <Input
                        placeholder="About me"
                        value={aboutMe}
                        onChangeText={(val) => {
                            setAboutMe(val);
                            if (errors.aboutMe) {
                                setErrors((prev) => ({
                                    ...prev,
                                    aboutMe: undefined,
                                }));
                            }
                        }}
                    />
                    {errors.aboutMe && (
                        <Text style={styles.errorText}>{errors.aboutMe.message}</Text>
                    )}

                    <Input
                        placeholder="Country code, e.g. CH"
                        value={country}
                        onChangeText={setCountry}
                        autoCapitalize="characters"
                        autoCorrect={false}
                    />

                    <Input
                        placeholder="Language code, e.g. de"
                        value={language}
                        onChangeText={setLanguage}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    <Pressable
                        onPress={() => {
                            setAcceptedTerms((prev) => !prev);
                            if (errors.acceptedTerms) {
                                setErrors((prev) => ({
                                    ...prev,
                                    acceptedTerms: undefined,
                                }));
                            }
                        }}
                        style={styles.checkRow}
                    >
                        <View
                            style={[
                                styles.checkbox,
                                {
                                    borderColor: theme.primary,
                                    backgroundColor: acceptedTerms
                                        ? theme.primary
                                        : "transparent",
                                },
                            ]}
                        />
                        <Text style={{ color: theme.text }}>
                            I accept the Terms of Service
                        </Text>
                    </Pressable>
                    {errors.acceptedTerms && (
                        <Text style={styles.errorText}>
                            {errors.acceptedTerms.message}
                        </Text>
                    )}

                    <Pressable
                        onPress={() => {
                            setAcceptedPrivacyPolicy((prev) => !prev);
                            if (errors.acceptedPrivacyPolicy) {
                                setErrors((prev) => ({
                                    ...prev,
                                    acceptedPrivacyPolicy: undefined,
                                }));
                            }
                        }}
                        style={styles.checkRow}
                    >
                        <View
                            style={[
                                styles.checkbox,
                                {
                                    borderColor: theme.primary,
                                    backgroundColor: acceptedPrivacyPolicy
                                        ? theme.primary
                                        : "transparent",
                                },
                            ]}
                        />
                        <Text style={{ color: theme.text }}>
                            I accept the Privacy Policy
                        </Text>
                    </Pressable>
                    {errors.acceptedPrivacyPolicy && (
                        <Text style={styles.errorText}>
                            {errors.acceptedPrivacyPolicy.message}
                        </Text>
                    )}

                    {errors.general && (
                        <Text style={styles.errorText}>{errors.general.message}</Text>
                    )}

                    {!errors.general && fetchError && (
                        <Text style={styles.errorText}>
                            {fetchError instanceof Error
                                ? fetchError.message
                                : "Something went wrong"}
                        </Text>
                    )}
                </View>

                <Button onPress={onSubmit} style={styles.submitButton} disabled={loading}>
                    {loading ? <Loader /> : <BtnText>Create account</BtnText>}
                </Button>
            </ScrollView>
        </BackWrapper>
    );
}

const makeStyles = (theme: Theme) =>
    StyleSheet.create({
        scrollContent: {
            paddingBottom: 32,
            flexGrow: 1,
        },

        form: {
            marginTop: 20,
            gap: 14,
        },

        submitButton: {
            marginTop: 24,
        },

        checkRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            marginTop: 4,
        },

        checkbox: {
            width: 20,
            height: 20,
            borderRadius: 6,
            borderWidth: 1.5,
        },

        errorText: {
            color: "red",
            fontSize: 12,
            marginTop: -6,
        },
    });
