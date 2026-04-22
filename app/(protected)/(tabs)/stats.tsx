// Made with the help of Claude.ai and ChatGPT

import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "@/lib/theme/context";
import { Check, Clock, Flame, Heart, Snowflake } from "lucide-react-native";

const DAYS = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
const TODAY_INDEX = 4;
const FREEZE_INDEX = 1;
const LINE_START = 2;
const LINE_END = 4;
const SINGLE_DONE = [0];

const HOUR_LABELS = ["6", "9", "12", "15", "18", "21", "24"];
const BAR_VALUES = [12, 22, 38, 28, 52, 90, 35];
const PEAK_INDEX = 5;

const DAYS_LEN = 7;

export default function Index() {
    const router = useRouter();
    const { theme } = useTheme();
    const s = makeStyles(theme);
    const maxBar = Math.max(...BAR_VALUES);

    return (
        <View style={s.root}>
            {/* ── Premium Banner ── */}
            <TouchableOpacity
                style={s.premiumBanner}
                onPress={() => router.push("/analytics/premium")}
                activeOpacity={0.8}
            >
                <View style={s.premiumTextCol}>
                    <Text style={s.premiumEyebrow}>PREMIUM</Text>
                    <Text style={s.premiumTitle}>Find your perfect match</Text>
                    <Text style={s.premiumSub}>
                        Exclusive insights · Unlimited features
                    </Text>
                </View>
                <View style={s.premiumBtn}>
                    <Text style={s.premiumBtnText}>Upgrade</Text>
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
                    <Text style={s.statLabel}>Mutual Interests</Text>
                    <Text style={[s.statValue, { color: theme.matchValue }]}>
                        64%{" "}
                        <Text style={[s.statUnit, { color: theme.matchValue }]}>
                            MATCH SCORE
                        </Text>
                    </Text>
                </View>
                <View style={s.statCard}>
                    <View
                        style={[s.statIconCircle, { backgroundColor: theme.waitColor }]}
                    >
                        <Clock color={theme.white} size={18} />
                    </View>
                    <Text style={s.statLabel}>Average waiting time</Text>
                    <Text style={[s.statValue, { color: theme.waitColor }]}>
                        6.32{" "}
                        <Text style={[s.statUnit, { color: theme.waitColor }]}>
                            SECONDS
                        </Text>
                    </Text>
                </View>
            </View>

            {/* ── Streak ── */}
            <View style={s.streakCard}>
                <View style={s.streakHeader}>
                    <Flame color={theme.primary} size={28} />
                    <View>
                        <Text style={s.streakTitle}>14 days streak</Text>
                        <Text style={s.streakSub}>Keep up!!! You are on fire today.</Text>
                    </View>
                </View>

                <View style={s.daysContainer}>
                    <View style={s.pillTrack} pointerEvents="none" />
                    <View style={s.daysRow}>
                        {DAYS.map((label, i) => {
                            const isFreeze = i === FREEZE_INDEX;
                            const isSingleDone = SINGLE_DONE.includes(i);
                            const isInLine = i >= LINE_START && i <= LINE_END;
                            const isToday = i === TODAY_INDEX;
                            const isInactive = !isFreeze && !isSingleDone && !isInLine;

                            let circleStyle: object[] = [s.dayCircle];
                            let IconComp = <Check size={14} color="#3b3a3b" />;

                            if (isSingleDone) {
                                circleStyle = [s.dayCircle, s.doneCircle];
                                IconComp = (
                                    <Check size={14} color={theme.primary + "CC"} />
                                );
                            } else if (isFreeze) {
                                circleStyle = [s.dayCircle, s.freezeCircle];
                                IconComp = (
                                    <Snowflake size={14} color={theme.freezeColor} />
                                );
                            } else if (isToday) {
                                circleStyle = [s.dayCircle, s.todayCircle];
                                IconComp = <Check size={14} color={theme.white} />;
                            } else if (isInLine) {
                                circleStyle = [s.dayCircle, s.lineCircle];
                                IconComp = (
                                    <Check size={14} color={theme.primary + "99"} />
                                );
                            }

                            return (
                                <View key={i} style={s.dayWrapper}>
                                    <View style={circleStyle}>
                                        {!isInactive && IconComp}
                                    </View>
                                    <Text
                                        style={[
                                            s.dayLabel,
                                            isToday && { color: theme.primary },
                                            isFreeze && { color: theme.freezeColor },
                                        ]}
                                    >
                                        {label}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                </View>
            </View>

            {/* ── Best Time to be Online ── */}
            <View style={s.chartCard}>
                <Text style={s.sectionTitle}>Best time to be online</Text>
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
                <Text style={s.chartNote}>
                    Activity peaks between 8 PM and 10 PM in your area.
                </Text>
            </View>

            {/* ── Top Match Interests ── */}
            <View style={s.interestsCard}>
                <Text style={s.sectionTitle}>Top Match Interests</Text>
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
        </View>
    );
}

const makeStyles = (theme: any) =>
    StyleSheet.create({
        root: {
            flex: 1,
            backgroundColor: theme.rootBg,
            paddingHorizontal: 14,
            paddingTop: 18,
            paddingBottom: 10,
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
        statLabel: { color: "#aaa", fontSize: 12, lineHeight: 16 },
        statValue: { fontWeight: "800", fontSize: 20 },
        statUnit: { fontWeight: "600", fontSize: 11 },

        streakCard: {
            backgroundColor: theme.cardBg,
            borderRadius: 14,
            padding: 14,
            gap: 12,
        },
        streakHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
        streakTitle: { color: theme.text, fontWeight: "800", fontSize: 17 },
        streakSub: { color: "#aaa", fontSize: 12 },

        daysContainer: { position: "relative" },

        pillTrack: {
            position: "absolute",
            top: 0,
            left: `${(LINE_START / DAYS_LEN) * 105}%` as any,
            width: `${((LINE_END - LINE_START + 1) / DAYS_LEN) * 90}%` as any,
            height: 34,
            backgroundColor: theme.primary + "22",
            borderRadius: 17,
            zIndex: 0,
        },

        daysRow: { flexDirection: "row", justifyContent: "space-between", zIndex: 1 },
        dayWrapper: { alignItems: "center", gap: 4, flex: 1 },

        dayCircle: {
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: theme.circleBg,
            alignItems: "center",
            justifyContent: "center",
        },
        doneCircle: {
            backgroundColor: theme.primary + "22",
            borderWidth: 1.5,
            borderColor: theme.primary + "55",
        },
        todayCircle: { backgroundColor: theme.primary },
        freezeCircle: {
            backgroundColor: theme.freezeColor + "22",
            borderWidth: 1.5,
            borderColor: theme.freezeColor + "66",
        },
        lineCircle: { backgroundColor: "transparent" },

        dayLabel: { color: "#555", fontSize: 10 },

        chartCard: {
            backgroundColor: theme.cardBg,
            borderRadius: 14,
            padding: 14,
            gap: 8,
            flex: 1,
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
        barLabel: { color: "#555", fontSize: 9 },
        chartNote: { color: "#666", fontSize: 11, lineHeight: 15, marginTop: 2 },

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
