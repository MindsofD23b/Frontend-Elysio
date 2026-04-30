import { Link, router } from "expo-router";
import { useTheme } from "@/lib/theme/context";
import { BtnText, Button } from "@/components/button";
import { HomeIcon } from "lucide-react-native";
import { Platform, StyleSheet, Text, useColorScheme, View } from "react-native";
import { Image } from "expo-image";
import { Theme } from "@/lib/theme/theme";
import { createT } from "@/i18n";
import { useAppleAuth } from "@/hooks/useAppleAuth";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

const t = createT("auth.register");

export default function Register() {
    const { gs, theme } = useTheme();
    const styles = makeStyles(theme);
    const colorScheme = useColorScheme();
    const { signInWithApple, loading: appleLoading, error: appleError } = useAppleAuth();
    const {
        signInWithGoogle,
        loading: googleLoading,
        error: googleError,
        ready: googleReady,
    } = useGoogleAuth();

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
            <View style={{ width: "100%", marginVertical: 16, marginTop: 8 }}>
                <Button
                    style={{ marginVertical: 16 }}
                    onPress={() => router.push("/(auth)/register/withEmail")}
                >
                    <BtnText>{t("continueWithEmail")}</BtnText>
                </Button>
            </View>

            <Link
                href="/(auth)/login"
                style={{ color: theme.text, fontSize: 14, textAlign: "center" }}
            >
                {t("alreadyHaveAccount")}{" "}
                <Text style={{ color: theme.primary }}>{t("account")}</Text>
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
                    onPress={signInWithGoogle}
                    disabled={googleLoading || !googleReady}
                >
                    <Image
                        source={require("@/assets/google.png")}
                        style={{ width: 20, height: 20, marginRight: 8 }}
                        placeholder={
                            "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj["
                        }
                        transition={1000}
                    />
                    <BtnText style={{ color: theme.text }}>
                        {googleLoading ? t("loading") : t("google")}
                    </BtnText>
                </Button>
                <Button
                    variante="outline"
                    style={{ flex: 1, width: "100%", borderColor: theme.base + "4D" }}
                    onPress={signInWithApple}
                    disabled={appleLoading || Platform.OS !== "ios"}
                >
                    {colorScheme === "light" ? (
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
                    <BtnText style={{ color: theme.text }}>
                        {appleLoading ? t("loading") : t("apple")}
                    </BtnText>
                </Button>
            </View>

            {(appleError || googleError) && (
                <Text
                    style={{
                        fontSize: 12,
                        textAlign: "center",
                        color: "red",
                        marginTop: 8,
                    }}
                >
                    {appleError?.message ?? googleError?.message}
                </Text>
            )}

            <View>
                {/* <Text style={{ fontSize: 12, textAlign: "center", color: theme.text }}>
                    By continuing, you agree to our{" "}
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
                </Text> */}
            </View>
        </View>
    );
}

const makeStyles = (theme: Theme) =>
    StyleSheet.create({
        Title: { fontSize: 36, fontWeight: "bold", color: theme.text },
        Subtitle: { fontSize: 32, fontWeight: "bold", color: theme.text },
    });
