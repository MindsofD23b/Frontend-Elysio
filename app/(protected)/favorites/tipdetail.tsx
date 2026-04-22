import { useTheme } from "@/lib/theme/context";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Sparkles } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { TipSection } from "@/components/favorites/TipSection";
import { TIP_CONTENT } from "@/lib/favorites/tips";

export default function TipDetail() {
    const { theme } = useTheme();
    const { tip } = useLocalSearchParams<{ tip: string }>();
    const s = makeStyles(theme);

    const data = TIP_CONTENT[tip ?? "be-present"];

    if (!data) {
        return (
            <View style={s.root}>
                <Text style={{ color: theme.text }}>Tip not found.</Text>
            </View>
        );
    }

    const Icon = data.icon;

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={s.root}>
                <View style={s.header}>
                    <Link href=".." asChild>
                        <Pressable style={s.backBtn}>
                            <ChevronLeft size={28} color={theme.text} strokeWidth={2.5} />
                        </Pressable>
                    </Link>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={s.scroll}
                >
                    <View style={s.hero}>
                        <View
                            style={[
                                s.iconCircle,
                                { backgroundColor: data.iconBg + "22" },
                            ]}
                        >
                            <Icon size={36} color={data.iconBg} strokeWidth={1.8} />
                        </View>
                        <Text style={[s.title, { color: theme.text }]}>{data.title}</Text>
                        <Text style={[s.subtitle, { color: theme.text + "66" }]}>
                            {data.subtitle}
                        </Text>
                    </View>

                    <Text style={[s.intro, { color: theme.text + "BB" }]}>
                        {data.intro}
                    </Text>

                    <View style={s.sections}>
                        {data.freeSections.map((sec, i) => (
                            <TipSection
                                key={i}
                                heading={sec.heading}
                                text={sec.text}
                                icon={sec.icon}
                            />
                        ))}
                    </View>

                    <View style={s.premiumWrap}>
                        <View style={{ gap: 12, opacity: 0.07 }} pointerEvents="none">
                            {data.premiumSections.map((sec, i) => (
                                <TipSection
                                    key={i}
                                    heading={sec.heading}
                                    text={sec.text}
                                    icon={sec.icon}
                                />
                            ))}
                        </View>

                        <Link href="/subscriptions" asChild>
                            <Pressable
                                style={[
                                    s.premiumOverlay,
                                    {
                                        backgroundColor:
                                            (theme.rootBg ?? theme.background) + "EE",
                                    },
                                ]}
                            >
                                <View
                                    style={[
                                        s.premiumBadge,
                                        { backgroundColor: data.iconBg },
                                    ]}
                                >
                                    <Sparkles size={14} color="#fff" strokeWidth={2.5} />
                                    <Text style={s.premiumBadgeText}>PREMIUM</Text>
                                </View>
                                <Text style={[s.premiumTitle, { color: theme.text }]}>
                                    Continue reading
                                </Text>
                                <Text
                                    style={[s.premiumSub, { color: theme.text + "88" }]}
                                >
                                    Unlock the full guide with Premium
                                </Text>
                            </Pressable>
                        </Link>
                    </View>

                    <View style={{ height: 40 }} />
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
        scroll: { paddingHorizontal: 20, paddingBottom: 30 },
        hero: { alignItems: "center", paddingVertical: 24, gap: 12 },
        iconCircle: {
            width: 80,
            height: 80,
            borderRadius: 24,
            alignItems: "center",
            justifyContent: "center",
        },
        title: {
            fontSize: 30,
            fontWeight: "900",
            letterSpacing: -0.5,
            textAlign: "center",
        },
        subtitle: { fontSize: 15, textAlign: "center", fontWeight: "500" },
        intro: { fontSize: 16, lineHeight: 26, marginBottom: 24, fontStyle: "italic" },
        sections: { gap: 12, marginBottom: 20 },
        premiumWrap: { borderRadius: 16, overflow: "hidden" },
        premiumOverlay: {
            ...StyleSheet.absoluteFillObject,
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            borderRadius: 16,
        },
        premiumBadge: {
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingHorizontal: 14,
            paddingVertical: 6,
            borderRadius: 50,
            marginBottom: 4,
        },
        premiumBadgeText: {
            color: "#fff",
            fontSize: 11,
            fontWeight: "800",
            letterSpacing: 1,
        },
        premiumTitle: { fontSize: 22, fontWeight: "900", letterSpacing: -0.3 },
        premiumSub: { fontSize: 14 },
    });
