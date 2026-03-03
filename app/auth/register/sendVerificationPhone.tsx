import BackWrapper from "@/components/backwrapper";
import { Text, TextInput, View } from "react-native";
import { useTheme } from "@/app/theme/context";
import { useSearchParams } from "expo-router/build/hooks";
import Input from "@/components/input";
import OTPInputs from "@/components/OTP";
import { useEffect, useState } from "react";
import { BtnText, Button, Loader } from "@/components/button";
import { router } from "expo-router";

export default function SendVerificationPhone() {
    const { gs, theme } = useTheme();

    useEffect(() => {
        router.prefetch("/auth/register/password");
    }, []);

    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<{
        otp?: { message: string };
    }>({});

    function onSubmit(code: string) {
        if (!/^[0-9]{5}$/.test(code)) {
            setError((prev) => ({ ...prev, otp: { message: "Wrong OTP Code" } }));
            return;
        }

        setError({});

        setLoading(true);

        setTimeout(() => {
            setLoading(false);
            router.push("/auth/register/password");
        }, 2000);
    }

    const searchParams = useSearchParams();

    const number = searchParams.get("tel") || "+41 79 123 45 67";

    return (
        <>
            <BackWrapper>
                <Text style={[gs.h1, { marginTop: 35 }]}>Enter Verification Code</Text>
                <Text
                    style={[
                        gs.bodyText,
                        { marginTop: 30, color: theme.base + "54", textAlign: "left" },
                    ]}
                >
                    We have sent a code to your
                    <Text style={{ fontWeight: "bold" }}>
                        {" "}
                        Phone Number:
                        {"\n"}
                        <Text style={{ color: theme.primary }}>{number}</Text>
                    </Text>
                </Text>

                <OTPInputs onChange={(code) => setCode(code)} style={{ marginTop: 40 }} />

                {error.otp && (
                    <Text style={{ color: "red", fontSize: 12 }}>
                        {error.otp.message}
                    </Text>
                )}

                <Button
                    onPress={() => onSubmit(code)}
                    style={{ marginTop: "auto", marginBottom: 0 }}
                    disabled={loading}
                >
                    {loading ? <Loader /> : <BtnText>Continue</BtnText>}
                </Button>
            </BackWrapper>
        </>
    );
}
