import BackWrapper from "@/components/backwrapper";
import { useTheme } from "@/lib/theme/context";
import { Text, View } from "react-native";
import Input from "@/components/input";
import { BtnText, Button, Loader } from "@/components/button";
import { useState } from "react";
import { router } from "expo-router";
import { usePublicFetch } from "@/hooks/usePublicFetch";
import { useRegisterStore } from "@/utils/registerStore";
import { RegisterResponse, EmailFormErrors } from "@/types/register";
import { createT } from "@/i18n";

const t = createT("auth.register.withEmail");

export default function WithEmail() {
    const { gs, theme } = useTheme();
    const { data, setEmail } = useRegisterStore();

    const [email, setEmailInput] = useState(data.email || "");
    const [errors, setErrors] = useState<EmailFormErrors>({});

    const [_, loading, fetchError, checkEmail] = usePublicFetch<RegisterResponse>(
        "/auth/check-email",
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

    const onSubmit = async () => {
        const normalizedEmail = email.trim().toLowerCase();
        const nextErrors: EmailFormErrors = {};

        if (!normalizedEmail) {
            nextErrors.email = { message: t("errors.required") };
        } else if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
            nextErrors.email = { message: t("errors.invalidEmail") };
        }

        setErrors({});

        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            return;
        }

        try {
            const response = await checkEmail({
                body: JSON.stringify({
                    email: normalizedEmail,
                }),
            });

            if (response?.statusCode && response.statusCode >= 400) {
                setErrors({
                    email: {
                        message: response.message || t("fallbacks.inUse"),
                    },
                });
                return;
            }

            setEmail(normalizedEmail);
            router.push("/register/password");
        } catch (err) {
            setErrors({
                general: {
                    message:
                        err instanceof Error
                            ? err.message
                            : t("fallbacks.errors.reqFailed"),
                },
            });
        }
    };

    return (
        <BackWrapper>
            <View style={{ flex: 1, width: "100%" }}>
                <Text style={[gs.h1, { marginTop: 35 }]}>{t("title")}</Text>
                <Text style={[gs.bodyText, { marginTop: 10, color: theme.base + "54" }]}>
                    {t("body")}{" "}
                    <Text style={{ fontWeight: "bold" }}>{t("bodyBold")}</Text>
                </Text>

                <View style={{ width: "100%", marginTop: 30 }}>
                    <Input
                        placeholder={t("email")}
                        keyboardType="email-address"
                        value={email}
                        onChangeText={(text) => {
                            setEmailInput(text);
                            if (errors.email || errors.general) setErrors({});
                        }}
                        autoComplete="email"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    {errors.email && (
                        <Text style={{ color: "red", fontSize: 12, marginTop: 8 }}>
                            {errors.email.message}
                        </Text>
                    )}

                    {!errors.email && errors.general && (
                        <Text style={{ color: "red", fontSize: 12, marginTop: 8 }}>
                            {errors.general.message}
                        </Text>
                    )}

                    {!errors.email && !errors.general && fetchError && (
                        <Text style={{ color: "red", fontSize: 12, marginTop: 8 }}>
                            {fetchError instanceof Error
                                ? fetchError.message
                                : t("fallbacks.errors.wentWrong")}
                        </Text>
                    )}
                </View>

                <Button
                    style={{ marginTop: "auto" }}
                    onPress={onSubmit}
                    disabled={loading}
                >
                    {loading ? <Loader /> : <BtnText>{t("continue")}</BtnText>}
                </Button>
            </View>
        </BackWrapper>
    );
}
