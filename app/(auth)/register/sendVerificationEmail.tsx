import { useTheme } from "@/lib/theme/context";
import BackWrapper from "@/components/backwrapper";
import { BtnText, Button } from "@/components/button";
import { router, useLocalSearchParams } from "expo-router";
import { LucideMailbox } from "lucide-react-native";
import { Text, View } from "react-native";
import i18n from "@/i18n";

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
                    Confirm Email
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
                    We{"'"}ve sent you a confirmation email.
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
                    To activate your account, please verify your email address:
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
                    After confirming your email, you can log in to your account.
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
                    Didn{"'"}t receive the email? Check your spam folder first.
                </Text>

                <Button
                    style={{ marginTop: "auto", marginBottom: 12 }}
                    onPress={() => router.replace("/login")}
                >
                    <BtnText>Go to Login</BtnText>
                </Button>
            </View>
        </BackWrapper>
    );
}
