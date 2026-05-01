// Made with the help of Claude.ai and ChatGPT

import { createT } from "@/i18n";
import { useTheme } from "@/lib/theme/context";
import { Link, useLocalSearchParams } from "expo-router";
import {
    Sparkles,
    Brain,
    CheckCircle,
    AlertTriangle,
    User,
    BookOpen,
    Crosshair,
    Star,
    Zap,
    LucideIcon,
} from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { TIP_CONTENT } from "@/lib/favorites/tips";
import BackWrapper from "@/components/backwrapper";
import { Theme } from "@/lib/theme/theme";

const t = createT("favorites.tipDetail");

// ─── Tag pill component ────────────────────────────────────────────────────
function TagPill({ tag, accentColor }: { tag?: string; accentColor: string }) {
    if (!tag || tag === "both") return null;

    const tagMap: Record<string, { label: string; icon: LucideIcon; color: string }> = {
        mindset: { label: "Mindset", icon: Brain, color: accentColor },
        action: { label: "Try this", icon: CheckCircle, color: "#22C55E" },
        avoid: { label: "Watch out", icon: AlertTriangle, color: "#EAB308" },
        him: { label: "For him", icon: User, color: "#818CF8" },
        her: { label: "For her", icon: User, color: "#F472B6" },
    };

    const info = tagMap[tag];
    if (!info) return null;

    const TagIcon = info.icon;

    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                alignSelf: "flex-start",
                gap: 4,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 20,
                backgroundColor: info.color + "18",
                marginBottom: 6,
            }}
        >
            <TagIcon size={11} color={info.color} strokeWidth={2.5} />
            <Text
                style={{
                    fontSize: 11,
                    fontWeight: "700",
                    color: info.color,
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                }}
            >
                {info.label}
            </Text>
        </View>
    );
}

// ─── Section Card ──────────────────────────────────────────────────────────
function SectionCard({
    heading,
    text,
    icon: Icon,
    tag,
    accentColor,
    theme,
}: {
    heading: string;
    text: string;
    icon: any;
    tag?: string;
    accentColor: string;
    theme: Theme;
}) {
    return (
        <View
            style={{
                backgroundColor: theme.cardBg,
                borderRadius: 16,
                padding: 16,
                gap: 10,
            }}
        >
            <TagPill tag={tag} accentColor={accentColor} />

            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
                <View
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        backgroundColor: accentColor + "18",
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: 1,
                        flexShrink: 0,
                    }}
                >
                    <Icon size={18} color={accentColor} strokeWidth={2} />
                </View>

                <View style={{ flex: 1, gap: 4 }}>
                    <Text
                        style={{
                            color: theme.text,
                            fontWeight: "800",
                            fontSize: 15,
                            lineHeight: 20,
                        }}
                    >
                        {heading}
                    </Text>
                    <Text
                        style={{
                            color: theme.text + "99",
                            fontSize: 14,
                            lineHeight: 22,
                        }}
                    >
                        {text}
                    </Text>
                </View>
            </View>
        </View>
    );
}

// ─── Section Group with Label ──────────────────────────────────────────────
function SectionGroup({
    label,
    icon: GroupIcon,
    iconColor,
    sections,
    accentColor,
    theme,
}: {
    label: string;
    icon: LucideIcon;
    iconColor: string;
    sections: any[];
    accentColor: string;
    theme: Theme;
}) {
    return (
        <View style={{ gap: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <GroupIcon size={16} color={iconColor} strokeWidth={2.5} />
                <Text
                    style={{
                        color: theme.text,
                        fontWeight: "900",
                        fontSize: 16,
                        letterSpacing: -0.3,
                    }}
                >
                    {label}
                </Text>
                <View
                    style={{
                        flex: 1,
                        height: 1,
                        backgroundColor: theme.text + "18",
                        marginLeft: 4,
                    }}
                />
            </View>

            {sections.map((sec, i) => (
                <SectionCard
                    key={i}
                    heading={sec.heading}
                    text={sec.text}
                    icon={sec.icon}
                    tag={sec.tag}
                    accentColor={accentColor}
                    theme={theme}
                />
            ))}
        </View>
    );
}

// ─── Quick Wins ────────────────────────────────────────────────────────────
function QuickWins({
    items,
    accentColor,
    theme,
}: {
    items: string[];
    accentColor: string;
    theme: Theme;
}) {
    return (
        <View
            style={{
                backgroundColor: accentColor + "10",
                borderRadius: 16,
                padding: 16,
                gap: 10,
                borderWidth: 1,
                borderColor: accentColor + "25",
            }}
        >
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 2,
                }}
            >
                <Zap size={13} color={accentColor} strokeWidth={2.5} />
                <Text
                    style={{
                        color: accentColor,
                        fontWeight: "900",
                        fontSize: 13,
                        letterSpacing: 1,
                        textTransform: "uppercase",
                    }}
                >
                    Quick wins
                </Text>
            </View>
            {items.map((item, i) => (
                <View
                    key={i}
                    style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}
                >
                    <View
                        style={{
                            width: 20,
                            height: 20,
                            borderRadius: 10,
                            backgroundColor: accentColor,
                            alignItems: "center",
                            justifyContent: "center",
                            marginTop: 1,
                            flexShrink: 0,
                        }}
                    >
                        <Text style={{ color: "#fff", fontSize: 10, fontWeight: "900" }}>
                            {i + 1}
                        </Text>
                    </View>
                    <Text
                        style={{
                            color: theme.text,
                            fontSize: 14,
                            lineHeight: 22,
                            flex: 1,
                        }}
                    >
                        {item}
                    </Text>
                </View>
            ))}
        </View>
    );
}

// ─── Main Screen ───────────────────────────────────────────────────────────
export default function TipDetail() {
    const { theme } = useTheme();
    const { tip } = useLocalSearchParams<{ tip: string }>();

    const data = TIP_CONTENT[tip ?? "be-present"];

    if (!data) {
        return (
            <BackWrapper bg={theme.rootBg ?? theme.background}>
                <Text style={{ color: theme.text }}>{t("tipNotFound")}</Text>
            </BackWrapper>
        );
    }

    const Icon = data.icon;

    return (
        <BackWrapper p={false} bg={theme.rootBg ?? theme.background}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
            >
                {/* ── Hero ── */}
                <View
                    style={{
                        alignItems: "center",
                        paddingTop: 28,
                        paddingBottom: 24,
                        gap: 12,
                    }}
                >
                    <View
                        style={{
                            width: 88,
                            height: 88,
                            borderRadius: 26,
                            backgroundColor: data.iconBg + "20",
                            alignItems: "center",
                            justifyContent: "center",
                            borderWidth: 1.5,
                            borderColor: data.iconBg + "35",
                        }}
                    >
                        <Icon size={40} color={data.iconBg} strokeWidth={1.6} />
                    </View>

                    <Text
                        style={{
                            color: theme.text,
                            fontSize: 32,
                            fontWeight: "900",
                            letterSpacing: -1,
                            textAlign: "center",
                        }}
                    >
                        {data.title}
                    </Text>
                    <Text
                        style={{
                            color: theme.text + "66",
                            fontSize: 15,
                            textAlign: "center",
                            fontWeight: "500",
                        }}
                    >
                        {data.subtitle}
                    </Text>
                </View>

                {/* ── Intro ── */}
                <Text
                    style={{
                        color: theme.text + "BB",
                        fontSize: 16,
                        lineHeight: 26,
                        marginBottom: 28,
                        fontStyle: "italic",
                        textAlign: "center",
                        paddingHorizontal: 4,
                    }}
                >
                    {data.intro}
                </Text>

                {/* ── Quick Wins ── */}
                <QuickWins
                    items={data.quickWins}
                    accentColor={data.accentColor}
                    theme={theme}
                />

                {/* ── Core Sections ── */}
                <View style={{ marginTop: 28, gap: 10 }}>
                    <SectionGroup
                        label="The fundamentals"
                        icon={BookOpen}
                        iconColor={data.accentColor}
                        sections={data.coreSections}
                        accentColor={data.accentColor}
                        theme={theme}
                    />
                </View>

                {/* ── For Him ── */}
                <View style={{ marginTop: 24, gap: 10 }}>
                    <SectionGroup
                        label="His perspective"
                        icon={Crosshair}
                        iconColor="#818CF8"
                        sections={data.forHimSections}
                        accentColor={data.accentColor}
                        theme={theme}
                    />
                </View>

                {/* ── For Her ── */}
                <View style={{ marginTop: 24, gap: 10 }}>
                    <SectionGroup
                        label="Her perspective"
                        icon={Star}
                        iconColor="#F472B6"
                        sections={data.forHerSections}
                        accentColor={data.accentColor}
                        theme={theme}
                    />
                </View>

                {/* ── Premium Sections ── */}
                <View style={{ marginTop: 24, borderRadius: 16, overflow: "hidden" }}>
                    <View style={{ gap: 10, opacity: 0.07 }} pointerEvents="none">
                        {data.premiumSections.map((sec, i) => (
                            <SectionCard
                                key={i}
                                heading={sec.heading}
                                text={sec.text}
                                icon={sec.icon}
                                accentColor={data.accentColor}
                                theme={theme}
                            />
                        ))}
                    </View>

                    <Link href="/(protected)/subscriptions" asChild>
                        <Pressable
                            style={{
                                ...StyleSheet.absoluteFillObject,
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 8,
                                borderRadius: 16,
                                backgroundColor:
                                    (theme.rootBg ?? theme.background) + "EE",
                            }}
                        >
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 6,
                                    paddingHorizontal: 14,
                                    paddingVertical: 6,
                                    borderRadius: 50,
                                    backgroundColor: data.iconBg,
                                    marginBottom: 4,
                                }}
                            >
                                <Sparkles size={14} color="#fff" strokeWidth={2.5} />
                                <Text
                                    style={{
                                        color: "#fff",
                                        fontSize: 11,
                                        fontWeight: "800",
                                        letterSpacing: 1,
                                    }}
                                >
                                    {t("premium")}
                                </Text>
                            </View>
                            <Text
                                style={{
                                    color: theme.text,
                                    fontSize: 22,
                                    fontWeight: "900",
                                    letterSpacing: -0.3,
                                }}
                            >
                                {t("continueReading")}
                            </Text>
                            <Text style={{ color: theme.text + "88", fontSize: 14 }}>
                                {t("unlockWithPremium")}
                            </Text>
                        </Pressable>
                    </Link>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </BackWrapper>
    );
}
