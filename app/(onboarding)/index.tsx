import { createT } from "@/i18n";
import { BtnText, Button } from "@/components/button";
import { useTheme } from "@/lib/theme/context";
import { get, store } from "@/utils/store";
import { Image } from "expo-image";
import * as Notifications from "expo-notifications";
import { Redirect } from "expo-router";
import { Bell, Heart, Zap } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

const t = createT("onboarding");

const MAX_PAGE = 3;

export default function OnboardingScreen() {
    const { theme } = useTheme();
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [onBoardingCompleted, setOnboardingCompleted] = useState<boolean>(false);

    useEffect(() => {
        async function check() {
            try {
                const completed = (await get("onboardingCompleted")) as boolean | null;
                setOnboardingCompleted(completed ?? false);
            } finally {
                setLoading(false);
            }
        }
        check();
    }, []);

    async function continueToApp() {
        if (currentPage === 1) {
            await Notifications.requestPermissionsAsync();
            setCurrentPage(2);
            return;
        }
        if (currentPage === MAX_PAGE - 1) {
            await store("onboardingCompleted", true);
            setOnboardingCompleted(true);
            const expoPushToken = await Notifications.getExpoPushTokenAsync();
            await store("expo-push-token", expoPushToken.data);
            return;
        }
        setCurrentPage(currentPage + 1);
    }

    if (loading) return null;
    if (onBoardingCompleted) return <Redirect href={"/(protected)/(tabs)"} />;

    return (
        <View style={{ flex: 1, backgroundColor: theme.background }}>
            <View
                style={{ position: "absolute", top: 0, left: 0, right: 0, height: "75%" }}
            >
                <Image
                    source={require("@/assets/images/onboarding.jpg")}
                    contentFit="cover"
                    style={{ width: "100%", height: "100%" }}
                />
            </View>

            <View style={{ flex: 1 }} />

            <View
                style={{
                    backgroundColor: theme.background,
                    borderTopLeftRadius: 32,
                    borderTopRightRadius: 32,
                    paddingHorizontal: 28,
                    paddingTop: 28,
                    paddingBottom: 40,
                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        marginBottom: 24,
                        gap: 6,
                    }}
                >
                    {Array.from({ length: MAX_PAGE }).map((_, i) => (
                        <View
                            key={i}
                            style={{
                                height: 6,
                                width: i === currentPage ? 20 : 6,
                                borderRadius: 3,
                                backgroundColor:
                                    i === currentPage ? theme.primary : theme.text + "33",
                            }}
                        />
                    ))}
                </View>

                {currentPage === 0 && (
                    <>
                        <Text
                            style={{
                                fontSize: 36,
                                fontWeight: "800",
                                color: theme.text,
                                letterSpacing: -0.5,
                                lineHeight: 42,
                            }}
                        >
                            {t("page0.title")}
                        </Text>
                        <Text
                            style={{
                                marginTop: 12,
                                fontSize: 15,
                                color: theme.text,
                                opacity: 0.5,
                                lineHeight: 22,
                            }}
                        >
                            {t("page0.subtitle")}
                        </Text>
                        <View style={{ height: 32 }} />
                        <Button onPress={continueToApp}>
                            <BtnText>{t("page0.cta")}</BtnText>
                        </Button>
                    </>
                )}

                {currentPage === 1 && (
                    <>
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                backgroundColor: theme.card,
                                borderRadius: 16,
                                padding: 14,
                                marginBottom: 24,
                                gap: 12,
                            }}
                        >
                            <View
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    backgroundColor: theme.primary + "22",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Bell size={20} color={theme.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text
                                    style={{
                                        fontWeight: "600",
                                        color: theme.text,
                                        fontSize: 14,
                                    }}
                                >
                                    {t("page1.notificationTitle")}
                                </Text>
                                <Text
                                    style={{
                                        color: theme.text,
                                        opacity: 0.5,
                                        fontSize: 13,
                                        marginTop: 2,
                                    }}
                                >
                                    {t("page1.notificationSubtitle")}
                                </Text>
                            </View>
                        </View>

                        <Text
                            style={{
                                fontSize: 30,
                                fontWeight: "800",
                                color: theme.text,
                                letterSpacing: -0.5,
                                lineHeight: 36,
                            }}
                        >
                            {t("page1.title")}
                        </Text>
                        <Text
                            style={{
                                marginTop: 12,
                                fontSize: 15,
                                color: theme.text,
                                opacity: 0.5,
                                lineHeight: 22,
                            }}
                        >
                            {t("page1.subtitle")}
                        </Text>

                        <View style={{ height: 24 }} />
                        <Button onPress={continueToApp}>
                            <BtnText>{t("page1.enable")}</BtnText>
                        </Button>
                        <Button
                            variante="outline"
                            style={{ marginTop: 10 }}
                            onPress={() => setCurrentPage(2)}
                        >
                            <BtnText style={{ color: theme.primary }}>
                                {t("page1.notNow")}
                            </BtnText>
                        </Button>
                    </>
                )}

                {currentPage === 2 && (
                    <>
                        <View style={{ flexDirection: "row", gap: 8, marginBottom: 24 }}>
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 6,
                                    backgroundColor: theme.primary + "18",
                                    paddingHorizontal: 12,
                                    paddingVertical: 6,
                                    borderRadius: 20,
                                }}
                            >
                                <Zap size={14} color={theme.primary} />
                                <Text
                                    style={{
                                        color: theme.primary,
                                        fontSize: 13,
                                        fontWeight: "600",
                                    }}
                                >
                                    {t("page2.realConnections")}
                                </Text>
                            </View>
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 6,
                                    backgroundColor: theme.primary + "18",
                                    paddingHorizontal: 12,
                                    paddingVertical: 6,
                                    borderRadius: 20,
                                }}
                            >
                                <Heart size={14} color={theme.primary} />
                                <Text
                                    style={{
                                        color: theme.primary,
                                        fontSize: 13,
                                        fontWeight: "600",
                                    }}
                                >
                                    {t("page2.noGhosting")}
                                </Text>
                            </View>
                        </View>

                        <Text
                            style={{
                                fontSize: 30,
                                fontWeight: "800",
                                color: theme.text,
                                letterSpacing: -0.5,
                                lineHeight: 36,
                            }}
                        >
                            {t("page2.title")}
                        </Text>
                        <Text
                            style={{
                                marginTop: 12,
                                fontSize: 15,
                                color: theme.text,
                                opacity: 0.5,
                                lineHeight: 22,
                            }}
                        >
                            {t("page2.subtitle")}
                        </Text>

                        <View style={{ height: 24 }} />
                        <Button onPress={continueToApp}>
                            <BtnText>{t("page2.cta")}</BtnText>
                        </Button>
                        <Button
                            variante="outline"
                            style={{ marginTop: 10 }}
                            onPress={() => setCurrentPage(currentPage - 1)}
                        >
                            <BtnText style={{ color: theme.primary }}>
                                {t("page2.back")}
                            </BtnText>
                        </Button>
                    </>
                )}
            </View>
        </View>
    );
}
