import { useTheme } from "@/lib/theme/context";
import BackWrapper from "@/components/backwrapper";
import { BtnText, Button, Loader } from "@/components/button";
import Input from "@/components/input";
import { router } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { z } from "zod";
import { useRegisterStore } from "@/utils/registerStore";
import { PasswordErrors } from "@/types/register";
import { createT } from "@/i18n";

const t = createT("auth.register.password");

const schema = z.object({
    password: z
        .string({ error: t("errors.mustBeSet") })
        .min(6, { message: t("errors.minLength") })
        .regex(/[A-Z]/, { message: t("errors.uppercase") })
        .regex(/[a-z]/, { message: t("errors.lowercase") })
        .regex(/[0-9]/, { message: t("errors.number") }),
});

export default function Password() {
    const { gs, theme } = useTheme();
    const { data, setPassword } = useRegisterStore();

    const [password, setPasswordInput] = useState(data.password || "");
    const [confPassword, setConfPassword] = useState(data.password || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<PasswordErrors>({});

    function onSubmit(passwordValue: string, confPasswordValue: string) {
        const result = schema.safeParse({ password: passwordValue });

        if (!result.success) {
            const fieldErrors: PasswordErrors = {};

            result.error.issues.forEach((issue) => {
                const field = issue.path[0];

                if (typeof field === "string" && field === "password") {
                    fieldErrors.password = { message: issue.message };
                }
            });

            setError(fieldErrors);
            return;
        }

        if (confPasswordValue !== passwordValue) {
            setError({
                confPassword: { message: t("errors.noMatch") },
            });
            return;
        }

        setError({});
        setLoading(true);

        setPassword(passwordValue);

        router.push("/register/gender");
        setLoading(false);
    }

    return (
        <BackWrapper>
            <Text style={[gs.h1, { marginTop: 35 }]}>{t("title")}</Text>

            <Text
                style={[
                    gs.bodyText,
                    { marginTop: 10, color: theme.base + "54", textAlign: "left" },
                ]}
            >
                {t("body")}
                {"\n"}
                <Text style={{ fontWeight: "bold" }}>{t("bodyBold")}</Text>
            </Text>

            <View style={{ marginTop: 15 }}>
                <Input
                    placeholder={t("enterPassword")}
                    textContentType="newPassword"
                    passwordRules="minlength: 6;"
                    value={password}
                    autoComplete="new-password"
                    keyboardType="default"
                    secureTextEntry
                    onChangeText={(val) => {
                        setPasswordInput(val);

                        if (error.password) {
                            setError((prev) => ({
                                ...prev,
                                password: undefined,
                            }));
                        }
                    }}
                />

                {error.password && (
                    <Text style={{ color: "red", fontSize: 12, marginTop: 6 }}>
                        {error.password.message}
                    </Text>
                )}

                <Input
                    placeholder={t("confirmPassword")}
                    textContentType="newPassword"
                    value={confPassword}
                    autoComplete="new-password"
                    secureTextEntry
                    onChangeText={(val) => {
                        setConfPassword(val);

                        if (error.confPassword) {
                            setError((prev) => ({
                                ...prev,
                                confPassword: undefined,
                            }));
                        }
                    }}
                />

                {error.confPassword && (
                    <Text style={{ color: "red", fontSize: 12, marginTop: 6 }}>
                        {error.confPassword.message}
                    </Text>
                )}
            </View>

            <Button
                onPress={() => onSubmit(password, confPassword)}
                style={{ marginTop: "auto" }}
                disabled={loading}
            >
                {loading ? <Loader /> : <BtnText>{t("continue")}</BtnText>}
            </Button>
        </BackWrapper>
    );
}
