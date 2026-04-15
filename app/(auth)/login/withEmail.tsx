import BackWrapper from "@/components/backwrapper";
import { useTheme } from "../../../lib/theme/context";
import { Text, View } from "react-native";
import Input from "@/components/input";
import { BtnText, Button, Loader } from "@/components/button";
import { useState } from "react";
import { router } from "expo-router";
import { usePublicFetch } from "@/hooks/usePublicFetch";
import { useAuth } from "@/lib/auth/AuthProvider";
import { createT } from "@/i18n";

type FormData = {
    email: string;
    password: string;
};

export type LoginResponse = {
    token: string;
};

type FormErrors = {
    email?: { message: string };
    password?: { message: string };
    general?: { message: string };
};

export default function WithEmail() {
    const { gs, theme } = useTheme();
    const { login: saveLogin } = useAuth();
    const t = createT("auth.login.withEmail");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);

    const [, fetchError, loginRequest] = usePublicFetch<LoginResponse>(
        "/auth/login",
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

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        const nextErrors: FormErrors = {};

        if (!/^\S+@\S+\.\S+$/.test(data.email.trim())) {
            nextErrors.email = { message: t("errors.invalidEmail") };
        }

        if (!data.password.trim()) {
            nextErrors.password = { message: t("errors.passwordRequired") };
        }

        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            return;
        }

        try {
            const response = await loginRequest({
                body: JSON.stringify({
                    email: data.email.trim().toLowerCase(),
                    password: data.password,
                }),
            });

            if (!response?.token) {
                setErrors({
                    general: { message: t("errors.loginFailed") },
                });
                return;
            }

            await saveLogin(response.token);
            router.replace("/(protected)/(tabs)");
        } catch (err) {
            setErrors({
                general: {
                    message: err instanceof Error ? err.message : t("errors.loginFailed"),
                },
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <BackWrapper>
            <View
                style={{
                    flex: 1,
                    flexDirection: "column",
                    width: "100%",
                    height: "100%",
                }}
            >
                <Text style={[gs.h1, { marginTop: 35 }]}>{t("title")}</Text>

                <Text style={[gs.bodyText, { marginTop: 10, color: theme.base + "54" }]}>
                    {t("body")}{" "}
                    <Text style={{ fontWeight: "bold" }}>{t("bodyBold")}</Text>
                </Text>

                <View style={{ width: "100%", marginTop: 30 }}>
                    <Input
                        placeholder={t("emailPlaceholder")}
                        keyboardType="email-address"
                        onChangeText={(text) => {
                            setEmail(text);
                            if (errors.email || errors.general) {
                                setErrors((prev) => ({
                                    ...prev,
                                    email: undefined,
                                    general: undefined,
                                }));
                            }
                        }}
                        value={email}
                        autoComplete="email"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    {errors.email && (
                        <Text style={{ color: "red", fontSize: 12 }}>
                            {errors.email.message}
                        </Text>
                    )}

                    <Input
                        placeholder={t("passwordPlaceholder")}
                        secureTextEntry
                        onChangeText={(text) => {
                            setPassword(text);
                            if (errors.password || errors.general) {
                                setErrors((prev) => ({
                                    ...prev,
                                    password: undefined,
                                    general: undefined,
                                }));
                            }
                        }}
                        value={password}
                        autoComplete="current-password"
                    />

                    {errors.password && (
                        <Text style={{ color: "red", fontSize: 12 }}>
                            {errors.password.message}
                        </Text>
                    )}

                    {errors.general && (
                        <Text style={{ color: "red", fontSize: 12, marginTop: 8 }}>
                            {errors.general.message}
                        </Text>
                    )}

                    {!errors.general && fetchError && (
                        <Text style={{ color: "red", fontSize: 12, marginTop: 8 }}>
                            {fetchError instanceof Error
                                ? fetchError.message
                                : t("errors.loginFailed")}
                        </Text>
                    )}
                    <Text
                        onPress={() => router.push("../login/forgot-password")}
                        style={{
                            color: theme.primary,
                            fontSize: 13,
                            textAlign: "right",
                            marginTop: 8,
                        }}
                    >
                        {t("forgotPassword")}
                    </Text>
                </View>

                <Button
                    style={{ marginTop: "auto", marginBottom: 0 }}
                    onPress={() => onSubmit({ email, password })}
                    disabled={loading}
                >
                    {loading ? <Loader /> : <BtnText>{t("login")}</BtnText>}
                </Button>
            </View>
        </BackWrapper>
    );
}
