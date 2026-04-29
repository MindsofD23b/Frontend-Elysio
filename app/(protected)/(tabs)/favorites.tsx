// Made with the help of Claude.ai and ChatGPT

import { router, useFocusEffect } from "expo-router";
import { CategoryGridCard } from "@/components/favorites/CategoryCard";
import { DateIdeaCard } from "@/components/favorites/DateIdeaCard";
import { TipRow } from "@/components/favorites/TipRow";
import { Theme } from "@/lib/theme/theme";
import { useTheme } from "@/lib/theme/context";
import { useCallback, useRef, useState } from "react";
import { Plane, Dumbbell, Armchair } from "lucide-react-native";
import { TIPS } from "@/lib/favorites/tips";
import {
    NativeScrollEvent,
    NativeSyntheticEvent,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from "react-native";
import { useSafeAreaControl } from "@/components/SafeArea";

const DATE_IDEAS = [
    {
        title: "Neon Bowling Night",
        location: "Downtown Retro Lanes",
        price: 45,
        effort: "Medium",
        duration: "2.5 Hours",
        vibe: "Playful",
        isTopPick: false,
    },
    {
        title: "Sunset Picnic",
        location: "Riverside Park",
        price: 20,
        effort: "Low",
        duration: "2 Hours",
        vibe: "Romantic",
        isTopPick: false,
    },
    {
        title: "Cooking Class",
        location: "Chef Studio Zurich",
        price: 80,
        effort: "High",
        duration: "3 Hours",
        vibe: "Fun",
        isTopPick: false,
    },
];

const CATEGORIES = [
    { label: "TRAVEL", icon: Plane },
    { label: "ACTIVE", icon: Dumbbell },
    { label: "CHILL", icon: Armchair },
];

export default function Favorites() {
    const { theme } = useTheme();
    const s = makeStyles(theme);
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollRef = useRef<ScrollView>(null);
    const { width } = useWindowDimensions();
    const cardWidth = width - 28;

    const { setDisabledEdges } = useSafeAreaControl();

    useFocusEffect(
        useCallback(() => {
            setDisabledEdges(["top"]);

            return () => {
                setDisabledEdges([]);
            };
        }, [setDisabledEdges]),
    );

    const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.round(e.nativeEvent.contentOffset.x / cardWidth);
        setActiveIndex(index);
    };

    return (
        <ScrollView
            style={s.root}
            contentContainerStyle={s.content}
            showsVerticalScrollIndicator={false}
        >
            {/* ── Date Ideas ── */}
            <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                snapToInterval={cardWidth}
                decelerationRate="fast"
                onScroll={onScroll}
                scrollEventThrottle={16}
                contentContainerStyle={s.cardScroll}
            >
                {DATE_IDEAS.map((idea, i) => (
                    <View key={i} style={{ width: cardWidth, paddingHorizontal: 6 }}>
                        <DateIdeaCard
                            {...idea}
                            onPress={() =>
                                router.push({
                                    pathname: "/favorites/ideadetail",
                                    params: {
                                        ...idea,
                                        price: String(idea.price),
                                        isTopPick: String(idea.isTopPick),
                                    },
                                })
                            }
                        />
                    </View>
                ))}
            </ScrollView>

            {/* Dots */}
            <View style={s.dots}>
                {DATE_IDEAS.map((_, i) => (
                    <View key={i} style={[s.dot, i === activeIndex && s.dotActive]} />
                ))}
            </View>

            {/* ── Explore Categories ── */}
            <View style={s.section}>
                <View style={s.sectionHeader}>
                    <Text style={s.sectionTitle}>Explore Categories</Text>
                    <Pressable onPress={() => router.push("/favorites/allcategories")}>
                        <Text style={s.viewAll}>View All</Text>
                    </Pressable>
                </View>
                <View style={s.categoryRow}>
                    {CATEGORIES.map((cat, i) => (
                        <CategoryGridCard
                            key={i}
                            label={cat.label}
                            icon={cat.icon}
                            onPress={() => router.push("/favorites/allcategories")}
                        />
                    ))}
                </View>
            </View>

            {/* ── Winning Tips ── */}
            <View style={s.tipsSection}>
                <Text style={s.sectionTitle}>Winning Tips</Text>
                <View style={s.tipsCol}>
                    {TIPS.map((tip, i) => (
                        <TipRow
                            key={i}
                            {...tip}
                            onPress={() =>
                                router.push(`/favorites/tipdetail?tip=${tip.tipKey}`)
                            }
                        />
                    ))}
                </View>
            </View>
        </ScrollView>
    );
}

const makeStyles = (theme: Theme) =>
    StyleSheet.create({
        root: { flex: 1, backgroundColor: theme.rootBg, paddingTop: 48 },
        content: { paddingTop: 40, paddingBottom: 30, gap: 6 },
        cardScroll: { paddingHorizontal: 14, gap: 0 },
        dots: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 10 },
        dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.text + "44" },
        dotActive: { backgroundColor: theme.primary, width: 18 },
        section: { paddingHorizontal: 14, gap: 12, marginTop: 10 },
        sectionHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
        },
        sectionTitle: { color: theme.text, fontWeight: "900", fontSize: 18 },
        viewAll: { color: theme.primary, fontWeight: "700", fontSize: 13 },
        categoryRow: { flexDirection: "row", gap: 10 },
        tipsSection: { paddingHorizontal: 14, marginTop: 24, gap: 12 },
        tipsCol: { gap: 10 },
    });
