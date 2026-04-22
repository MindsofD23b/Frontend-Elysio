// Made with the help of ChatGPT and Claude.ai

import {
    BookOpen,
    Brain,
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

export type Section = {
    heading: string;
    text: string;
    icon: LucideIcon;
};

export type TipData = {
    title: string;
    subtitle: string;
    icon: LucideIcon;
    iconBg: string;
    intro: string;
    freeSections: Section[];
    premiumSections: Section[];
};

export const TIPS = [
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

export const TIP_CONTENT: Record<string, TipData> = {
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
                text: "When you're truly present, your partner feels seen and valued. Research in relationship psychology shows that perceived attentiveness is one of the strongest predictors of relationship satisfaction. It's not about the amount of time you spend together — it's about the quality of that time.",
            },
            {
                heading: "The phone problem",
                icon: Shield,
                text: "Studies show that simply having your phone on the table — even face down — reduces the quality of a conversation. Your brain allocates cognitive resources to the possibility of an incoming notification. Put it away. Not on silent. Away.",
            },
            {
                heading: "What presence actually looks like",
                icon: Sparkles,
                text: "Being present isn't just about eye contact. It means noticing small things — the way they laugh, what they order, what they avoid. It means letting silences breathe instead of filling them.",
            },
        ],
        premiumSections: [
            {
                heading: "Presence under stress",
                icon: Brain,
                text: "When you're anxious, distracted, or tired, being present is ten times harder. Learn the specific mental techniques used by therapists and mindfulness coaches to drop into the moment — even when your own mind is loud.",
            },
            {
                heading: "The presence paradox",
                icon: Zap,
                text: "Trying too hard to be present actually makes you less present. Discover why forced attentiveness backfires, and what to do instead.",
            },
            {
                heading: "Advanced: mirroring and flow states",
                icon: Target,
                text: "The deepest form of presence is called interpersonal synchrony — when two people fall into a natural rhythm together. Learn how to cultivate this state intentionally.",
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
                text: "When we listen passively, we're processing about 25% of what's being said. Our brains run ahead — planning our response, making judgements, comparing their story to our own.",
            },
            {
                heading: "The follow-up question rule",
                icon: Lightbulb,
                text: "The single most powerful thing you can do is ask one genuine follow-up question before sharing your own perspective. Not a surface-level 'oh really?' — a real question that shows you caught something specific.",
            },
            {
                heading: "Listening with your body",
                icon: Smile,
                text: "Active listening is physical. Leaning slightly forward, open posture, occasional nods — these aren't performative. They send signals to your own brain that reinforce attentiveness.",
            },
        ],
        premiumSections: [
            {
                heading: "Reflective listening mastery",
                icon: BookOpen,
                text: "Therapists use a technique called reflective listening — paraphrasing what someone said back to them in your own words. Learn how to do this without sounding clinical or robotic.",
            },
            {
                heading: "Listening through conflict",
                icon: Shield,
                text: "When emotions run high, listening breaks down first. Learn the physiological techniques to stay genuinely open during disagreements.",
            },
            {
                heading: "Reading what isn't said",
                icon: Eye,
                text: "The most important things are often communicated through hesitation, word choice, and what gets avoided. Learn to read the subtext of a conversation.",
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
                text: "Psychologist Arthur Aron's famous 36 Questions study found that mutual vulnerability and escalating curiosity can produce feelings of closeness and attraction between strangers in under an hour.",
            },
            {
                heading: "Beyond surface questions",
                icon: Star,
                text: "Most conversations stay on the surface — jobs, weekend plans, opinions on obvious things. Curious people go deeper, not by being nosy, but by following what's interesting.",
            },
            {
                heading: "The beginner's mind",
                icon: Sparkles,
                text: "Even if you've known someone for years, you don't fully know them. People change. Approach even familiar topics as if you're hearing about them for the first time.",
            },
        ],
        premiumSections: [
            {
                heading: "Curiosity under pressure",
                icon: Brain,
                text: "When we feel judged or insecure, curiosity collapses. Learn the specific mindset shifts that keep you genuinely curious even when you're nervous or self-conscious.",
            },
            {
                heading: "The question architecture",
                icon: Target,
                text: "Not all questions are equal. Learn how to construct a natural conversation that moves through layers — feeling like an effortless flow while actually going somewhere meaningful.",
            },
            {
                heading: "Curiosity as a long-term practice",
                icon: Zap,
                text: "In long-term relationships, familiarity kills curiosity. Learn the practices that keep genuine interest alive over months and years.",
            },
        ],
    },
};
