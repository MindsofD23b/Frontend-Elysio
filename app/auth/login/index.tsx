import { useTheme } from "@/app/theme/context";
import { BtnText, Button } from "@/components/button";
import { Link, router } from "expo-router";
import { HomeIcon } from "lucide-react-native";
import { StyleSheet, Text, View, useColorScheme } from "react-native";
import { Image } from "expo-image";
import { Theme } from "@/app/theme/theme";
import { useEffect } from "react";
import i18n from "@/i18n";
import { keyof } from "zod";

export default function Login() {
    const { gs, theme } = useTheme();
    const styles = makeStyles(theme);
    const t = (key: string) => i18n.t("auth.login.${key}");
    useEffect(() => {
        router.prefetch("/auth/login/withEmail");
        router.prefetch("/auth/login/withPhoneNumber");
    }, []);

    return (
        <View style={gs.container}>
            <HomeIcon size={48} color={theme.primary} />
            <Text style={[styles.Title, { marginBottom: 64, color: theme.primary }]}>
                {t("title")}
            </Text>

            <Text style={[styles.Subtitle, { color: theme.text }]}>{t("subtitle")}</Text>
            <Text style={[gs.bodyText, { color: theme.accent, marginBottom: 32 }]}>
                {t("body")}
            </Text>
            <View style={{ width: "100%", gap: 6, marginVertical: 16 }}>
                <Button onPress={() => router.push("/auth/login/withEmail")}>
                    <BtnText> {t("continueWithEmail")}</BtnText>
                </Button>
                <Button
                    variante="outline"
                    onPress={() => router.push("/auth/login/withPhoneNumber")}
                >
                    <BtnText>{t("continueWithPhone")}</BtnText>
                </Button>
            </View>

            <Link
                href="/auth/register"
                style={{ color: theme.text, fontSize: 14, textAlign: "center" }}
            >
                {t("noAccount")}{" "}
                <Text style={{ color: theme.primary }}>{t("register")}</Text>
            </Link>

            <View
                style={{
                    width: "100%",
                    flexDirection: "row",
                    gap: 8,
                    alignItems: "center",
                    marginVertical: 16,
                }}
            >
                <View
                    style={{
                        flex: 1,
                        height: 1,
                        backgroundColor: theme.accent + "4D",
                        marginVertical: 16,
                    }}
                />
                <Text style={{ fontSize: 12, textAlign: "center", color: theme.accent }}>
                    {t("orLoginWith")}
                </Text>
                <View
                    style={{
                        flex: 1,
                        height: 1,
                        backgroundColor: theme.accent + "4D",
                        marginVertical: 16,
                    }}
                />
            </View>

            <View
                style={{
                    width: "100%",
                    gap: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    marginVertical: 16,
                }}
            >
                <Button
                    variante="outline"
                    style={{ flex: 1, width: "100%", borderColor: theme.base + "4D" }}
                    onPress={() => alert("Login button pressed")}
                >
                    <Image
                        source={require("@/assets/google.png")}
                        style={{ width: 20, height: 20, marginRight: 8 }}
                        placeholder={
                            "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj["
                        }
                        transition={1000}
                    />
                    <BtnText style={{ color: theme.text }}>Google</BtnText>
                </Button>
                <Button
                    variante="outline"
                    style={{ flex: 1, width: "100%", borderColor: theme.base + "4D" }}
                    onPress={() => alert("Login button pressed")}
                >
                    {useColorScheme() === "light" ? (
                        <Image
                            source={require("@/assets/apple_dark.png")}
                            style={{ width: 20, height: 20, marginRight: 8 }}
                            placeholder={
                                "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj["
                            }
                            transition={1000}
                        />
                    ) : (
                        <Image
                            source={require("@/assets/apple_light.png")}
                            style={{ width: 20, height: 20, marginRight: 8 }}
                            placeholder={
                                "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj["
                            }
                            transition={1000}
                        />
                    )}
                    <BtnText style={{ color: theme.text }}>Apple</BtnText>
                </Button>
            </View>

            <View>
                <Text style={{ fontSize: 12, textAlign: "center", color: theme.text }}>
                    {t("terms")}{" "}
                    <Link
                        href={"/legal/termsOfService"}
                        style={{ color: theme.primary }}
                        onPress={() => alert("Terms of Service")}
                    >
                        {t("termsOfService")}
                    </Link>{" "}
                    {t("and")}{" "}
                    <Link
                        href={"/legal/privacyPolicy"}
                        style={{ color: theme.primary }}
                        onPress={() => alert("Privacy Policy")}
                    >
                        {t("privacyPolicy")}
                    </Link>
                    .
                </Text>
            </View>
        </View>
    );
}

const makeStyles = (theme: Theme) =>
    StyleSheet.create({
        Title: { fontSize: 36, fontWeight: "bold", color: theme.text },
        Subtitle: { fontSize: 32, fontWeight: "bold", color: theme.text },
    });
