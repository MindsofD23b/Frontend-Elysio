import { useTheme } from "@/lib/theme/context";
import { BtnText, Button } from "@/components/button";
import { Link, router } from "expo-router";
import { HomeIcon } from "lucide-react-native";
import {
    StyleSheet,
    Text,
    View,
    useColorScheme,
    Platform,
    Pressable,
} from "react-native";
import { Image } from "expo-image";
import { Theme } from "@/lib/theme/theme";
import { createT } from "@/i18n";
import { useAppleAuth } from "@/hooks/useAppleAuth";
import * as WebBrowser from "expo-web-browser";
import { BROWSER_OPTS } from "@/lib/web/browserConfig";

export default function Login() {
    const { gs, theme } = useTheme();
    const styles = makeStyles(theme);
    const colorScheme = useColorScheme();
    const t = createT("auth.login");

    const { signInWithApple, loading: appleLoading, error: appleError } = useAppleAuth();

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
                <Button onPress={() => router.push("/(auth)/login/withEmail")}>
                    <BtnText>{t("continueWithEmail")}</BtnText>
                </Button>
                <Button
                    variante="outline"
                    onPress={() => router.push("/(auth)/login/withPhoneNumber")}
                >
                    <BtnText>{t("continueWithPhone")}</BtnText>
                </Button>
            </View>

            <Link
                href="/(auth)/register"
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
                    <BtnText style={{ color: theme.text }}>{t("google")}</BtnText>
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

            {appleError && (
                <Text
                    style={{
                        fontSize: 12,
                        textAlign: "center",
                        color: "red",
                        marginTop: 8,
                    }}
                >
                    {appleError.message}
                </Text>
            )}

            <View>
                <Text style={{ fontSize: 12, textAlign: "center", color: theme.text }}>
                    {t("continuingWith")}{" "}
                    <Pressable
                        onPress={() => {
                            WebBrowser.openBrowserAsync(
                                "https://mindsofd23b.github.io/Landing-Elysio/termsandconditions/",
                                BROWSER_OPTS(theme),
                            );
                        }}
                    >
                        <Text style={{ color: theme.primary }}>
                            {t("termsOfService")}
                        </Text>
                    </Pressable>{" "}
                    {t("and")}{" "}
                    <Pressable
                        onPress={() => {
                            WebBrowser.openBrowserAsync(
                                "https://mindsofd23b.github.io/Landing-Elysio/privacypolicy/",
                                BROWSER_OPTS(theme),
                            );
                        }}
                    >
                        <Text style={{ color: theme.primary }}>{t("privacyPolicy")}</Text>
                    </Pressable>
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
