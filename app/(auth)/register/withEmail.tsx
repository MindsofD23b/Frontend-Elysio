import BackWrapper from "@/components/backwrapper";
import { useTheme } from "@/lib/theme/context";
import { Text, View } from "react-native";
import Input from "@/components/input";
import { BtnText, Button, Loader } from "@/components/button";
import { useEffect, useState } from "react";
import { router } from "expo-router";

type FormData = {
    email: string;
};

export default function WithEmail() {
    useEffect(() => {
        router.prefetch("/register/password");
    }, []);

    const { gs, theme } = useTheme();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{
        email?: { message: string };
        password?: { message: string };
    }>({});

    const onSubmit = (data: FormData) => {
        if (!/^\S+@\S+\.\S+$/.test(data.email)) {
            setErrors((prev) => ({
                ...prev,
                email: { message: "Invalid email address" },
            }));
            return;
        }

        setLoading(true);
        console.log(data);

        setTimeout(() => {
            setLoading(false);
            router.push("/register/password");
        }, 2000);
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
                    <Text style={[gs.h1, { marginTop: 35 }]}>Enter your Email</Text>
                    <Text
                        style={[gs.bodyText, { marginTop: 10, color: theme.base + "54" }]}
                    >
                        Please enter your{" "}
                        <Text style={{ fontWeight: "bold" }}>Email Address</Text>
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
                    </View>
                    <Button
                        style={{ marginTop: "auto", marginBottom: 0 }}
                        onPress={() => onSubmit({ email })}
                        disabled={loading}
                    >
                        {loading ? <Loader /> : <BtnText>Continue</BtnText>}
                    </Button>
                </View>
            </BackWrapper>
        </>
    );
}
