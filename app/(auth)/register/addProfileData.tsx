import { useTheme } from "@/lib/theme/context";
import BackWrapper from "@/components/backwrapper";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Input from "@/components/input";
import PhoneNumberInput from "@/components/PhoneNumberInput";
import { BtnText, Button, Loader } from "@/components/button";
import { useState } from "react";
import { router } from "expo-router";
import { usePublicFetch } from "@/hooks/usePublicFetch";
import { useRegisterStore } from "@/utils/registerStore";
import { RegisterResponse, ProfileDataFormErrors } from "@/types/register";
import { createT } from "@/i18n";
import { CountryCode } from "libphonenumber-js";
import { getLocales } from "expo-localization";

const t = createT("auth.register.profileData");

export default function AddProfileDataPage() {
    const { gs, theme } = useTheme();
    const styles = makeStyles();
    const { data, setPersonalDetails, reset } = useRegisterStore();

    const [fullName, setFullName] = useState(data.firstName + " " + data.lastName || "");
    const [phonePrefix, setPhonePrefix] = useState(data.phonePrefix || "");
    const [phoneNumber, setPhoneNumber] = useState(data.phoneNumber || "");
    const [dateOfBirth, setDateOfBirth] = useState(data.dateOfBirth || "");
    const [country, setCountry] = useState(data.country || "CH");
    const [language, setLanguage] = useState(
        data.language || getLocales()[0]?.languageCode || "en",
    );
    const fullLanguageName = Intl.DisplayNames
        ? new Intl.DisplayNames([getLocales()[0]?.languageTag ?? "en"], {
              type: "language",
          }).of(language)
        : language;
    const [jobTitle, setJobTitle] = useState(data.jobTitle || "");
    const [aboutMe, setAboutMe] = useState(data.aboutMe || "");
    const [acceptedTerms, setAcceptedTerms] = useState(data.acceptedTerms || false);
    const [acceptedPrivacyPolicy, setAcceptedPrivacyPolicy] = useState(
        data.acceptedPrivacyPolicy || false,
    );

    const [errors, setErrors] = useState<ProfileDataFormErrors>({});

    const [, loading, fetchError, registerUser] = usePublicFetch<RegisterResponse>(
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
        cc: CountryCode,
        prefix: string,
        tel: string,
        nationalTel: string | undefined,
    ) {
        setPhonePrefix(prefix);
        setCountry(cc);
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
        const nextErrors: ProfileDataFormErrors = {};

        if (!fullName.trim()) {
            nextErrors.fullName = { message: t("errors.fullnameReq") };
        }

        if (!phoneNumber.trim()) {
            nextErrors.phoneNumber = { message: t("errors.phonenumberReq") };
        }

        if (!validateDate(dateOfBirth)) {
            nextErrors.dateOfBirth = {
                message: t("errors.validDate"),
            };
        }

        if (!jobTitle.trim()) {
            nextErrors.jobTitle = { message: t("errors.jobtitleReq") };
        }

        if (!aboutMe.trim()) {
            nextErrors.aboutMe = { message: t("errors.aboutmeReq") };
        }

        if (!acceptedTerms) {
            nextErrors.acceptedTerms = {
                message: t("errors.termsReq"),
            };
        }

        if (!acceptedPrivacyPolicy) {
            nextErrors.acceptedPrivacyPolicy = {
                message: t("errors.privReq"),
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
            firstName: fullName.split(" ")[0].trim(),
            lastName: fullName.split(" ")[1].trim(),
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
            console.log("response:", JSON.stringify(response));
            console.log("userId:", response?.userId);

            if (response?.statusCode && response.statusCode >= 400) {
                setErrors({
                    general: { message: response.message || t("fallback.regFailed") },
                });
                return;
            }

            console.log("=== PHOTO UPLOAD START ===");
            console.log("profilePictureUri:", data.profilePictureUri);
            console.log("userId:", response?.userId);

            if (data.profilePictureUri && response?.userId) {
                const uri = data.profilePictureUri;
                const ext = uri.split(".").pop()?.split("?")[0] ?? "jpg";
                const mimeType = ext === "png" ? "image/png" : "image/jpeg";

                console.log("ext:", ext, "mimeType:", mimeType);

                const formData = new FormData();
                formData.append("file", {
                    uri,
                    name: `profile.${ext}`,
                    type: mimeType,
                } as any);

                console.log(
                    "Sending fetch to:",
                    `https://elysio.jamiepoeffel.ch/users/${response.userId}/photos`,
                );

                const photoRes = await fetch(
                    `https://elysio.jamiepoeffel.ch/users/${response.userId}/photos`,
                    {
                        method: "POST",
                        body: formData,
                    },
                );

                const photoBody = await photoRes.text();
                console.log("=== PHOTO UPLOAD RESPONSE ===");
                console.log("status:", photoRes.status);
                console.log("body:", photoBody);
            } else {
                console.log("SKIPPED — profilePictureUri or userId missing");
                console.log("profilePictureUri:", data.profilePictureUri);
                console.log("userId:", response?.userId);
            }
        } catch (err) {
            console.error("Photo upload error:", err);
        }

        const registeredEmail = data.email;
        reset();
        router.replace({
            pathname: "/register/sendVerificationEmail",
            params: { email: registeredEmail },
        });
    };

    return (
        <BackWrapper>
            <ScrollView
                style={{ flex: 1, width: "100%" }}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={[gs.h1, { marginTop: 35 }]}>{t("title")}</Text>

                <Text style={[gs.bodyText, { marginTop: 10, color: theme.base + "54" }]}>
                    {t("body")}
                </Text>

                <View style={styles.form}>
                    <PhoneNumberInput sendData={handleTelefonData} />
                    {errors.phoneNumber && (
                        <Text style={styles.errorText}>{errors.phoneNumber.message}</Text>
                    )}

                    <Input
                        placeholder={t("fullName")}
                        value={fullName}
                        onChangeText={(val) => {
                            setFullName(val);
                            if (errors.fullName) {
                                setErrors((prev) => ({
                                    ...prev,
                                    lastName: undefined,
                                }));
                            }
                        }}
                    />
                    {errors.fullName && (
                        <Text style={styles.errorText}>{errors.fullName.message}</Text>
                    )}

                    <Input
                        placeholder={t("dateOfBirth")}
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
                        placeholder={t("jobTitle")}
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
                        placeholder={t("aboutMe")}
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
                        placeholder={t("countryCode")}
                        value={country}
                        onChangeText={setCountry}
                        autoCapitalize="characters"
                        autoCorrect={false}
                    />

                    <Input
                        placeholder={t("language")}
                        value={fullLanguageName ?? language}
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
                        <Text style={{ color: theme.text }}>{t("termsOfService")}</Text>
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
                        <Text style={{ color: theme.text }}>{t("privacyPolicy")}</Text>
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
                                : t("fallback.errors.wentWrong")}
                        </Text>
                    )}
                </View>

                <Button onPress={onSubmit} style={styles.submitButton} disabled={loading}>
                    {loading ? <Loader /> : <BtnText>{t("continue")}</BtnText>}
                </Button>
            </ScrollView>
        </BackWrapper>
    );
}

const makeStyles = () =>
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
