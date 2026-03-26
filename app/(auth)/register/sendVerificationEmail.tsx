import { useTheme } from "@/lib/theme/context";
import BackWrapper from "@/components/backwrapper";
import { BtnText, Button } from "@/components/button";
import { router, useLocalSearchParams } from "expo-router";
import { LucideMailbox } from "lucide-react-native";
import { useEffect } from "react";
import { Text, View } from "react-native";
import i18n from "@/i18n";

export default function SendVerificationEmail() {
    const { gs, theme } = useTheme();
    const t = (key: string) => i18n.t(`auth.register.verifyEmail.${key}`);
    useEffect(() => {}, []);

    const { email } = useLocalSearchParams<{ email: string }>();

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

                    <LucideMailbox
                        size={100}
                        color={theme.primary}
                        style={{ marginTop: 45, alignSelf: "center" }}
                    />

                    <Text
                        style={[
                            gs.bodyText,
                            {
                                marginTop: 30,
                                color: theme.base + "54",
                                textAlign: "center",
                            },
                        ]}
                    >
                        {t("sent")}
                    </Text>
                    <Text
                        style={[
                            gs.bodyText,
                            {
                                marginTop: 30,
                                color: theme.base + "54",
                                textAlign: "center",
                            },
                        ]}
                    >
                        {t("verify")}{" "}
                        <Text style={{ fontWeight: "bold", color: theme.primary }}>
                            {email}
                        </Text>
                    </Text>

                    <Text
                        style={[
                            gs.bodyText,
                            {
                                marginTop: 30,
                                color: theme.base + "54",
                                textAlign: "center",
                            },
                        ]}
                    >
                        {t("noEmail")}{" "}
                        <Text
                            style={{ fontWeight: "bold", color: theme.primary }}
                            onPress={() => alert("Resend")}
                        >
                            {t("resend")}
                        </Text>
                    </Text>

                    <Button
                        style={{ marginTop: "auto", marginBottom: 0 }}
                        onPress={() => router.push("/register/password")}
                    >
                        <BtnText>{t("continue")}</BtnText>
                    </Button>
                </View>
            </BackWrapper>
        </>
    );
}
