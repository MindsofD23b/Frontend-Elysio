import { Link, router } from "expo-router";
import { useTheme } from "@/app/theme/context";
import { BtnText, Button } from "@/components/button";
import { HomeIcon } from "lucide-react-native";
import { useEffect } from "react";
import { Image, StyleSheet, Text, useColorScheme, View } from "react-native";
import { Theme } from "@/app/theme/theme";

export default function Register() {
    const { gs, theme } = useTheme();
    const styles = makeStyles(theme);

    useEffect(() => {
        router.prefetch("/auth/login/withEmail");
        router.prefetch("/auth/login/withPhoneNumber");
    }, []);

    return (
        <View style={gs.container}>
            <HomeIcon size={48} color={theme.primary} />
            <Text style={[styles.Title, { marginBottom: 64, color: theme.primary }]}>Elysio</Text>

            <Text style={[styles.Subtitle, { color: theme.text }]}>Login to continue</Text>
            <Text style={[gs.bodyText, { color: theme.accent, marginBottom: 32 }]}>Welcome back! Please login to your account.</Text>
            <View style={{ width: "100%", gap: 6, marginVertical: 16 }}>
                <Button onPress={() => router.push("/auth/login/withEmail")} >
                    <BtnText>Continue with Email</BtnText>
                </Button>
                <Button variante="outline" onPress={() => router.push("/auth/login/withPhoneNumber")}>
                    <BtnText>Continue with Phone Number</BtnText>
                </Button>
            </View>

            <Link href="/auth/register" style={{ color: theme.text, fontSize: 14, textAlign: "center" }}>
                Don{"'"}t have an account?{" "}<Text style={{ color: theme.primary }}>Register</Text>
            </Link>

            <View style={{ width: "100%", flexDirection: "row", gap: 8, alignItems: "center", marginVertical: 16 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: theme.accent + "4D", marginVertical: 16 }} />
                <Text style={{ fontSize: 12, textAlign: "center", color: theme.accent }}>
                    Or Login with
                </Text>
                <View style={{ flex: 1, height: 1, backgroundColor: theme.accent + "4D", marginVertical: 16 }} />
            </View>

            <View style={{ width: "100%", gap: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", marginVertical: 16 }}>
                <Button
                    variante="outline"
                    style={{ flex: 1, width: "100%", borderColor: theme.base + "4D" }}
                    onPress={() => alert("Login button pressed")}
                >
                    <Image
                        source={require("@/assets/google.png")}
                        style={{ width: 20, height: 20, marginRight: 8 }}
                    />
                    <BtnText style={{ color: theme.text }}>Google</BtnText>
                </Button>
                <Button
                    variante="outline"
                    style={{ flex: 1, width: "100%", borderColor: theme.base + "4D" }}
                    onPress={() => alert("Login button pressed")}
                >
                    {
                        useColorScheme() === "light" ? (
                            <Image
                                source={require("@/assets/apple_dark.png")}
                                style={{ width: 20, height: 20, marginRight: 8 }}
                            />
                        ) : (
                            <Image
                                source={require("@/assets/apple_light.png")}
                                style={{ width: 20, height: 20, marginRight: 8 }}
                            />
                        )
                    }
                    <BtnText style={{ color: theme.text }}>Apple</BtnText>
                </Button>
            </View>

            <View>
                <Text style={{ fontSize: 12, textAlign: "center", color: theme.text }}>
                    By continuing, you agree to our
                    {" "}
                    <Link href={'/legal/termsOfService'} style={{ color: theme.primary }} onPress={() => alert("Terms of Service")}>
                        Terms of Service
                    </Link>
                    {" and "}
                    <Link href={'/legal/privacyPolicy'} style={{ color: theme.primary }} onPress={() => alert("Privacy Policy")}>
                        Privacy Policy
                    </Link>
                    .
                </Text>
            </View>
        </View >
    );
}


const makeStyles = (theme: Theme) => StyleSheet.create({
    Title: { fontSize: 36, fontWeight: "bold", color: theme.text },
    Subtitle: { fontSize: 32, fontWeight: "bold", color: theme.text },
});