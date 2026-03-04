import { useTheme } from "@/app/theme/context";
import BackWrapper from "@/components/backwrapper";
import { BtnText, Button, Loader } from "@/components/button";
import Input from "@/components/input";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { z } from "zod";

const schema = z.object({
    password: z
        .string({ error: "Password must be set" })
        .min(6, { message: "Password must be at least 6 characters long" })
        .regex(/[A-Z]/, { message: "Password must contain at least 1 uppercase letter" })
        .regex(/[a-z]/, { message: "Password must contain at least 1 lowercase letter" })
        .regex(/[0-9]/, { message: "Password must contain at least 1 number" }),
});

export default function Password() {
    const { gs, theme } = useTheme();

    useEffect(() => {
        router.prefetch("/auth/register/gender");
    }, []);

    const [password, setPassword] = useState("");
    const [confPassword, setConfPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<{
        password?: { message: string };
        confPassword?: { message: string };
    }>({});

    function onSubmit(password: string, confPassword: string) {
        const result = schema.safeParse({ password });

        if (!result.success) {
            const fieldErrors: Record<string, { message: string }> = {};

            result.error.issues.forEach((issue) => {
                const field = issue.path[0];
                console.log(issue);
                if (typeof field === "string") {
                    fieldErrors[field] = { message: issue.message };
                }
            });

            setError((prev) => ({ ...prev, ...fieldErrors }));
            return;
        }

        if (confPassword !== password) {
            setError((prev) => ({
                ...prev,
                confPassword: { message: "Passwords don't match" },
            }));
            return;
        }
        setLoading(true);

        setError({});

        setTimeout(() => {
            setLoading(false);
            router.push("/auth/register/gender");
        }, 2000);
    }

    return (
        <>
            <BackWrapper>
                <Text style={[gs.h1, { marginTop: 35 }]}>Set Your Password</Text>
                <Text
                    style={[
                        gs.bodyText,
                        { marginTop: 10, color: theme.base + "54", textAlign: "left" },
                    ]}
                >
                    Your Password keeps your account safe.{"\n"}
                    <Text style={{ fontWeight: "bold" }}>Choose wisely</Text>
                </Text>

                <View style={{ marginTop: 15 }}>
                    <Input
                        placeholder="Enter Password"
                        textContentType="newPassword"
                        value={password}
                        passwordRules="minlength: 8;"
                        autoComplete="new-password"
                        secureTextEntry
                        onChangeText={(val) => setPassword(val)}
                    />
                    {error.password && (
                        <Text style={{ color: "red", fontSize: 12 }}>
                            {error.password.message}
                        </Text>
                    )}
                    <Input
                        placeholder="Confirm Password"
                        textContentType="newPassword"
                        passwordRules="minlength: 8;"
                        value={confPassword}
                        autoComplete="new-password"
                        secureTextEntry
                        onChangeText={(val) => setConfPassword(val)}
                    />
                    {error.confPassword && (
                        <Text style={{ color: "red", fontSize: 12 }}>
                            {error.confPassword.message}
                        </Text>
                    )}
                </View>

                <Button
                    onPress={() => onSubmit(password, confPassword)}
                    style={{ marginTop: "auto" }}
                    disabled={loading}
                >
                    {loading ? <Loader /> : <BtnText>Continue</BtnText>}
                </Button>
            </BackWrapper>
        </>
    );
}
