import BackWrapper from "@/components/backwrapper";
import { useTheme } from "@/lib/theme/context";
import { Text, View } from "react-native";
import LabeledInput from "@/components/LabeledInput";
import { BtnText, Button, Loader } from "@/components/button";
import { useState } from "react";
import { router } from "expo-router";
import { LucideMailbox } from "lucide-react-native";
import { createT } from "@/i18n";

type Step = "email" | "code" | "newPassword" | "success";

export default function ForgotPassword() {
    const { gs, theme } = useTheme();
    const t = createT("auth.forgotPassword");
    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confPassword, setConfPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const simulate = (next: () => void) => {
        setLoading(true);
        setError(null);
        setTimeout(() => {
            setLoading(false);
            next();
        }, 1500);
    };

    const onSubmitEmail = () => {
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            setError(t("errors.invalidEmail"));
            return;
        }
        simulate(() => setStep("code"));
    };

    const onSubmitCode = () => {
        if (code.length < 5) {
            setError(t("errors.codeToShort"));
            return;
        }
        simulate(() => setStep("newPassword"));
    };

    const onSubmitNewPassword = () => {
        if (newPassword.length < 6) {
            setError(t("errors.passwordTooShort"));
            return;
        }
        if (newPassword !== confPassword) {
            setError(t("errors.passwordMismatch"));
            return;
        }
        simulate(() => setStep("success"));
    };

    return (
        <BackWrapper>
            <View style={{ flex: 1, width: "100%", height: "100%" }}>
                {step === "email" && (
                    <>
                        <Text style={[gs.h1, { marginTop: 35 }]}>{t("title")}</Text>
                        <Text
                            style={[
                                gs.bodyText,
                                { marginTop: 10, color: theme.base + "54" },
                            ]}
                        >
                            {t("subtitle")}{" "}
                            <Text style={{ fontWeight: "bold" }}>
                                {t("subtitleBold")}{" "}
                            </Text>{" "}
                            {t("subtitleSuffix")}
                        </Text>
                        <View style={{ marginTop: 16 }}>
                            <LabeledInput
                                label={t("emailPlaceholder")}
                                placeholder="anna@example.com"
                                keyboardType="email-address"
                                onChangeText={(v) => {
                                    setEmail(v);
                                    setError(null);
                                }}
                                value={email}
                                autoComplete="email"
                                error={error ?? undefined}
                            />
                        </View>
                        <Button
                            style={{ marginTop: "auto" }}
                            onPress={onSubmitEmail}
                            disabled={loading}
                        >
                            {loading ? <Loader /> : <BtnText>{t("sendCode")}</BtnText>}
                        </Button>
                    </>
                )}

                {step === "code" && (
                    <>
                        <Text style={[gs.h1, { marginTop: 35 }]}>{t("enterCode")}</Text>
                        <LucideMailbox
                            size={80}
                            color={theme.primary}
                            style={{ marginTop: 40, alignSelf: "center" }}
                        />
                        <Text
                            style={[
                                gs.bodyText,
                                {
                                    marginTop: 20,
                                    color: theme.base + "54",
                                    textAlign: "center",
                                },
                            ]}
                        >
                            {t("codeSentTo")}{" "}
                            <Text style={{ fontWeight: "bold", color: theme.primary }}>
                                {email}
                            </Text>
                        </Text>
                        <View style={{ marginTop: 16 }}>
                            <LabeledInput
                                label={t("codePlaceholder")}
                                placeholder="123456"
                                keyboardType="phone-pad"
                                onChangeText={(v) => {
                                    setCode(v);
                                    setError(null);
                                }}
                                value={code}
                                autoComplete="sms-otp"
                                error={error ?? undefined}
                            />
                            <Text
                                onPress={() => simulate(() => {})}
                                style={{
                                    color: theme.primary,
                                    fontSize: 13,
                                    textAlign: "right",
                                    marginTop: 8,
                                }}
                            >
                                {t("resendCode")}
                            </Text>
                        </View>
                        <Button
                            style={{ marginTop: "auto" }}
                            onPress={onSubmitCode}
                            disabled={loading}
                        >
                            {loading ? <Loader /> : <BtnText>{t("verifyCode")}</BtnText>}
                        </Button>
                    </>
                )}

                {step === "newPassword" && (
                    <>
                        <Text style={[gs.h1, { marginTop: 35 }]}>{t("newPassword")}</Text>
                        <Text
                            style={[
                                gs.bodyText,
                                { marginTop: 10, color: theme.base + "54" },
                            ]}
                        >
                            {t("newPasswordSubtitlePrefix")}{" "}
                            <Text style={{ fontWeight: "bold" }}>
                                {t("newPasswordSubtitleBold")}
                            </Text>{" "}
                            {t("newPasswordSubtitleSuffix")}
                        </Text>
                        <View style={{ marginTop: 16 }}>
                            <LabeledInput
                                label={t("newPasswordPlaceholder")}
                                placeholder="••••••••"
                                secureTextEntry
                                textContentType="newPassword"
                                autoComplete="new-password"
                                onChangeText={(v) => {
                                    setNewPassword(v);
                                    setError(null);
                                }}
                                value={newPassword}
                            />
                            <LabeledInput
                                label={t("confirmPasswordPlaceholder")}
                                placeholder="••••••••"
                                secureTextEntry
                                textContentType="newPassword"
                                autoComplete="new-password"
                                onChangeText={(v) => {
                                    setConfPassword(v);
                                    setError(null);
                                }}
                                value={confPassword}
                                error={error ?? undefined}
                            />
                        </View>
                        <Button
                            style={{ marginTop: "auto" }}
                            onPress={onSubmitNewPassword}
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader />
                            ) : (
                                <BtnText>{t("resetPassword")}</BtnText>
                            )}
                        </Button>
                    </>
                )}

                {step === "success" && (
                    <View
                        style={{
                            flex: 1,
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <LucideMailbox size={100} color={theme.primary} />
                        <Text
                            style={[
                                gs.h1,
                                { marginTop: 24, textAlign: "center", color: theme.text },
                            ]}
                        >
                            {t("successTitle")}
                        </Text>
                        <Text
                            style={[
                                gs.bodyText,
                                {
                                    marginTop: 10,
                                    color: theme.base + "54",
                                    textAlign: "center",
                                },
                            ]}
                        >
                            {t("successBody")}
                        </Text>
                        <Button
                            style={{ marginTop: 40, width: "100%" }}
                            onPress={() => router.replace("/(auth)/login/withEmail")}
                        >
                            <BtnText>{t("backToLogin")}</BtnText>
                        </Button>
                    </View>
                )}
            </View>
        </BackWrapper>
    );
}
