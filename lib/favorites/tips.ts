// Made with the help of Claude.ai and ChatGPT

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
    Coffee,
    Map,
    Compass,
    Wind,
    Sun,
    Moon,
    Feather,
    Anchor,
    Leaf,
} from "lucide-react-native";

export type TipSection = {
    heading: string;
    text: string;
    icon: LucideIcon;
    tag?: "mindset" | "action" | "avoid" | "both" | "him" | "her";
};

export type TipData = {
    title: string;
    subtitle: string;
    icon: LucideIcon;
    iconBg: string;
    accentColor: string;
    intro: string;
    coreSections: TipSection[];
    forHimSections: TipSection[];
    forHerSections: TipSection[];
    premiumSections: TipSection[];
    quickWins: string[];
};

// ─── Tip List (used in Favorites screen) ───────────────────────────────────
export const TIPS = [
    {
        title: "Be Present",
        subtitle: "Your attention is your most powerful tool.",
        icon: "eye-outline" as const,
        iconBg: "#EC136A",
        tipKey: "be-present",
    },
    {
        title: "Active Listening",
        subtitle: "Hear what's actually being said.",
        icon: "person-add-outline" as const,
        iconBg: "#9B4DCA",
        tipKey: "active-listening",
    },
    {
        title: "Stay Curious",
        subtitle: "The best dates feel like discovery.",
        icon: "happy-outline" as const,
        iconBg: "#E67FC9",
        tipKey: "stay-curious",
    },
    {
        title: "Body Language",
        subtitle: "What you say without words.",
        icon: "body-outline" as const,
        iconBg: "#F4A261",
        tipKey: "body-language",
    },
    {
        title: "Build Tension",
        subtitle: "The slow burn is always worth it.",
        icon: "flame-outline" as const,
        iconBg: "#E63946",
        tipKey: "build-tension",
    },
];

// ─── Tip Content ────────────────────────────────────────────────────────────
export const TIP_CONTENT: Record<string, TipData> = {
    "be-present": {
        title: "Be Present",
        subtitle: "The art of truly being there",
        icon: Eye,
        iconBg: "#EC136A",
        accentColor: "#EC136A",
        intro: "In a world of notifications and half-attention, the ability to be fully present with someone is one of the rarest things you can offer. And it's noticed immediately.",
        quickWins: [
            "Phone in pocket or bag — not on the table",
            "Make eye contact when they're talking",
            "Don't plan your reply while they're still speaking",
            "Notice small things — what they ordered, what they avoided",
        ],
        coreSections: [
            {
                heading: "Why it hits different",
                icon: Heart,
                tag: "mindset",
                text: "People can feel when you're half-present. Your eyes drift, your answers are slightly off, you miss the small things they said. Presence isn't about staring intensely — it's about genuinely being in the moment with them. When you are, they feel it. And it's magnetic.",
            },
            {
                heading: "The phone trap",
                icon: Shield,
                tag: "avoid",
                text: "Even face-down on the table, your phone is hurting the conversation. Your brain keeps a little background process running — 'what if something comes in?' — and it steals cognitive bandwidth. The fix is simple: put it away. Not on silent. Away. It signals that this moment is what matters.",
            },
            {
                heading: "Presence isn't about eye contact",
                icon: Sparkles,
                tag: "action",
                text: "A lot of people try to 'look present' by over-doing eye contact. That's not it. Real presence means you're reacting naturally, you remember what they said five minutes ago, you pick up on shifts in their mood. Let silences breathe. Don't rush to fill every gap — comfortable silence is actually a sign of real connection.",
            },
        ],
        forHimSections: [
            {
                heading: "Put the game plan down",
                icon: Target,
                tag: "him",
                text: "Most guys come into a date thinking about what to say next, how to impress, what move to make. That mental chess game is the enemy of presence. Stop planning. Listen to what she's actually saying — not to find an angle, but because you're genuinely interested. The best thing you can do is make her feel like she has your full attention.",
            },
            {
                heading: "Read the room, not the script",
                icon: Compass,
                tag: "him",
                text: "Don't show up with a mental list of topics. Follow the conversation where it naturally goes. If she lights up talking about her travels, stay there. Ask more. Dig deeper. You don't need a plan — you need to be paying attention.",
            },
        ],
        forHerSections: [
            {
                heading: "Let yourself be seen too",
                icon: Feather,
                tag: "her",
                text: "Being present isn't just about giving attention — it's about being open to receiving it. Sometimes we check our phone, look away, or deflect with humor when someone's attention feels intense. Notice that habit. Staying present means letting them actually see you too — that's where real connection starts.",
            },
            {
                heading: "Your vibe sets the tone",
                icon: Sun,
                tag: "her",
                text: "You often set the energy of the interaction without realizing it. If you're relaxed and engaged, they mirror it. If you're checking out, they feel it and pull back. Being present is a gift you give the other person — and it usually comes right back to you.",
            },
        ],
        premiumSections: [
            {
                heading: "Presence under stress",
                icon: Brain,
                text: "When you're anxious or distracted, being present is 10x harder. Learn the specific techniques therapists and mindfulness coaches use to drop into the moment — even when your own head is loud.",
            },
            {
                heading: "Interpersonal synchrony",
                icon: Zap,
                text: "The deepest form of presence is when two people fall into a natural rhythm. Learn how to cultivate this state intentionally — it's what people call 'chemistry'.",
            },
        ],
    },

    "active-listening": {
        title: "Active Listening",
        subtitle: "Hear what's really being said",
        icon: UserPlus,
        iconBg: "#9B4DCA",
        accentColor: "#9B4DCA",
        intro: "Most people listen to reply. Active listeners listen to understand. It sounds like a small difference — but the person on the other end feels it immediately.",
        quickWins: [
            "Ask one genuine follow-up before sharing your take",
            "Paraphrase back what they said — 'So it sounds like...'",
            "Lean slightly forward, open posture",
            "Never interrupt — even if you're excited",
        ],
        coreSections: [
            {
                heading: "Why passive listening fails",
                icon: MessageCircle,
                tag: "mindset",
                text: "When we listen passively, we catch about 25% of what's being said. Our brain runs ahead — planning a response, comparing their story to ours, forming judgements. The other person can sense this. They feel talked at, not heard. And the conversation stays shallow.",
            },
            {
                heading: "The follow-up rule",
                icon: Lightbulb,
                tag: "action",
                text: "Before sharing your own view, ask one real follow-up question. Not 'oh really?' — something specific that shows you caught what they said. 'What was that like for you?' or 'How long did that go on?' These small moves shift the entire dynamic. They feel like they finally found someone who actually listens.",
            },
            {
                heading: "Listening is physical",
                icon: Smile,
                tag: "action",
                text: "Your body is part of how you listen. Leaning slightly forward, nodding occasionally, maintaining relaxed eye contact — these aren't fake tricks. They send signals to your own brain that reinforce focus. And they tell the other person: I'm here, keep going.",
            },
        ],
        forHimSections: [
            {
                heading: "Resist the fix-it reflex",
                icon: Anchor,
                tag: "him",
                text: "When she shares a problem or frustration, the instinct is to jump in with a solution. Resist that. Nine times out of ten, she's not asking you to fix it — she wants to feel heard. Before offering anything practical, say something like 'That sounds exhausting' or 'How are you handling it?' — that's the listen-first move that changes everything.",
            },
            {
                heading: "Remember the small things",
                icon: Star,
                tag: "him",
                text: "If she mentioned her sister's wedding in two weeks, ask about it next time. If she said she has a big presentation tomorrow, check in. Remembering small details she mentioned is the listening skill that creates the deepest impression. It says: I was actually there when you said that.",
            },
        ],
        forHerSections: [
            {
                heading: "Don't interrupt to relate",
                icon: Wind,
                tag: "her",
                text: "One of the most common listening mistakes is jumping in with 'Oh me too!' or pivoting to a similar story while they're still talking. It feels connecting in the moment but actually cuts them off. Let them finish completely. Then relate. The difference is huge.",
            },
            {
                heading: "Ask what they need first",
                icon: Leaf,
                tag: "her",
                text: "When someone shares something heavy or frustrating, try asking 'Do you want to vent or do you want thoughts?' before launching in. Most people don't get asked this and it immediately signals that you actually listen differently than most.",
            },
        ],
        premiumSections: [
            {
                heading: "Reflective listening mastery",
                icon: BookOpen,
                text: "Therapists use reflective listening — paraphrasing what someone said back in your own words. Learn how to do this naturally without sounding like a robot.",
            },
            {
                heading: "Listening through conflict",
                icon: Shield,
                text: "When emotions run high, listening breaks down first. Learn physiological techniques to stay genuinely open during disagreements.",
            },
        ],
    },

    "stay-curious": {
        title: "Stay Curious",
        subtitle: "Never stop discovering each other",
        icon: Smile,
        iconBg: "#E67FC9",
        accentColor: "#E67FC9",
        intro: "Curiosity is what turns a conversation into something memorable. It's the difference between going through the motions and genuinely wanting to know who this person is.",
        quickWins: [
            "Follow what lights them up — dig into it",
            "Ask 'What was that like?' instead of 'What did you do?'",
            "Treat even familiar topics as if you're hearing them fresh",
            "Never fake curiosity — real interest is obvious",
        ],
        coreSections: [
            {
                heading: "Curiosity creates attraction",
                icon: Flame,
                tag: "mindset",
                text: "Psychologist Arthur Aron's famous 36 Questions study showed that mutual vulnerability and escalating curiosity can produce genuine closeness between strangers in under an hour. People don't fall for someone who's impressive — they fall for someone who makes them feel interesting. Curiosity does that.",
            },
            {
                heading: "Beyond surface questions",
                icon: Star,
                tag: "action",
                text: "Most conversations stay on the surface — jobs, weekend plans, where you're from. Curious people go deeper. Not by being nosy, but by following what's actually interesting. If they mention something that clearly matters to them, stay there. Don't move to your next topic. Explore the one they lit up about.",
            },
            {
                heading: "Treat them like a mystery",
                icon: Map,
                tag: "mindset",
                text: "Even if you've known someone for years, you don't fully know them — people change. But especially early on, approach them like a puzzle you genuinely want to figure out. What shaped them? What do they care about that most people don't know? What's underneath the polished answer they give everyone?",
            },
        ],
        forHimSections: [
            {
                heading: "Be curious, not interrogative",
                icon: Compass,
                tag: "him",
                text: "There's a fine line between curiosity and an interview. Don't fire questions like you're filling out a form. Ask one good question, really listen to the answer, then respond to what they said before asking the next thing. The rhythm of genuine curiosity is: ask → listen → react → dig deeper.",
            },
            {
                heading: "Get curious about her world",
                icon: Coffee,
                tag: "him",
                text: "One of the biggest things guys miss: being curious about the small details of her life, not just the big dramatic things. Her favourite way to spend a Sunday. What she's currently stressed about. What her friendship group is like. These questions feel personal without being heavy — and they show you're interested in who she actually is.",
            },
        ],
        forHerSections: [
            {
                heading: "Curiosity goes both ways",
                icon: Moon,
                tag: "her",
                text: "Being curious about him signals that you're engaged — not just waiting to be impressed. Ask about things he clearly cares about, even if they're not your usual world. Gaming, his job, his friends, his ambitions. You don't have to fake interest, but you do need to genuinely look for what's interesting about his perspective.",
            },
            {
                heading: "Let curiosity replace evaluation",
                icon: Feather,
                tag: "her",
                text: "It's easy to go into early dates with an evaluation mindset — ticking boxes, looking for red flags. Curiosity is the antidote. Instead of 'is this person right for me?' try 'who is this person, really?' You'll relax, the conversation will flow better, and you'll actually learn more — which lets you make a better call anyway.",
            },
        ],
        premiumSections: [
            {
                heading: "Question architecture",
                icon: Target,
                text: "Not all questions are equal. Learn how to build a conversation that moves through layers — feeling effortless while actually going somewhere meaningful.",
            },
            {
                heading: "Curiosity as a long-term practice",
                icon: Zap,
                text: "In long-term relationships, familiarity kills curiosity. Learn the practices that keep genuine interest alive over months and years.",
            },
        ],
    },

    "body-language": {
        title: "Body Language",
        subtitle: "What you say without words",
        icon: Sparkles,
        iconBg: "#F4A261",
        accentColor: "#F4A261",
        intro: "More than half of what you communicate has nothing to do with your words. Your body is always sending a signal — the question is whether it's the right one.",
        quickWins: [
            "Stand/sit straight — confidence reads instantly",
            "Uncross your arms — open posture invites connection",
            "Mirror their energy (not robotically)",
            "Slow down your movements — calm signals confidence",
        ],
        coreSections: [
            {
                heading: "Your body is always speaking",
                icon: Eye,
                tag: "mindset",
                text: "Before you say a word, people have already formed an impression. Closed posture, looking at your phone, arms crossed, fidgeting — all of it reads as disinterest or anxiety. Open posture, stillness, facing them directly — that reads as confidence and engagement. The good news: you can train this.",
            },
            {
                heading: "Mirroring — the subtle game",
                icon: Sparkles,
                tag: "action",
                text: "When two people are connecting, they naturally start to mirror each other — similar posture, similar pace of speaking, similar energy. You can gently lead this. Match their energy level first, then slowly shift — sit back more comfortably, speak more slowly. Often they'll follow. It creates a sense of being 'in sync.'",
            },
            {
                heading: "Eye contact — the calibration",
                icon: Target,
                tag: "action",
                text: "Too little eye contact reads as shy or uninterested. Too much reads as intense or aggressive. The sweet spot: hold eye contact while you listen, let it drift naturally while you're thinking or speaking. When you make a point that matters, hold it a beat longer. That's where eye contact becomes powerful.",
            },
        ],
        forHimSections: [
            {
                heading: "Take up space (the right way)",
                icon: Anchor,
                tag: "him",
                text: "Confident men take up a natural amount of space — not aggressively, just comfortably. Sitting back slightly, open stance, movements that aren't rushed. What to avoid: hunching over your phone, crossing your legs tightly, fidgeting constantly. These read as nervous energy, which is fine — but managing it is the skill.",
            },
            {
                heading: "Touch — timing is everything",
                icon: Heart,
                tag: "him",
                text: "A light, brief touch on the arm or back at the right moment is one of the most powerful signals in early dating. But timing matters more than the touch itself. Do it when she's laughed at something, when you're making a point, when you're guiding through a door. Never forced, never held too long — brief, natural, intentional.",
            },
        ],
        forHerSections: [
            {
                heading: "Lean in — literally",
                icon: Feather,
                tag: "her",
                text: "One of the clearest signals of interest is a slight lean forward. It's subtle, but it screams 'I'm engaged.' Leaning back with arms crossed — even if you're just sitting comfortably — can read as cold or disinterested. Small shift: lean in slightly when they say something you find genuinely interesting. It changes the whole dynamic.",
            },
            {
                heading: "Smile with your eyes",
                icon: Sun,
                tag: "her",
                text: "A smile that only involves your mouth is different from one that reaches your eyes. The second one — sometimes called a Duchenne smile — is what people actually find warm and attractive. You can't fake it completely, but you can practice finding genuine amusement instead of performing a smile. People feel the difference.",
            },
        ],
        premiumSections: [
            {
                heading: "Proxemics — the space between you",
                icon: Brain,
                text: "How close you stand, when you move closer, when you step back — these are all signals. Learn how to use physical distance as a conversation tool.",
            },
            {
                heading: "Reading their signals",
                icon: Zap,
                text: "Once you know what to look for, other people's body language becomes readable. Learn the key positive and negative cues — and how to respond to each.",
            },
        ],
    },

    "build-tension": {
        title: "Build Tension",
        subtitle: "The slow burn is always worth it",
        icon: Flame,
        iconBg: "#E63946",
        accentColor: "#E63946",
        intro: "Attraction without tension is just friendship. Tension isn't awkward — it's exciting. Learning to create and hold it is one of the highest-value skills in dating.",
        quickWins: [
            "Tease playfully — then pull back",
            "Hold eye contact a second longer than comfortable",
            "Don't rush — slow everything down",
            "Say less than you want to — mystery is magnetic",
        ],
        coreSections: [
            {
                heading: "What tension actually is",
                icon: Zap,
                tag: "mindset",
                text: "Tension isn't conflict. It's the feeling of 'something might happen here' — that charged energy between two people who are clearly interested in each other but haven't closed the gap yet. It's playfulness with edge. Curiosity with pull. When it's there, both people can feel it. When it's absent, the date feels like a job interview.",
            },
            {
                heading: "The push-pull dynamic",
                icon: Flame,
                tag: "action",
                text: "Tension is created through contrast. You show interest — then you pull back slightly. You compliment — then you tease. You lean in — then you sit back. This isn't manipulation. It's the natural rhythm of genuine attraction. When everything is approval and agreement, there's no energy. Contrast creates it.",
            },
            {
                heading: "Don't over-explain",
                icon: MessageCircle,
                tag: "avoid",
                text: "One of the fastest ways to kill tension is over-explaining yourself. Every joke doesn't need a footnote. Every statement doesn't need three qualifiers. Say what you mean, then let it land. Silence after a bold statement is tension. Filling it immediately because you're nervous destroys it.",
            },
        ],
        forHimSections: [
            {
                heading: "Tease, don't compliment-bomb",
                icon: Star,
                tag: "him",
                text: "Telling someone they're amazing every five minutes doesn't create attraction — it reads as approval-seeking. Genuine, playful teasing does more for attraction than ten compliments. Not mean, not sarcastic — light, fun, with a smile. Think: the kind of thing you'd say to someone you're comfortable enough with to joke around. Then actually pay a real compliment when it matters. That contrast is where the magic is.",
            },
            {
                heading: "Create moments, don't fill them",
                icon: Moon,
                tag: "him",
                text: "Tension lives in the gaps. The moment after a charged look, the pause before you say something, the second before you lean closer. Stop rushing to fill these. Learn to be comfortable sitting in the charge of a moment. That comfort — that stillness — is one of the most attractive things a man can have.",
            },
        ],
        forHerSections: [
            {
                heading: "You can create tension too",
                icon: Wind,
                tag: "her",
                text: "Tension isn't something that only happens to you — you can build it deliberately. Hold eye contact a beat longer. Smile and then look away. Say something that hints at something more. Ask a slightly edgy question. These moves signal that you're playing the game too — and most guys find that incredibly attractive.",
            },
            {
                heading: "Don't defuse every charged moment",
                icon: Leaf,
                tag: "her",
                text: "When a moment gets charged — when there's that obvious look, that loaded silence — a lot of people immediately defuse it with humor or a topic change because it feels too intense. Notice that reflex. Sometimes the best move is to let the moment exist. You don't have to say anything. Just hold it.",
            },
        ],
        premiumSections: [
            {
                heading: "Tension in long-term relationships",
                icon: Heart,
                text: "Tension doesn't have to die with familiarity. Learn how couples maintain the charge years in — and how to reignite it when it's faded.",
            },
            {
                heading: "Reading the other person's signals",
                icon: Brain,
                text: "Building tension only works if you can read whether the other person is enjoying it. Learn the difference between nervous excitement and genuine discomfort — and how to calibrate accordingly.",
            },
        ],
    },
};
