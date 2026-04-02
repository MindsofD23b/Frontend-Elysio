import BackWrapper from "@/components/backwrapper";
import { useTheme } from "../../../lib/theme/context";
import { Text, View } from "react-native";
import { BtnText, Button, Loader } from "@/components/button";
import Input from "@/components/input";
import { useEffect, useState } from "react";
import { parseIncompletePhoneNumber } from "libphonenumber-js";
import { router } from "expo-router";
import { createT } from "@/i18n";
type FormData = {
    tel: string;
    password: string;
};

const t = createT("auth.login.withPhoneNumber");

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
            setErrors((prev) => ({
                ...prev,
                tel: { message: t("errors.invalidPhone") },
            }));
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
                    <Text style={[gs.h1, { marginTop: 35 }]}>{t("title")}</Text>
                    <Text
                        style={[gs.bodyText, { marginTop: 10, color: theme.base + "54" }]}
                    >
                        {t("body")}{" "}
                        <Text style={{ fontWeight: "bold" }}>{t("bodyBold")}</Text>
                    </Text>
                    <View style={{ width: "100%", marginTop: 30 }}>
                        <Input
                            placeholder={t("phonePlaceholder")}
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
                            placeholder={t("passwordPlaceholder")}
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
                        <Text
                            onPress={() => router.push("../login/forgot-password")}
                            style={{
                                color: theme.primary,
                                fontSize: 13,
                                textAlign: "right",
                                marginTop: 8,
                            }}
                        >
                            {t("forgotPassword")}
                        </Text>
                    </View>
                    <Button
                        style={{ marginTop: "auto", marginBottom: 0 }}
                        onPress={() => onSubmit({ tel, password })}
                        disabled={loading}
                    >
                        {loading ? <Loader /> : <BtnText>{t("login")}</BtnText>}
                    </Button>
                </View>
            </BackWrapper>
        </>
    );
}
