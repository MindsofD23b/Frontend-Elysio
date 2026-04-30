import { createT } from "@/i18n";
import { useTheme } from "@/lib/theme/context";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Clock, MapPin, Sparkles, Star, Zap } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const t = createT("favorites.ideaDetail");

const EFFORT_COLOR: Record<string, string> = {
    Low: "#4CAF50",
    Medium: "#FF9800",
    High: "#EC136A",
};

export default function IdeaDetail() {
    const { theme } = useTheme();
    const s = makeStyles(theme);
    const params = useLocalSearchParams<{
        title: string;
        location: string;
        price: string;
        effort: string;
        duration: string;
        vibe: string;
        isTopPick: string;
    }>();

    const effortColor = EFFORT_COLOR[params.effort] ?? theme.primary;

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={s.root}>
                {/* Header */}
                <View style={s.header}>
                    <Pressable style={s.backBtn} onPress={() => router.back()}>
                        <ChevronLeft size={28} color={theme.text} strokeWidth={2.5} />
                    </Pressable>
                    {params.isTopPick === "true" && (
                        <View style={s.topPickBadge}>
                            <Star size={11} color={theme.primary} fill={theme.primary} />
                            <Text style={[s.topPickText, { color: theme.primary }]}>
                                {t("topPick")}
                            </Text>
                        </View>
                    )}
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={s.scroll}
                >
                    {/* Price pill */}
                    <View style={s.pricePill}>
                        <Text style={s.priceText}>${params.price}</Text>
                    </View>

                    {/* Title */}
                    <Text style={s.title}>{params.title}</Text>

                    {/* Location */}
                    <View style={s.locationRow}>
                        <MapPin size={14} color={theme.text + "66"} strokeWidth={2} />
                        <Text style={s.locationText}>{params.location}</Text>
                    </View>

                    {/* Meta cards */}
                    <View style={s.metaRow}>
                        <View style={[s.metaCard, { borderColor: effortColor + "33" }]}>
                            <Zap size={18} color={effortColor} strokeWidth={2} />
                            <Text style={s.metaLabel}>{t("effort")}</Text>
                            <Text style={[s.metaValue, { color: effortColor }]}>
                                {params.effort}
                            </Text>
                        </View>
                        <View style={[s.metaCard, { borderColor: theme.primary + "33" }]}>
                            <Clock size={18} color={theme.primary} strokeWidth={2} />
                            <Text style={s.metaLabel}>{t("duration")}</Text>
                            <Text style={[s.metaValue, { color: theme.text }]}>
                                {params.duration}
                            </Text>
                        </View>
                        <View
                            style={[
                                s.metaCard,
                                { borderColor: theme.planPremium + "33" },
                            ]}
                        >
                            <Sparkles
                                size={18}
                                color={theme.planPremium}
                                strokeWidth={2}
                            />
                            <Text style={s.metaLabel}>{t("vibe")}</Text>
                            <Text style={[s.metaValue, { color: theme.planPremium }]}>
                                {params.vibe}
                            </Text>
                        </View>
                    </View>

                    {/* Tips section */}
                    <View style={s.section}>
                        <Text style={s.sectionTitle}>{t("whyThisWorks")}</Text>
                        <View style={s.tipCard}>
                            <Text style={s.tipText}>
                                {t("whyBody", {
                                    vibe: params.vibe.toLowerCase(),
                                    effort: params.effort,
                                })}
                            </Text>
                        </View>
                    </View>

                    <View style={s.section}>
                        <Text style={s.sectionTitle}>{t("keepInMind")}</Text>
                        <View style={s.tipCard}>
                            <Text style={s.tipText}>
                                {t("keepInMindBody", {
                                    price: params.price,
                                    duration: params.duration,
                                })}
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </>
    );
}

const makeStyles = (theme: any) =>
    StyleSheet.create({
        root: { flex: 1, backgroundColor: theme.rootBg ?? theme.background },
        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingTop: 56,
            paddingBottom: 8,
        },
        backBtn: { width: 44, height: 44, justifyContent: "center" },
        topPickBadge: {
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            backgroundColor: theme.primary + "18",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: theme.primary + "33",
        },
        topPickText: { fontSize: 10, fontWeight: "800", letterSpacing: 1 },
        scroll: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40, gap: 20 },
        pricePill: {
            alignSelf: "flex-start",
            backgroundColor: theme.primary,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 8,
        },
        priceText: { color: "#fff", fontWeight: "800", fontSize: 18 },
        title: {
            fontSize: 34,
            fontWeight: "900",
            color: theme.text,
            lineHeight: 38,
            letterSpacing: -0.5,
        },
        locationRow: { flexDirection: "row", alignItems: "center", gap: 6 },
        locationText: { color: theme.text + "66", fontSize: 13 },
        metaRow: { flexDirection: "row", gap: 10 },
        metaCard: {
            flex: 1,
            backgroundColor: theme.cardBg,
            borderRadius: 16,
            borderWidth: 1,
            padding: 12,
            alignItems: "center",
            gap: 6,
        },
        metaLabel: {
            color: theme.text + "55",
            fontSize: 9,
            fontWeight: "800",
            letterSpacing: 1,
        },
        metaValue: { fontSize: 13, fontWeight: "700", textAlign: "center" },
        section: { gap: 12 },
        sectionTitle: { color: theme.text, fontWeight: "900", fontSize: 17 },
        tipCard: {
            backgroundColor: theme.cardBg,
            borderRadius: 16,
            padding: 16,
        },
        tipText: { color: theme.text + "BB", fontSize: 15, lineHeight: 24 },
    });
