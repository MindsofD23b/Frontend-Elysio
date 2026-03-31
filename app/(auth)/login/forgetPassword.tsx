// MADE WITH HELP FROM CLAUD AI
import BackWrapper from "@/components/backwrapper";
import { useTheme } from "@/lib/theme/context";
import { Text, View } from "react-native";
import Input from "@/components/input";
import { BtnText, Button, Loader } from "@/components/button";
import { useState } from "react";
import { router } from "expo-router";
import { LucideMailbox } from "lucide-react-native";
import { Step } from "@/types/login";

export default function ForgotPassword() {
    const { gs, theme } = useTheme();

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
        if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
            setError("Invalid email address");
            return;
        }
        simulate(() => setStep("code"));
    };

    const onSubmitCode = () => {
        if (code.length < 5) {
            setError("Please enter the full code");
            return;
        }
        simulate(() => setStep("newPassword"));
    };

    const onSubmitNewPassword = () => {
        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }
        if (newPassword !== confPassword) {
            setError("Passwords dont match");
            return;
        }
        simulate(() => setStep("success"));
    };

    return (
        <BackWrapper>
            <View style={{ flex: 1, width: "100%", height: "100%" }}>
                {step === "email" && (
                    <>
                        <Text style={[gs.h1, { marginTop: 35 }]}>Forgot Password</Text>
                        <Text
                            style={[
                                gs.bodyText,
                                { marginTop: 10, color: theme.base + "54" },
                            ]}
                        >
                            Enter your{" "}
                            <Text style={{ fontWeight: "bold" }}>Email Address</Text> and
                            we will send you a reset code.
                        </Text>
                        <View style={{ marginTop: 30 }}>
                            <Input
                                placeholder="Email"
                                keyboardType="email-address"
                                onChangeText={setEmail}
                                value={email}
                                autoComplete="email"
                            />
                            {error && (
                                <Text
                                    style={{ color: "red", fontSize: 12, marginTop: 4 }}
                                >
                                    {error}
                                </Text>
                            )}
                        </View>
                        <Button
                            style={{ marginTop: "auto" }}
                            onPress={onSubmitEmail}
                            disabled={loading}
                        >
                            {loading ? <Loader /> : <BtnText>Send Reset Code</BtnText>}
                        </Button>
                    </>
                )}

                {step === "code" && (
                    <>
                        <Text style={[gs.h1, { marginTop: 35 }]}>Enter Code</Text>
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
                            We sent a reset code to{" "}
                            <Text style={{ fontWeight: "bold", color: theme.primary }}>
                                {email}
                            </Text>
                        </Text>
                        <View style={{ marginTop: 30 }}>
                            <Input
                                placeholder="Enter code"
                                keyboardType="phone-pad"
                                onChangeText={setCode}
                                value={code}
                                autoComplete="sms-otp"
                            />
                            {error && (
                                <Text
                                    style={{ color: "red", fontSize: 12, marginTop: 8 }}
                                >
                                    {error}
                                </Text>
                            )}
                            <Text
                                onPress={() => !loading && simulate(() => {})}
                                style={{
                                    color: loading ? theme.base + "54" : theme.primary,
                                    fontSize: 13,
                                    textAlign: "right",
                                    marginTop: 12,
                                }}
                            >
                                Resend code
                            </Text>
                        </View>
                        <Button
                            style={{ marginTop: "auto" }}
                            onPress={onSubmitCode}
                            disabled={loading}
                        >
                            {loading ? <Loader /> : <BtnText>Verify Code</BtnText>}
                        </Button>
                    </>
                )}

                {step === "newPassword" && (
                    <>
                        <Text style={[gs.h1, { marginTop: 35 }]}>New Password</Text>
                        <Text
                            style={[
                                gs.bodyText,
                                { marginTop: 10, color: theme.base + "54" },
                            ]}
                        >
                            Choose a{" "}
                            <Text style={{ fontWeight: "bold" }}>strong password</Text>{" "}
                            for your account.
                        </Text>
                        <View style={{ marginTop: 30 }}>
                            <Input
                                placeholder="New Password"
                                secureTextEntry
                                textContentType="newPassword"
                                autoComplete="new-password"
                                onChangeText={setNewPassword}
                                value={newPassword}
                            />
                            <Input
                                placeholder="Confirm Password"
                                secureTextEntry
                                textContentType="newPassword"
                                autoComplete="new-password"
                                onChangeText={setConfPassword}
                                value={confPassword}
                            />
                            {error && (
                                <Text
                                    style={{ color: "red", fontSize: 12, marginTop: 4 }}
                                >
                                    {error}
                                </Text>
                            )}
                        </View>
                        <Button
                            style={{ marginTop: "auto" }}
                            onPress={onSubmitNewPassword}
                            disabled={loading}
                        >
                            {loading ? <Loader /> : <BtnText>Reset Password</BtnText>}
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
                            Password Reset!
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
                            Your password has been successfully reset.
                        </Text>
                        <Button
                            style={{ marginTop: 40, width: "100%" }}
                            onPress={() => router.replace("/login/withEmail")}
                        >
                            <BtnText>Back to Login</BtnText>
                        </Button>
                    </View>
                )}
            </View>
        </BackWrapper>
    );
}
