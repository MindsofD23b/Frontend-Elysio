import { useTheme } from "@/lib/theme/context";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import {
    BookOpen,
    Brain,
    ChevronLeft,
    Eye,
    Flame,
    Heart,
    Lightbulb,
    LucideIcon,
    MessageCircle,
    Shield,
    Smile,
    Sparkles,
    Star,
    Target,
    UserPlus,
    Zap,
} from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { TipSection } from "@/components/favorites/TipSection";

type Section = {
    heading: string;
    text: string;
    icon: LucideIcon;
};

type TipData = {
    title: string;
    subtitle: string;
    icon: LucideIcon;
    iconBg: string;
    intro: string;
    freeSections: Section[];
    premiumSections: Section[];
};

const TIP_CONTENT: Record<string, TipData> = {
    "be-present": {
        title: "Be Present",
        subtitle: "The art of truly being there",
        icon: Eye,
        iconBg: "#EC136A",
        intro: "In a world of constant notifications and endless scrolling, the ability to be fully present with another person has become one of the rarest — and most powerful — gifts you can give.",
        freeSections: [
            {
                heading: "Why it matters",
                icon: Heart,
                text: "When you're truly present, your partner feels seen and valued. Research in relationship psychology shows that perceived attentiveness is one of the strongest predictors of relationship satisfaction. It's not about the amount of time you spend together — it's about the quality of that time. A single hour of undivided attention can feel more meaningful than a whole day of half-hearted company.",
            },
            {
                heading: "The phone problem",
                icon: Shield,
                text: "Studies show that simply having your phone on the table — even face down — reduces the quality of a conversation. Your brain allocates cognitive resources to the possibility of an incoming notification. Put it away. Not on silent. Away. This one habit change has been shown to increase feelings of connection and empathy significantly.",
            },
            {
                heading: "What presence actually looks like",
                icon: Sparkles,
                text: "Being present isn't just about eye contact. It means noticing small things — the way they laugh, what they order, what they avoid. It means letting silences breathe instead of filling them. It means your reactions are real, not performed. Your partner can feel the difference.",
            },
        ],
        premiumSections: [
            {
                heading: "Presence under stress",
                icon: Brain,
                text: "When you're anxious, distracted, or tired, being present is ten times harder. Learn the specific mental techniques used by therapists and mindfulness coaches to drop into the moment — even when your own mind is loud. This includes a 90-second grounding exercise you can do discreetly at the table.",
            },
            {
                heading: "The presence paradox",
                icon: Zap,
                text: "Trying too hard to be present actually makes you less present. Discover why forced attentiveness backfires, and what to do instead. The best connections happen when you stop performing and start simply existing alongside someone.",
            },
            {
                heading: "Advanced: mirroring and flow states",
                icon: Target,
                text: "The deepest form of presence is called interpersonal synchrony — when two people fall into a natural rhythm together. Learn how to cultivate this state intentionally through subtle mirroring, pacing, and conversational flow techniques backed by neuroscience.",
            },
        ],
    },

    "active-listening": {
        title: "Active Listening",
        subtitle: "Hear what's really being said",
        icon: UserPlus,
        iconBg: "#9B4DCA",
        intro: "Most people listen to reply. Active listeners listen to understand. The difference sounds small — but it changes everything about how a conversation feels to the other person.",
        freeSections: [
            {
                heading: "Why passive listening fails",
                icon: MessageCircle,
                text: "When we listen passively, we're processing about 25% of what's being said. Our brains run ahead — planning our response, making judgements, comparing their story to our own. The person talking can feel this, even if they can't name it. They leave the conversation feeling vaguely unheard, even if you technically heard every word.",
            },
            {
                heading: "The follow-up question rule",
                icon: Lightbulb,
                text: "The single most powerful thing you can do is ask one genuine follow-up question before sharing your own perspective. Not a surface-level 'oh really?' — a real question that shows you caught something specific. 'You said you were nervous — what was going through your head?' This signals that you were actually tracking what they said, not just waiting for your turn.",
            },
            {
                heading: "Listening with your body",
                icon: Smile,
                text: "Active listening is physical. Leaning slightly forward, open posture, occasional nods — these aren't performative. They send signals to your own brain that reinforce attentiveness. Your body language also feeds back to your partner, making them feel safe enough to go deeper in the conversation.",
            },
        ],
        premiumSections: [
            {
                heading: "Reflective listening mastery",
                icon: BookOpen,
                text: "Therapists use a technique called reflective listening — paraphrasing what someone said back to them in your own words. Done naturally, it's one of the most disarming things you can do. Learn how to do this without sounding clinical or robotic, and how to use it to unlock deeper honesty in a conversation.",
            },
            {
                heading: "Listening through conflict",
                icon: Shield,
                text: "When emotions run high, listening breaks down first. Your nervous system triggers defensiveness before your conscious mind has a chance to respond. Learn the physiological techniques to stay genuinely open during disagreements — not just appear calm, but actually be calm and curious.",
            },
            {
                heading: "Reading what isn't said",
                icon: Eye,
                text: "The most important things are often communicated through hesitation, word choice, and what gets avoided. Learn to read the subtext of a conversation — the emotional content beneath the literal content — and respond to what your partner actually means, not just what they said.",
            },
        ],
    },

    "stay-curious": {
        title: "Stay Curious",
        subtitle: "Never stop discovering each other",
        icon: Smile,
        iconBg: "#E67FC9",
        intro: "Curiosity is what turns an ordinary conversation into something memorable. It's the difference between going through the motions and genuinely wanting to know who this person is.",
        freeSections: [
            {
                heading: "Curiosity as attraction",
                icon: Flame,
                text: "Psychologist Arthur Aron's famous 36 Questions study found that mutual vulnerability and escalating curiosity can produce feelings of closeness and attraction between strangers in under an hour. The mechanism is simple: when someone is genuinely curious about you, you feel interesting. And feeling interesting is deeply attractive.",
            },
            {
                heading: "Beyond surface questions",
                icon: Star,
                text: "Most conversations stay on the surface — jobs, weekend plans, opinions on obvious things. Curious people go deeper, not by being nosy, but by following what's interesting. When someone mentions something, notice what you're actually curious about in it. Ask that. Not the polite follow-up — the real one.",
            },
            {
                heading: "The beginner's mind",
                icon: Sparkles,
                text: "Even if you've known someone for years, you don't fully know them. People change. Their relationship to their past changes. What mattered to them at 22 means something different at 28. Approach even familiar topics as if you're hearing about them for the first time. You'll be surprised what you discover.",
            },
        ],
        premiumSections: [
            {
                heading: "Curiosity under pressure",
                icon: Brain,
                text: "When we feel judged or insecure, curiosity collapses — we retreat into performing instead of exploring. Learn the specific mindset shifts that keep you genuinely curious even when you're nervous, self-conscious, or trying to impress. Paradoxically, curiosity is more impressive than performance.",
            },
            {
                heading: "The question architecture",
                icon: Target,
                text: "Not all questions are equal. Open questions, hypothetical questions, and value questions each unlock different parts of a person. Learn how to construct a natural conversation that moves through these layers — feeling like an effortless flow while actually going somewhere meaningful.",
            },
            {
                heading: "Curiosity as a long-term practice",
                icon: Zap,
                text: "In long-term relationships, familiarity kills curiosity. Learn the practices that keep genuine interest alive over months and years — not tricks or hacks, but real perspective shifts that change how you see your partner. The couples who stay in love are the ones who keep finding each other interesting.",
            },
        ],
    },
};

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
                {/* Header */}
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
                    {/* Hero */}
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

                    {/* Intro */}
                    <Text style={[s.intro, { color: theme.text + "BB" }]}>
                        {data.intro}
                    </Text>

                    {/* Free sections */}
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

                    {/* Premium fade block */}
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

                        <Link href="/analytics/premium" asChild>
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
