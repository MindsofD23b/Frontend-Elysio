import BackWrapper from "@/components/backwrapper";
import { useTheme } from "../../../lib/theme/context";
import { Text, View } from "react-native";
import { BtnText, Button, Loader } from "@/components/button";
import Input from "@/components/input";
import { useEffect, useState } from "react";
import { parsePhoneNumberWithError } from "libphonenumber-js";
import { router } from "expo-router";
import { createT } from "@/i18n";
import { usePublicFetch } from "@/hooks/usePublicFetch";
import { useAuth } from "@/lib/auth/AuthProvider";
import { LoginResponse } from "./withEmail";
type FormErrors = {
    tel?: { message: string };
    password?: { message: string };
    general?: { message: string };
};

const t = createT("auth.login.withPhoneNumber");

export default function WithPhoneNumber() {
    useEffect(() => {
        router.prefetch("/(protected)/(tabs)");
    }, []);

    const { gs, theme } = useTheme();
    const { login: saveLogin } = useAuth();
    const [tel, setTel] = useState("");
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

    const onSubmit = async () => {
        setLoading(true);
        const nextErrors: FormErrors = {};

        let parsed;
        try {
            parsed = parsePhoneNumberWithError(tel);
        } catch {
            parsed = null;
        }

        if (!parsed || !parsed.isValid()) {
            nextErrors.tel = { message: t("errors.invalidPhone") };
        }

        if (!password.trim()) {
            nextErrors.password = { message: t("errors.passwordRequired") };
        }

        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        try {
            const response = await loginRequest({
                body: JSON.stringify({
                    phonePrefix: "+" + parsed!.countryCallingCode,
                    phoneNumber: parsed!.nationalNumber,
                    password,
                }),
            });

            if (!response?.token) {
                setErrors({ general: { message: t("errors.loginFailed") } });
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
        <>
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
                    <Text
                        style={[gs.bodyText, { marginTop: 10, color: theme.base + "54" }]}
                    >
                        {t("body")}{" "}
                        <Text style={{ fontWeight: "bold" }}>{t("bodyBold")}</Text>
                    </Text>
                    <View style={{ width: "100%", marginTop: 30 }}>
                        <Input
                            placeholder={t("phonePlaceholder")}
                            textContentType="telephoneNumber"
                            keyboardType="phone-pad"
                            autoComplete="tel"
                            value={tel}
                            onChangeText={(text) => {
                                setTel(text);
                                if (errors.tel || errors.general) {
                                    setErrors((prev) => ({
                                        ...prev,
                                        tel: undefined,
                                        general: undefined,
                                    }));
                                }
                            }}
                        />
                        {errors.tel && (
                            <Text style={{ color: "red", fontSize: 12 }}>
                                {errors.tel.message}
                            </Text>
                        )}
                        <Input
                            placeholder={t("passwordPlaceholder")}
                            secureTextEntry={true}
                            textContentType="password"
                            autoComplete="current-password"
                            value={password}
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
                            onPress={() => router.push("/(auth)/login/forgot-password")}
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
                        onPress={onSubmit}
                        disabled={loading}
                    >
                        {loading ? <Loader /> : <BtnText>{t("login")}</BtnText>}
                    </Button>
                </View>
            </BackWrapper>
        </>
    );
}
