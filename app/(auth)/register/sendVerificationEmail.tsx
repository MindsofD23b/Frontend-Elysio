import { useTheme } from "@/lib/theme/context";
import BackWrapper from "@/components/backwrapper";
import { BtnText, Button } from "@/components/button";
import { router, useLocalSearchParams } from "expo-router";
import { LucideMailbox } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { createT } from "@/i18n";

const t = createT("auth.register.verifyEmail");

export default function SendVerificationEmail() {
    const { gs, theme } = useTheme();
    const { email } = useLocalSearchParams<{ email: string }>();

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
                <Text style={[gs.h1, { marginTop: 35, textAlign: "center" }]}>
                    {t("title")}
                </Text>

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
                            marginTop: 20,
                            color: theme.base + "54",
                            textAlign: "center",
                            lineHeight: 22,
                        },
                    ]}
                >
                    {t("verify")}
                </Text>

                <Text
                    style={[
                        gs.bodyText,
                        {
                            marginTop: 12,
                            color: theme.primary,
                            textAlign: "center",
                            fontWeight: "700",
                        },
                    ]}
                >
                    {email}
                </Text>

                <Text
                    style={[
                        gs.bodyText,
                        {
                            marginTop: 24,
                            color: theme.base + "54",
                            textAlign: "center",
                            lineHeight: 22,
                        },
                    ]}
                >
                    {t("after")}
                </Text>

                <Text
                    style={[
                        gs.bodyText,
                        {
                            marginTop: 24,
                            color: theme.base + "54",
                            textAlign: "center",
                            lineHeight: 22,
                        },
                    ]}
                >
                    {t("noEmail")}
                </Text>
                <Pressable onPress={() => alert("resend email")}>{t("resend")}</Pressable>
                <Button
                    style={{ marginTop: "auto", marginBottom: 12 }}
                    onPress={() => router.replace("/login")}
                >
                    <BtnText>{t("continue")}</BtnText>
                </Button>
            </View>
        </BackWrapper>
    );
}
