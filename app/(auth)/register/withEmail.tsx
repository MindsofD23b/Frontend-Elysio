import BackWrapper from "@/components/backwrapper";
import { useTheme } from "@/lib/theme/context";
import { Text, View } from "react-native";
import Input from "@/components/input";
import { BtnText, Button, Loader } from "@/components/button";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import i18n from "@/i18n";

type FormData = {
    email: string;
};

export default function WithEmail() {
    useEffect(() => {
        router.prefetch("/register/password");
    }, []);
    const t = (key: string) => i18n.t(`auth.register.withEmail.${key}`);
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
                    <Text style={[gs.h1, { marginTop: 35 }]}>{t("title")}</Text>
                    <Text
                        style={[gs.bodyText, { marginTop: 10, color: theme.base + "54" }]}
                    >
                        {t("body")}
                        <Text style={{ fontWeight: "bold" }}>{t("bodyBold")}</Text>
                    </Text>
                    <View style={{ width: "100%", marginTop: 30 }}>
                        <Input
                            placeholder={t("placeholder")}
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
                        {loading ? <Loader /> : <BtnText>{t("continue")}</BtnText>}
                    </Button>
                </View>
            </BackWrapper>
        </>
    );
}
