import { useTheme } from "@/lib/theme/context";
import BackWrapper from "@/components/backwrapper";
import { BtnText, Button } from "@/components/button";
import { router, useLocalSearchParams } from "expo-router";
import { LucideMailbox } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { Text, View } from "react-native";

export default function SendVerificationEmail() {
    const renderCount = useRef(0);
    renderCount.current++;
    console.log(`sendVerificationEmail rendered: ${renderCount.current} times`);

    const { gs, theme } = useTheme();

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
                    <Text style={[gs.h1, { marginTop: 35 }]}>Confirm Email</Text>

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
                        We{"'"}ve sent you a confirmation email
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
                        To log in to your account verify your email:{" "}
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
                        Didn{"'"}t receive the email? Check your spam folder or{" "}
                        <Text
                            style={{ fontWeight: "bold", color: theme.primary }}
                            onPress={() => alert("Resend")}
                        >
                            Click here to resend.
                        </Text>
                    </Text>

                    <Button
                        style={{ marginTop: "auto", marginBottom: 0 }}
                        onPress={() => router.push("/register/password")}
                    >
                        <BtnText>Continue</BtnText>
                    </Button>
                </View>
            </BackWrapper>
        </>
    );
}
