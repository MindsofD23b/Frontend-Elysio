import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "@/lib/theme/context";
import { Check, Clock, Flame, Heart, Snowflake } from "lucide-react-native";

const DAYS = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
const TODAY_INDEX = 4; // FR
const FREEZE_INDEX = 1; // TU
const LINE_START = 2; // WE
const LINE_END = 4; // FR
const SINGLE_DONE = [0]; // MO

const HOUR_LABELS = ["6", "9", "12", "15", "18", "21", "24"];
const BAR_VALUES = [12, 22, 38, 28, 52, 90, 35];
const PEAK_INDEX = 5;

const INTERESTS = [
    { label: "MUSIC", color: "#fc8a92" },
    { label: "GAMING", color: "#c8a4ff" },
    { label: "TRAVEL", color: "#DA9AB4" },
];

const FREEZE_COLOR = "#6BBFDF";

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
                    <View style={[s.statIconCircle, { backgroundColor: "#7c72b0" }]}>
                        <Heart color={theme.white} size={18} />
                    </View>
                    <Text style={s.statLabel}>Mutual Interests</Text>
                    <Text style={[s.statValue, { color: "#9B8FDD" }]}>
                        64%{" "}
                        <Text style={[s.statUnit, { color: "#9B8FDD" }]}>
                            MATCH SCORE
                        </Text>
                    </Text>
                </View>
                <View style={s.statCard}>
                    <View style={[s.statIconCircle, { backgroundColor: "#d9430e" }]}>
                        <Clock color={theme.white} size={18} />
                    </View>
                    <Text style={s.statLabel}>Average waiting time</Text>
                    <Text style={[s.statValue, { color: "#d9430e" }]}>
                        6.32{" "}
                        <Text style={[s.statUnit, { color: "#d9430e" }]}>SECONDS</Text>
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

                {/* The pill line sits BEHIND the circles — absolute positioned */}
                <View style={s.daysContainer}>
                    {/* Background connector pill from LINE_START to LINE_END */}
                    <View style={s.pillTrack} pointerEvents="none" />

                    <View style={s.daysRow}>
                        {DAYS.map((label, i) => {
                            const isFreeze = i === FREEZE_INDEX;
                            const isSingleDone = SINGLE_DONE.includes(i);
                            const isInLine = i >= LINE_START && i <= LINE_END;
                            const isToday = i === TODAY_INDEX;
                            const isInactive = !isFreeze && !isSingleDone && !isInLine;

                            let circleStyle: object[] = [s.dayCircle];
                            let iconColor = "#3b3a3b";
                            let IconComp = <Check size={14} color={iconColor} />;

                            if (isSingleDone) {
                                circleStyle = [s.dayCircle, s.doneCircle];
                                IconComp = (
                                    <Check size={14} color={theme.primary + "CC"} />
                                );
                            } else if (isFreeze) {
                                circleStyle = [s.dayCircle, s.freezeCircle];
                                IconComp = <Snowflake size={14} color={FREEZE_COLOR} />;
                            } else if (isToday) {
                                circleStyle = [s.dayCircle, s.todayCircle];
                                IconComp = <Check size={14} color="#fff" />;
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
                                            isFreeze && { color: FREEZE_COLOR },
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
                                                : "#3A3A3A",
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
                    {INTERESTS.map((item, i) => (
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

const DAYS_LEN = 7;

const makeStyles = (theme: any) =>
    StyleSheet.create({
        root: {
            flex: 1,
            backgroundColor: "#141414",
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
            backgroundColor: "#EC136A0A",
            borderWidth: 1,
            borderColor: "#EC136A33",
        },
        premiumTextCol: {
            flex: 1,
            marginRight: 10,
        },
        premiumEyebrow: {
            fontSize: 9,
            fontWeight: "800",
            color: "#EC136A",
            letterSpacing: 1.2,
            marginBottom: 3,
        },
        premiumTitle: { color: "#fff", fontWeight: "800", fontSize: 15, lineHeight: 20 },
        premiumSub: { color: "#ffffff55", fontSize: 11, marginTop: 4 },
        premiumBtn: {
            backgroundColor: "#EC136A",
            borderRadius: 20,
            paddingVertical: 9,
            paddingHorizontal: 16,
        },
        premiumBtnText: {
            color: "#fff",
            fontWeight: "700",
            fontSize: 13,
            textAlign: "center",
        },

        statsRow: { flexDirection: "row", gap: 10 },
        statCard: {
            flex: 1,
            backgroundColor: "#1E1E1E",
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
            backgroundColor: "#1E1E1E",
            borderRadius: 14,
            padding: 14,
            gap: 12,
        },
        streakHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
        streakTitle: { color: "#fff", fontWeight: "800", fontSize: 17 },
        streakSub: { color: "#aaa", fontSize: 12 },

        // container holds pill track + days row together
        daysContainer: { position: "relative" },

        // connect pill
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

        daysRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            zIndex: 1,
        },
        dayWrapper: { alignItems: "center", gap: 4, flex: 1 },

        dayCircle: {
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: "#222",
            alignItems: "center",
            justifyContent: "center",
        },
        doneCircle: {
            backgroundColor: theme.primary + "22",
            borderWidth: 1.5,
            borderColor: theme.primary + "55",
        },
        todayCircle: {
            backgroundColor: theme.primary,
        },
        freezeCircle: {
            backgroundColor: FREEZE_COLOR + "22",
            borderWidth: 1.5,
            borderColor: FREEZE_COLOR + "66",
        },
        // circles that sit on the pill (WE, TH) — transparent so pill shows through
        lineCircle: {
            backgroundColor: "transparent",
        },

        dayLabel: { color: "#555", fontSize: 10 },

        chartCard: {
            backgroundColor: "#1E1E1E",
            borderRadius: 14,
            padding: 14,
            gap: 8,
            flex: 1,
        },
        sectionTitle: { color: "#fff", fontWeight: "700", fontSize: 14, marginBottom: 2 },
        barsRow: {
            flexDirection: "row",
            alignItems: "flex-end",
            gap: 6,
            flex: 1,
        },
        barCol: { flex: 1, alignItems: "center", gap: 4, justifyContent: "flex-end" },
        bar: { width: "99%", borderRadius: 6 },
        barLabel: { color: "#555", fontSize: 9 },
        chartNote: { color: "#666", fontSize: 11, lineHeight: 15, marginTop: 2 },

        interestsCard: {
            backgroundColor: "#1E1E1E",
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
