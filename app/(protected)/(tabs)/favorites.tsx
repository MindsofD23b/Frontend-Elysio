import { router } from "expo-router";
import { CategoryGridCard } from "@/components/favorites/CategoryCard";
import { DateIdeaCard } from "@/components/favorites/DateIdeaCard";
import { TipRow } from "@/components/favorites/TipRow";
import { useTheme } from "@/lib/theme/context";
import { useRef, useState } from "react";
import { Plane, Dumbbell, Armchair, X } from "lucide-react-native";
import {
    Dimensions,
    Modal,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Pressable,
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
    { label: "TRAVEL", icon: Plane },
    { label: "ACTIVE", icon: Dumbbell },
    { label: "CHILL", icon: Armchair },
];

const TIPS = [
    {
        title: "Be present",
        subtitle: "Put your phone away and focus on the connection.",
        icon: "eye-outline" as const,
        iconBg: "#EC136A",
        tipKey: "be-present",
    },
    {
        title: "Active Listening",
        subtitle: "Ask follow-up questions to show genuine interest.",
        icon: "person-add-outline" as const,
        iconBg: "#9B4DCA",
        tipKey: "active-listening",
    },
    {
        title: "Stay Curious",
        subtitle: "Discover something new about them today.",
        icon: "happy-outline" as const,
        iconBg: "#E67FC9",
        tipKey: "stay-curious",
    },
];

const TIP_CONTENT: Record<string, { heading: string; text: string }[]> = {
    "be-present": [
        {
            heading: "Why it matters",
            text: "When you're truly present, your partner feels seen and valued. Research in relationship psychology shows that perceived attentiveness is one of the strongest predictors of relationship satisfaction. It's not about the amount of time you spend together — it's about the quality of that time.",
        },
        {
            heading: "The phone problem",
            text: "Studies show that simply having your phone on the table — even face down — reduces the quality of a conversation. Your brain allocates cognitive resources to the possibility of an incoming notification. Put it away. Not on silent. Away. This one habit change has been shown to increase feelings of connection and empathy significantly.",
        },
        {
            heading: "What presence actually looks like",
            text: "Being present isn't just about eye contact. It means noticing small things — the way they laugh, what they order, what they avoid. It means letting silences breathe instead of filling them. It means your reactions are real, not performed. Your partner can feel the difference.",
        },
    ],
    "active-listening": [
        {
            heading: "Why passive listening fails",
            text: "When we listen passively, we're processing about 25% of what's being said. Our brains run ahead — planning our response, making judgements, comparing their story to our own. The person talking can feel this, even if they can't name it. They leave the conversation feeling vaguely unheard.",
        },
        {
            heading: "The follow-up question rule",
            text: "The single most powerful thing you can do is ask one genuine follow-up question before sharing your own perspective. Not a surface-level 'oh really?' — a real question that shows you caught something specific. This signals that you were actually tracking what they said, not just waiting for your turn.",
        },
        {
            heading: "Listening with your body",
            text: "Active listening is physical. Leaning slightly forward, open posture, occasional nods — these aren't performative. They send signals to your own brain that reinforce attentiveness. Your body language also feeds back to your partner, making them feel safe enough to go deeper in the conversation.",
        },
    ],
    "stay-curious": [
        {
            heading: "Curiosity as attraction",
            text: "Psychologist Arthur Aron's famous 36 Questions study found that mutual vulnerability and escalating curiosity can produce feelings of closeness and attraction between strangers in under an hour. When someone is genuinely curious about you, you feel interesting — and feeling interesting is deeply attractive.",
        },
        {
            heading: "Beyond surface questions",
            text: "Most conversations stay on the surface — jobs, weekend plans, opinions on obvious things. Curious people go deeper, not by being nosy, but by following what's interesting. When someone mentions something, notice what you're actually curious about in it. Ask that — not the polite follow-up, the real one.",
        },
        {
            heading: "The beginner's mind",
            text: "Even if you've known someone for years, you don't fully know them. People change. What mattered to them at 22 means something different at 28. Approach even familiar topics as if you're hearing about them for the first time. You'll be surprised what you discover.",
        },
    ],
};

export default function Favorites() {
    const { theme } = useTheme();
    const s = makeStyles(theme);
    const [activeIndex, setActiveIndex] = useState(0);
    const [activeTip, setActiveTip] = useState<string | null>(null);
    const scrollRef = useRef<ScrollView>(null);

    const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
        setActiveIndex(index);
    };

    const activeTipData = TIPS.find((t) => t.tipKey === activeTip);
    const activeTipSections = activeTip ? TIP_CONTENT[activeTip] : [];

    return (
        <>
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
                        <Pressable
                            onPress={() => router.push("/favorites/allcategories")}
                        >
                            <Text style={s.viewAll}>View All</Text>
                        </Pressable>
                    </View>
                    <View style={s.categoryRow}>
                        {CATEGORIES.map((cat, i) => (
                            <CategoryGridCard
                                key={i}
                                label={cat.label}
                                icon={cat.icon}
                                ideas={[]}
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
                                onPress={() => setActiveTip(tip.tipKey)}
                            />
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* ── Tip Modal ── */}
            <Modal
                visible={!!activeTip}
                transparent
                animationType="slide"
                onRequestClose={() => setActiveTip(null)}
            >
                <View style={s.modalOverlay}>
                    <Pressable
                        style={s.modalBackdrop}
                        onPress={() => setActiveTip(null)}
                    />
                    <View style={[s.sheet, { backgroundColor: theme.background }]}>
                        {/* Handle */}
                        <View
                            style={[s.handle, { backgroundColor: theme.text + "30" }]}
                        />

                        {/* Sheet header */}
                        <View style={s.sheetHeader}>
                            <View>
                                <Text style={[s.sheetTitle, { color: theme.text }]}>
                                    {activeTipData?.title}
                                </Text>
                                <Text
                                    style={[
                                        s.sheetSubtitle,
                                        { color: theme.text + "66" },
                                    ]}
                                >
                                    {activeTipData?.subtitle}
                                </Text>
                            </View>
                            <Pressable
                                onPress={() => setActiveTip(null)}
                                style={[
                                    s.closeBtn,
                                    { backgroundColor: theme.text + "12" },
                                ]}
                            >
                                <X size={16} color={theme.text} strokeWidth={2.5} />
                            </Pressable>
                        </View>

                        {/* Sections */}
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ gap: 12, paddingBottom: 30 }}
                        >
                            {activeTipSections.map((sec, i) => (
                                <View
                                    key={i}
                                    style={[
                                        s.sectionCard,
                                        {
                                            backgroundColor: theme.text + "08",
                                            borderColor: theme.text + "12",
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            s.sectionHeading,
                                            { color: activeTipData?.iconBg },
                                        ]}
                                    >
                                        {sec.heading.toUpperCase()}
                                    </Text>
                                    <Text
                                        style={[
                                            s.sectionText,
                                            { color: theme.text + "CC" },
                                        ]}
                                    >
                                        {sec.text}
                                    </Text>
                                </View>
                            ))}

                            {/* Premium CTA */}
                            <Pressable
                                onPress={() => {
                                    setActiveTip(null);
                                    router.push("/subscriptions");
                                }}
                                style={[
                                    s.premiumBtn,
                                    { backgroundColor: activeTipData?.iconBg },
                                ]}
                            >
                                <Text style={s.premiumBtnText}>
                                    ✦ Unlock more with Premium
                                </Text>
                            </Pressable>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const makeStyles = (theme: any) =>
    StyleSheet.create({
        root: { flex: 1, backgroundColor: theme.rootBg },
        content: { paddingTop: 40, paddingBottom: 30, gap: 6 },

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

        tipsSection: { paddingHorizontal: 14, marginTop: 24, gap: 12 },
        tipsCol: { gap: 10 },

        // Modal
        modalOverlay: { flex: 1, justifyContent: "flex-end" },
        modalBackdrop: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "rgba(0,0,0,0.5)",
        },
        sheet: {
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            padding: 20,
            paddingTop: 12,
            maxHeight: "85%",
        },
        handle: {
            width: 40,
            height: 4,
            borderRadius: 2,
            alignSelf: "center",
            marginBottom: 16,
        },
        sheetHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 20,
        },
        sheetTitle: { fontSize: 20, fontWeight: "900" },
        sheetSubtitle: { fontSize: 13, marginTop: 2 },
        closeBtn: {
            width: 32,
            height: 32,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
        },

        // Section cards
        sectionCard: {
            borderRadius: 14,
            borderWidth: 1,
            padding: 14,
            gap: 8,
        },
        sectionHeading: {
            fontSize: 11,
            fontWeight: "800",
            letterSpacing: 1,
        },
        sectionText: {
            fontSize: 14,
            lineHeight: 22,
        },

        // Premium
        premiumBtn: {
            borderRadius: 14,
            padding: 16,
            alignItems: "center",
            marginTop: 4,
        },
        premiumBtnText: {
            color: "#fff",
            fontWeight: "800",
            fontSize: 15,
        },
    });
