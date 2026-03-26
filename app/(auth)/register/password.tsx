import { useTheme } from "@/lib/theme/context";
import BackWrapper from "@/components/backwrapper";
import { BtnText, Button, Loader } from "@/components/button";
import Input from "@/components/input";
import { router } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { z } from "zod";
import { useRegisterStore } from "@/utils/registerStore";

const schema = z.object({
    password: z
        .string({ error: "Password must be set" })
        .min(6, { message: "Password must be at least 6 characters long" })
        .regex(/[A-Z]/, { message: "Password must contain at least 1 uppercase letter" })
        .regex(/[a-z]/, { message: "Password must contain at least 1 lowercase letter" })
        .regex(/[0-9]/, { message: "Password must contain at least 1 number" }),
});

type PasswordErrors = {
    password?: { message: string };
    confPassword?: { message: string };
};

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
                confPassword: { message: "Passwords don't match" },
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
                    placeholder="Confirm Password"
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
                {loading ? <Loader /> : <BtnText>Continue</BtnText>}
            </Button>
        </BackWrapper>
    );
}