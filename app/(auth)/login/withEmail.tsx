import BackWrapper from "@/components/backwrapper";
import { useTheme } from "../../../lib/theme/context";
import { Text, View } from "react-native";
import Input from "@/components/input";
import { BtnText, Button, Loader } from "@/components/button";
import { useState } from "react";
import { router } from "expo-router";
import { useFetch } from "@/hooks/useFetch";
import { useAuth } from "@/lib/auth/AuthProvider";

type FormData = {
    email: string;
    password: string;
};

type LoginResponse = {
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

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<FormErrors>({});

    const [, loading, fetchError, loginRequest] = useFetch<LoginResponse>(
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
        const nextErrors: FormErrors = {};

        if (!/^\S+@\S+\.\S+$/.test(data.email.trim())) {
            nextErrors.email = { message: "Invalid email address" };
        }

        if (!data.password.trim()) {
            nextErrors.password = { message: "Password is required" };
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
                    general: { message: "Login failed. No token received." },
                });
                return;
            }

            await saveLogin(response.token);
            router.replace("/(protected)/(tabs)");
        } catch (err) {
            setErrors({
                general: {
                    message: err instanceof Error ? err.message : "Login failed",
                },
            });
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
                <Text style={[gs.h1, { marginTop: 35 }]}>Login with Email</Text>

                <Text style={[gs.bodyText, { marginTop: 10, color: theme.base + "54" }]}>
                    Please enter your{" "}
                    <Text style={{ fontWeight: "bold" }}>Credentials</Text>
                </Text>

                <View style={{ width: "100%", marginTop: 30 }}>
                    <Input
                        placeholder="Email"
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
                        placeholder="Password"
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
                                : "Something went wrong"}
                        </Text>
                    )}
                </View>

                <Button
                    style={{ marginTop: "auto", marginBottom: 0 }}
                    onPress={() => onSubmit({ email, password })}
                    disabled={loading}
                >
                    {loading ? <Loader /> : <BtnText>Login</BtnText>}
                </Button>
            </View>
        </BackWrapper>
    );
}
