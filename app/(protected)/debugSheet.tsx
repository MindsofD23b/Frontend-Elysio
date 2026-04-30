import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useDebugCtx } from "@/components/debug/DebugContext";

export default function DebugSheet() {
    const ctx = useDebugCtx();
    const [tab, setTab] = useState<"data" | "actions" | "logs">("data");

    if (!__DEV__ || !ctx) return null;

    const { sections, logs, actions } = ctx;

    const TABS: { key: "data" | "actions" | "logs"; label: string }[] = [
        { key: "data", label: "Data" },
        { key: "actions", label: "Actions" },
        { key: "logs", label: `Logs${logs.length > 0 ? ` (${logs.length})` : ""}` },
    ];

    return (
        <View style={s.root}>
            <View style={s.header}>
                <Text style={s.title}>Debug</Text>
                <Text style={s.subtitle}>Development only</Text>
            </View>

            <View style={s.tabBar}>
                {TABS.map((t) => (
                    <TouchableOpacity
                        key={t.key}
                        style={[s.tab, tab === t.key && s.tabActive]}
                        onPress={() => setTab(t.key)}
                    >
                        <Text style={[s.tabTxt, tab === t.key && s.tabTxtActive]}>
                            {t.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
                {tab === "data" &&
                    (sections.length === 0 ? (
                        <Text style={s.empty}>No sections registered.</Text>
                    ) : (
                        sections.map((section) => (
                            <View key={section.name} style={s.card}>
                                <Text style={s.sectionTitle}>{section.name}</Text>
                                {section.rows.map((r, i) => (
                                    <View
                                        key={i}
                                        style={[
                                            s.row,
                                            i === section.rows.length - 1 && s.rowLast,
                                        ]}
                                    >
                                        <Text style={s.label}>{r.label}</Text>
                                        <Text style={s.value} numberOfLines={1}>
                                            {r.value}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        ))
                    ))}

                {tab === "actions" &&
                    (actions.length === 0 ? (
                        <Text style={s.empty}>No actions registered.</Text>
                    ) : (
                        <View style={s.card}>
                            {actions.map((a, i) => (
                                <TouchableOpacity
                                    key={a.key}
                                    style={[
                                        s.actionRow,
                                        a.active && s.actionRowActive,
                                        i === actions.length - 1 && s.rowLast,
                                    ]}
                                    onPress={a.onPress}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        style={[
                                            s.actionLabel,
                                            a.active && s.actionLabelActive,
                                        ]}
                                    >
                                        {a.label}
                                    </Text>
                                    {a.active && <View style={s.activeDot} />}
                                </TouchableOpacity>
                            ))}
                        </View>
                    ))}

                {tab === "logs" &&
                    (logs.length === 0 ? (
                        <Text style={s.empty}>No logs yet.</Text>
                    ) : (
                        <View style={s.card}>
                            {logs.map((l, i) => (
                                <View
                                    key={i}
                                    style={[s.logRow, i === logs.length - 1 && s.rowLast]}
                                >
                                    <Text style={s.logMeta}>
                                        {l.ts}
                                        {"  "}
                                        <Text style={s.logSection}>{l.section}</Text>
                                    </Text>
                                    <Text style={s.logMsg}>{l.msg}</Text>
                                </View>
                            ))}
                        </View>
                    ))}
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    root: {
        flex: 1,
        flexDirection: "column",
        backgroundColor: "#141414",
        // Prevents Fabric from flattening this view, which would expose its children
        // directly to the FormSheet SafeAreaView and break the 2-subview constraint.
        overflow: "hidden",
    },

    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 14,
    },
    title: { color: "#EAE6E7", fontSize: 22, fontWeight: "700", letterSpacing: -0.3 },
    subtitle: { color: "#555", fontSize: 12, marginTop: 2 },

    tabBar: {
        flexDirection: "row",
        flexWrap: "nowrap",
        paddingHorizontal: 16,
        paddingBottom: 12,
        gap: 6,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#2a2a2a",
    },
    tab: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: "#222",
    },
    tabActive: { backgroundColor: "#ec136a" },
    tabTxt: { color: "#888", fontSize: 13, fontWeight: "500" },
    tabTxtActive: { color: "#fff", fontWeight: "600" },

    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 40, gap: 12 },

    card: {
        backgroundColor: "#1e1e1e",
        borderRadius: 14,
        overflow: "hidden",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "#2a2a2a",
    },
    sectionTitle: {
        color: "#888",
        fontSize: 11,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.8,
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 8,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: "#2a2a2a",
    },
    rowLast: { borderBottomWidth: 0 },
    label: { color: "#aaa", fontSize: 13, flex: 1 },
    value: {
        color: "#EAE6E7",
        fontSize: 13,
        fontWeight: "500",
        flex: 1,
        textAlign: "right",
    },

    actionRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: "#2a2a2a",
    },
    actionRowActive: { backgroundColor: "#ec136a18" },
    actionLabel: { color: "#EAE6E7", fontSize: 14 },
    actionLabelActive: { color: "#ec136a", fontWeight: "600" },
    activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#ec136a" },

    logRow: {
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: "#2a2a2a",
        gap: 2,
    },
    logMeta: { color: "#555", fontSize: 11 },
    logSection: { color: "#ec136a", fontSize: 11 },
    logMsg: { color: "#aaa", fontSize: 12 },

    empty: { color: "#444", fontSize: 13, textAlign: "center", marginTop: 40 },
});
