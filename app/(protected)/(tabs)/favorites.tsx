import { CategoryCard } from "@/components/favorites/CategoryCard";
import { DateIdeaCard } from "@/components/favorites/DateIdeaCard";
import { TipRow } from "@/components/favorites/TipRow";
import { useTheme } from "@/lib/theme/context";
import { useRef, useState } from "react";
import {
    Dimensions,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 28;

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
    { label: "TRAVEL", icon: "airplane-outline" as const },
    { label: "ACTIVE", icon: "barbell-outline" as const },
    { label: "CHILL", icon: "cafe-outline" as const },
];

const TIPS = [
    {
        title: "Be present",
        subtitle: "Put your phone away and focus on the connection.",
        icon: "eye-outline" as const,
        iconBg: "#EC136A",
    },
    {
        title: "Active Listening",
        subtitle: "Ask follow-up questions to show genuine interest.",
        icon: "person-add-outline" as const,
        iconBg: "#9B4DCA",
    },
    {
        title: "Stay Curious",
        subtitle: "Discover something new about them today.",
        icon: "happy-outline" as const,
        iconBg: "#E67FC9",
    },
];

export default function Favorites() {
    const { theme } = useTheme();
    const s = makeStyles(theme);
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollRef = useRef<ScrollView>(null);

    const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
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
                snapToInterval={CARD_WIDTH}
                decelerationRate="fast"
                onScroll={onScroll}
                scrollEventThrottle={16}
                contentContainerStyle={s.cardScroll}
            >
                {DATE_IDEAS.map((idea, i) => (
                    <View key={i} style={{ width: CARD_WIDTH }}>
                        <DateIdeaCard {...idea} />
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
                    <Text style={s.viewAll}>View All</Text>
                </View>
                <View style={s.categoryRow}>
                    {CATEGORIES.map((cat, i) => (
                        <CategoryCard key={i} label={cat.label} icon={cat.icon} />
                    ))}
                </View>
            </View>

            {/* ── Winning Tips ── */}
            <View style={s.section}>
                <Text style={s.sectionTitle}>Winning Tips</Text>
                <View style={s.tipsCol}>
                    {TIPS.map((tip, i) => (
                        <TipRow key={i} {...tip} />
                    ))}
                </View>
            </View>
        </ScrollView>
    );
}

const makeStyles = (theme: any) =>
    StyleSheet.create({
        root: { flex: 1, backgroundColor: theme.rootBg },
        content: { paddingTop: 18, paddingBottom: 30, gap: 6 },

        cardScroll: { paddingHorizontal: 14, gap: 0 },

        dots: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 10 },
        dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#333" },
        dotActive: { backgroundColor: theme.primary, width: 18 },

        section: { paddingHorizontal: 14, gap: 12, marginTop: 10 },
        sectionHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
        },
        sectionTitle: { color: theme.white, fontWeight: "900", fontSize: 18 },
        viewAll: { color: theme.primary, fontWeight: "700", fontSize: 13 },

        categoryRow: { flexDirection: "row", gap: 10 },
        tipsCol: { gap: 10 },
    });
