import BackWrapper from "@/components/backwrapper";
import { useTheme } from "../../theme/context";
import { Text, View } from "react-native";
import Input from "@/components/input";
import { BtnText, Button, Loader } from "@/components/button";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { useFetch, useStore } from "@/hooks"

type FormData = {
    email: string;
    password: string;
};

type LoginResponse = {
    token: string;
}

export default function WithEmail() {
    useEffect(() => {
        router.prefetch("/(protected)/(tabs)");
    }, []);

    const { gs, theme } = useTheme();

    const [, setStoredToken] = useStore<string | null>("token", null)

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<{
        email?: { message: string };
        password?: { message: string };
        general?: { message: string };
    }>({});


    const [, loading, fetchError, login] = useFetch<LoginResponse>(
        "/auth/login",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
        },
        {
            manual: true,
            useCache: false,
        },

    );
    const onSubmit = async (data: FormData) => {
        const nextErrors: {
            email?: { message: string };
            password?: { message: string };
            general?: { message: string };
        } = { };

        if (!/^\S+@\S+\.\S+$/.test(data.email)) {
            nextErrors.email = { message: "Invalid email address"};
        }

        if (!data.password.trim()) {
            nextErrors.password = { message: "Password is required"};
        }
        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            return;
        }

        try {
            const response = await login({
                body: JSON.stringify({
                    email: data.email,
                    password: data.password,
                }),
            });
            await setStoredToken(response.token);
            router.replace("/(protected)/(tabs)");
        } catch (err){
            setErrors((prev => ({
                ...prev,
                general: {
                    message:
                    err instanceof Error ? err.message : "Login failed",
                },
            })));
        };
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
                    <Text style={[gs.h1, { marginTop: 35 }]}>Login with Email</Text>
                    <Text
                        style={[gs.bodyText, { marginTop: 10, color: theme.base + "54" }]}
                    >
                        Please enter your{" "}
                        <Text style={{ fontWeight: "bold" }}>Credentials</Text>
                    </Text>
                    <View style={{ width: "100%", marginTop: 30 }}>
                        <Input
                            placeholder="Email"
                            keyboardType="email-address"
                            onChangeText={(text) => setEmail(text)}
                            value={email}
                            autoComplete="email"
                        />
                        {errors.email && (
                            <Text style={{ color: "red", fontSize: 12 }}>
                                {errors.email.message}
                            </Text>
                        )}
                        <Input
                            placeholder="Password"
                            secureTextEntry
                            onChangeText={(text) => setPassword(text)}
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
                            <Text style={{ color: "red", fontSize: 12, marginTop: 8}}>
                                {fetchError.message}
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
        </>
    );
}
