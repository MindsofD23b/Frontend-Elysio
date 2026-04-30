// Made with the help of Claude.ai and ChatGPT

import { createT } from "@/i18n";
import { router, useFocusEffect } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "@/lib/theme/context";
import { Check, Clock, Flame, Heart, Snowflake } from "lucide-react-native";
import { useSafeAreaControl } from "@/components/SafeArea";
import { useCallback } from "react";

const t = createT("stats");

const DAYS = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
const TODAY_INDEX = 4;
const FREEZE_INDEX = 1;
const LINE_START = 2;
const LINE_END = 4;
const SINGLE_DONE = [0];

const HOUR_LABELS = ["6", "9", "12", "15", "18", "21", "24"];
const BAR_VALUES = [12, 22, 38, 28, 52, 90, 35];
const PEAK_INDEX = 5;

export default function Index() {
    const { setDisabledEdges } = useSafeAreaControl();
    const { theme } = useTheme();
    const s = makeStyles(theme);
    const maxBar = Math.max(...BAR_VALUES);

    useFocusEffect(
        useCallback(() => {
            setDisabledEdges(["top"]);

            return () => {
                setDisabledEdges([]);
            };
        }, [setDisabledEdges]),
    );

    return (
        <ScrollView
            style={s.scroll}
            contentContainerStyle={s.root}
            showsVerticalScrollIndicator={false}
            alwaysBounceVertical
        >
            <TouchableOpacity
                style={s.premiumBanner}
                onPress={() => router.push("/(protected)/subscriptions")}
                activeOpacity={0.8}
            >
                <View style={s.premiumTextCol}>
                    <Text style={s.premiumEyebrow}>{t("premium")}</Text>
                    <Text style={s.premiumTitle}>{t("findYourMatch")}</Text>
                    <Text style={s.premiumSub}>{t("exclusiveInsights")}</Text>
                </View>
                <View style={s.premiumBtn}>
                    <Text style={s.premiumBtnText}>{t("upgrade")}</Text>
                </View>
            </TouchableOpacity>

            {/* ── Stats Row ── */}
            <View style={s.statsRow}>
                <View style={s.statCard}>
                    <View
                        style={[s.statIconCircle, { backgroundColor: theme.matchColor }]}
                    >
                        <Heart color={theme.white} size={18} />
                    </View>
                    <Text style={s.statLabel}>{t("mutualInterests")}</Text>
                    <Text style={[s.statValue, { color: theme.matchValue }]}>
                        64%{" "}
                        <Text style={[s.statUnit, { color: theme.matchValue }]}>
                            {t("matchScore")}
                        </Text>
                    </Text>
                </View>
                <View style={s.statCard}>
                    <View
                        style={[s.statIconCircle, { backgroundColor: theme.waitColor }]}
                    >
                        <Clock color={theme.white} size={18} />
                    </View>
                    <Text style={s.statLabel}>{t("averageWaitingTime")}</Text>
                    <Text style={[s.statValue, { color: theme.waitColor }]}>
                        6.32{" "}
                        <Text style={[s.statUnit, { color: theme.waitColor }]}>
                            {t("seconds")}
                        </Text>
                    </Text>
                </View>
            </View>

            {/* ── Streak ── */}
            <View style={s.streakCard}>
                {/* header row */}
                <View style={s.streakHeader}>
                    <View
                        style={[s.streakFlameCircle, { backgroundColor: theme.primary }]}
                    >
                        <Flame color="#fff" size={20} />
                    </View>
                    <View style={s.streakMeta}>
                        <View style={s.streakNumRow}>
                            <Text style={[s.streakBigNum, { color: theme.text }]}>
                                14
                            </Text>
                            <Text style={[s.streakDayWord, { color: theme.text + "55" }]}>
                                {" "}
                                {t("dayStreak")}
                            </Text>
                        </View>
                        <Text style={[s.streakQuote, { color: theme.text + "44" }]}>
                            {t("keepItUp")}
                        </Text>
                    </View>
                </View>

                {/* divider */}
                <View style={[s.streakDivider, { backgroundColor: theme.text + "0E" }]} />

                {/* week row */}
                <View style={s.daysRow}>
                    {DAYS.map((label, i) => {
                        const isFreeze = i === FREEZE_INDEX;
                        const isDone =
                            SINGLE_DONE.includes(i) ||
                            (i >= LINE_START && i <= LINE_END) ||
                            i === TODAY_INDEX;
                        const isToday = i === TODAY_INDEX;
                        const isFuture = !isDone && !isFreeze;

                        return (
                            <View key={i} style={s.dayWrapper}>
                                <View
                                    style={[
                                        s.dayCircle,
                                        isDone && { backgroundColor: theme.primary },
                                        isToday && {
                                            shadowColor: theme.primary,
                                            shadowOpacity: 0.45,
                                            shadowRadius: 10,
                                            elevation: 6,
                                        },
                                        isFreeze && {
                                            backgroundColor: "transparent",
                                            borderWidth: 2,
                                            borderColor: theme.freezeColor,
                                        },
                                        isFuture && {
                                            backgroundColor: "transparent",
                                            borderWidth: 2,
                                            borderColor: theme.text + "18",
                                        },
                                    ]}
                                >
                                    {isFreeze ? (
                                        <Snowflake
                                            size={13}
                                            color={theme.freezeColor}
                                            strokeWidth={2.5}
                                        />
                                    ) : isDone ? (
                                        <Check size={13} color="#fff" strokeWidth={3} />
                                    ) : null}
                                </View>
                                <Text
                                    style={[
                                        s.dayLabel,
                                        isDone && {
                                            color: theme.primary,
                                            fontWeight: "700",
                                        },
                                        isFreeze && {
                                            color: theme.freezeColor,
                                            fontWeight: "600",
                                        },
                                        isFuture && { color: theme.text + "28" },
                                    ]}
                                >
                                    {label}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            </View>

            {/* ── Best Time to be Online ── */}
            <View style={s.chartCard}>
                <Text style={s.sectionTitle}>{t("bestTimeOnline")}</Text>
                <View style={s.barsRow}>
                    {BAR_VALUES.map((val, i) => {
                        const isPeak = i === PEAK_INDEX;
                        const barH = Math.round((val / maxBar) * 90);
                        return (
                            <View key={i} style={s.barCol}>
                                <View
                                    style={[
                                        s.bar,
                                        {
                                            height: barH,
                                            backgroundColor: isPeak
                                                ? theme.primary + "CC"
                                                : theme.barInactive,
                                            shadowColor: isPeak
                                                ? theme.primary
                                                : "transparent",
                                            shadowOpacity: isPeak ? 0.5 : 0,
                                            shadowRadius: 8,
                                            elevation: isPeak ? 6 : 0,
                                        },
                                    ]}
                                />
                                <Text
                                    style={[
                                        s.barLabel,
                                        isPeak && { color: theme.primary },
                                    ]}
                                >
                                    {HOUR_LABELS[i]}
                                </Text>
                            </View>
                        );
                    })}
                </View>
                <Text style={s.chartNote}>{t("activityPeaks")}</Text>
            </View>

            {/* ── Top Match Interests ── */}
            <View style={s.interestsCard}>
                <Text style={s.sectionTitle}>{t("topMatchInterests")}</Text>
                <View style={s.tagsRow}>
                    {[
                        { label: "MUSIC", color: theme.interestMusic },
                        { label: "GAMING", color: theme.interestGaming },
                        { label: "TRAVEL", color: theme.interestTravel },
                    ].map((item, i) => (
                        <View key={i} style={[s.tag, { borderColor: item.color + "77" }]}>
                            <Text style={[s.tagText, { color: item.color }]}>
                                {item.label}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
}

const makeStyles = (theme: any) =>
    StyleSheet.create({
        scroll: {
            flex: 1,
            paddingTop: 48,
            backgroundColor: theme.rootBg,
        },
        root: {
            paddingHorizontal: 14,
            paddingTop: 18,
            paddingBottom: 24,
            gap: 10,
        },

        premiumBanner: {
            borderRadius: 16,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: theme.primary + "0A",
            borderWidth: 1,
            borderColor: theme.primary + "33",
        },
        premiumTextCol: { flex: 1, marginRight: 10 },
        premiumEyebrow: {
            fontSize: 9,
            fontWeight: "800",
            color: theme.primary,
            letterSpacing: 1.2,
            marginBottom: 3,
        },
        premiumTitle: {
            color: theme.text,
            fontWeight: "800",
            fontSize: 15,
            lineHeight: 20,
        },
        premiumSub: { color: theme.text + "55", fontSize: 11, marginTop: 4 },
        premiumBtn: {
            backgroundColor: theme.primary,
            borderRadius: 20,
            paddingVertical: 9,
            paddingHorizontal: 16,
        },
        premiumBtnText: {
            color: theme.white,
            fontWeight: "700",
            fontSize: 13,
            textAlign: "center",
        },

        statsRow: { flexDirection: "row", gap: 10 },
        statCard: {
            flex: 1,
            backgroundColor: theme.cardBg,
            borderRadius: 14,
            padding: 12,
            gap: 6,
        },
        statIconCircle: {
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: "center",
            justifyContent: "center",
        },
        statLabel: { color: theme.text + "AA", fontSize: 12, lineHeight: 16 },
        statValue: { fontWeight: "800", fontSize: 20 },
        statUnit: { fontWeight: "600", fontSize: 11 },

        streakCard: {
            backgroundColor: theme.cardBg,
            borderRadius: 16,
            paddingHorizontal: 14,
            paddingVertical: 14,
            gap: 12,
        },
        streakHeader: {
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
        },
        streakFlameCircle: {
            width: 44,
            height: 44,
            borderRadius: 22,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: theme.primary,
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5,
        },
        streakMeta: {
            flex: 1,
            gap: 2,
        },
        streakNumRow: {
            flexDirection: "row",
            alignItems: "baseline",
        },
        streakBigNum: {
            fontSize: 26,
            fontWeight: "900",
            letterSpacing: -0.5,
        },
        streakDayWord: {
            fontSize: 13,
            fontWeight: "600",
        },
        streakQuote: {
            fontSize: 11,
        },
        streakDivider: {
            height: 1,
        },

        daysRow: { flexDirection: "row", justifyContent: "space-between" },
        dayWrapper: { alignItems: "center", gap: 6, flex: 1 },

        dayCircle: {
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: "center",
            justifyContent: "center",
        },

        dayLabel: { fontSize: 10, fontWeight: "500", color: theme.text + "88" },

        chartCard: {
            backgroundColor: theme.cardBg,
            borderRadius: 14,
            padding: 14,
            gap: 8,
        },
        sectionTitle: {
            color: theme.text,
            fontWeight: "700",
            fontSize: 14,
            marginBottom: 2,
        },
        barsRow: { flexDirection: "row", alignItems: "flex-end", gap: 6, flex: 1 },
        barCol: { flex: 1, alignItems: "center", gap: 4, justifyContent: "flex-end" },
        bar: { width: "60%", borderRadius: 6 },
        barLabel: { color: theme.text + "99", fontSize: 9 },
        chartNote: {
            color: theme.text + "AA",
            fontSize: 11,
            lineHeight: 15,
            marginTop: 2,
        },

        interestsCard: {
            backgroundColor: theme.cardBg,
            borderRadius: 14,
            padding: 14,
            gap: 10,
        },
        tagsRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
        tag: {
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderRadius: 20,
            paddingHorizontal: 12,
            paddingVertical: 6,
            gap: 6,
        },
        tagText: { fontSize: 10, fontWeight: "700" },
    });
