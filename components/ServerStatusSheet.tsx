import { AlertTriangle, CheckCircle2 } from "lucide-react-native";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export const ACCENT = "#d97706";

// ─── Types ───────────────────────────────────────────────────────────────────

export type DetailItem = {
    icon: React.ReactNode;
    title: string;
    description: string;
};

export type StatusItem = {
    icon: React.ReactNode;
    label: string;
    works: boolean;
};

export type StatusSection = {
    title: string;
    items: StatusItem[];
};

export type DetailSection = {
    title: string;
    items: DetailItem[];
};

// ─── RecheckPill ─────────────────────────────────────────────────────────────

export function RecheckPill({ seconds }: { seconds: number }) {
    return (
        <View style={styles.pillRow}>
            <View style={[styles.pill]}>
                <ActivityIndicator size="small" color={ACCENT} />
                <Text style={[styles.pillText, { color: ACCENT }]}>
                    Rechecking in {seconds}s
                </Text>
            </View>
        </View>
    );
}

// ─── AlertBanner ─────────────────────────────────────────────────────────────

export function AlertBanner({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <View
            style={[
                styles.banner,
                { borderColor: ACCENT + "40", backgroundColor: ACCENT + "15" },
            ]}
        >
            <AlertTriangle size={18} color={ACCENT} style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
                <Text style={[styles.bannerTitle, { color: ACCENT }]}>{title}</Text>
                <Text style={[styles.bannerSub, { color: ACCENT }]}>{subtitle}</Text>
            </View>
        </View>
    );
}

// ─── SectionHeader ───────────────────────────────────────────────────────────

export function SectionHeader({ title }: { title: string }) {
    return <Text style={styles.sectionHeader}>{title}</Text>;
}

// ─── DetailCard ──────────────────────────────────────────────────────────────

export function DetailCard({ items }: { items: DetailItem[] }) {
    return (
        <View style={styles.card}>
            {items.map((item, i) => (
                <DetailRow key={i} {...item} last={i === items.length - 1} />
            ))}
        </View>
    );
}

function DetailRow({ icon, title, description, last }: DetailItem & { last: boolean }) {
    return (
        <View style={[styles.row, !last && styles.rowDivider]}>
            <View style={styles.rowIcon}>{icon}</View>
            <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{title}</Text>
                <Text style={styles.rowDesc}>{description}</Text>
            </View>
        </View>
    );
}

// ─── StatusCard ──────────────────────────────────────────────────────────────

export function StatusCard({ items }: { items: StatusItem[] }) {
    return (
        <View style={styles.card}>
            {items.map((item, i) => (
                <StatusRow key={i} {...item} last={i === items.length - 1} />
            ))}
        </View>
    );
}

function StatusRow({ icon, label, works, last }: StatusItem & { last: boolean }) {
    return (
        <View style={[styles.row, !last && styles.rowDivider]}>
            <View style={styles.rowIcon}>{icon}</View>
            <Text style={[styles.rowTitle, { flex: 1 }]}>{label}</Text>
            {works ? (
                <CheckCircle2 size={18} color="#22c55e" fill="#22c55e" />
            ) : (
                <AlertTriangle size={18} color={ACCENT} />
            )}
        </View>
    );
}

// ─── SheetHeader ─────────────────────────────────────────────────────────────

export function SheetHeader({
    icon,
    title,
    right,
}: {
    icon: React.ReactNode;
    title: string;
    right?: React.ReactNode;
}) {
    return (
        <View style={styles.header}>
            <View style={styles.headerIcon}>{icon}</View>
            <Text style={styles.headerTitle}>{title}</Text>
            {right}
        </View>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    pillRow: {
        alignItems: "center",
        marginBottom: 16,
    },
    pill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: ACCENT + "30",
    },
    pillText: {
        fontSize: 13,
        fontWeight: "500",
    },
    banner: {
        flexDirection: "row",
        gap: 10,
        alignItems: "flex-start",
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        marginBottom: 24,
    },
    bannerTitle: {
        fontWeight: "600",
        fontSize: 14,
        marginBottom: 2,
    },
    bannerSub: {
        fontSize: 13,
        opacity: 0.75,
    },
    sectionHeader: {
        fontSize: 14,
        color: "rgba(100,100,100,0.9)",
        marginBottom: 8,
        marginLeft: 2,
        fontWeight: "400",
    },
    card: {
        backgroundColor: "rgba(255,255,255,0.6)",
        borderRadius: 16,
        marginBottom: 24,
        overflow: "hidden",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 14,
    },
    rowDivider: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "rgba(0,0,0,0.08)",
    },
    rowIcon: {
        width: 28,
        alignItems: "center",
    },
    rowTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1a1a1a",
        marginBottom: 1,
    },
    rowDesc: {
        fontSize: 13,
        color: "#555",
        lineHeight: 18,
        marginTop: 2,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        paddingHorizontal: 4,
    },
    headerIcon: {
        width: 36,
        height: 36,
        borderRadius: 999,
        backgroundColor: ACCENT + "20",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        flex: 1,
        marginLeft: 10,
        fontSize: 17,
        fontWeight: "700",
        color: "#1a1a1a",
    },
});
