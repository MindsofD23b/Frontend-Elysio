import BackWrapper from "@/components/backwrapper";
import { useTheme } from "../../theme/context";
import { Text, View } from "react-native";
import { BtnText, Button, Loader } from "@/components/button";
import Input from "@/components/input";
import { useEffect, useState } from "react";
import { parseIncompletePhoneNumber } from "libphonenumber-js";
import { router } from "expo-router";

type FormData = {
    tel: string;
    password: string;
};

export default function WithPhoneNumber() {
    useEffect(() => {
        router.prefetch("/(protected)/(tabs)");
    }, []);

    const { gs, theme } = useTheme();

    const [tel, setTel] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{
        tel?: { message: string };
        password?: { message: string };
    }>({});

    const onSubmit = (data: FormData) => {
        console.log("Validating phone number:", data.tel);

        const parsed = parseIncompletePhoneNumber(data.tel);

        console.log("Parsed phone number:", parsed);
        if (!parsed || parsed.toString().length < 5) {
            setErrors((prev) => ({ ...prev, tel: { message: "Invalid phone number" } }));
            return;
        }

        setLoading(true);
        console.log(data);
        setTimeout(() => {
            setLoading(false);
            router.push("/(protected)/(tabs)");
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
                    <Text style={[gs.h1, { marginTop: 35 }]}>
                        Login with Phone Number
                    </Text>
                    <Text
                        style={[gs.bodyText, { marginTop: 10, color: theme.base + "54" }]}
                    >
                        Please enter your{" "}
                        <Text style={{ fontWeight: "bold" }}>Credentials</Text>
                    </Text>
                    <View style={{ width: "100%", marginTop: 30 }}>
                        <Input
                            placeholder="+41 79 123 45 67"
                            textContentType="telephoneNumber"
                            keyboardType="phone-pad"
                            autoComplete="tel"
                            value={tel}
                            onChangeText={setTel}
                        />
                        {errors.tel && (
                            <Text style={{ color: "red", fontSize: 12 }}>
                                {errors.tel.message}
                            </Text>
                        )}
                        <Input
                            placeholder="Password"
                            secureTextEntry={true}
                            textContentType="password"
                            autoComplete="current-password"
                            value={password}
                            onChangeText={setPassword}
                        />
                        {errors.password && (
                            <Text style={{ color: "red", fontSize: 12 }}>
                                {errors.password.message}
                            </Text>
                        )}
                    </View>
                    <Button
                        style={{ marginTop: "auto", marginBottom: 0 }}
                        onPress={() => onSubmit({ tel, password })}
                        disabled={loading}
                    >
                        {loading ? <Loader /> : <BtnText>Login</BtnText>}
                    </Button>
                </View>
            </BackWrapper>
        </>
    );
}
