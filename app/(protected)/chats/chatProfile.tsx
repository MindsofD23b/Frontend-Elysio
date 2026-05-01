// Made with the help of Claude.ai and ChatGPT

import { useTheme } from "@/lib/theme/context";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import {
    ChevronLeft,
    MapPin,
    Briefcase,
    CalendarDays,
    MessageCircle,
} from "lucide-react-native";
import { Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Dummy Data ──────────────────────────────────────────────────────────────

const DUMMY_USER = {
    name: "Ethan Clark",
    image: null, // replace with real URI later
    dateOfBirth: "1998-04-12",
    location: "Zurich, Switzerland",
    occupation: "Entrepreneur",
    bio: "I'm the type of guy who always has music on and a movie queued up. I'm all about good conversations, small adventures, and people who actually laugh at dumb jokes. If you're into swapping playlists or debating which movie deserves more love, we'll definitely get along.",
    interests: ["Music", "Movies", "Coffee", "Cooking", "Travel", "Photography"],
    gallery: [null, null, null, null, null, null],
    createdAt: "2024-03-15T10:00:00Z",
    conversationSince: "2024-09-03T14:22:00Z", // = chat.createdAt from Chat object
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calculateAge(dateOfBirth: string): number {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
}

function formatJoinDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function InfoPill({
    icon: Icon,
    label,
    color,
}: {
    icon: any;
    label: string;
    color: string;
}) {
    const { theme } = useTheme();
    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor: theme.cardBg,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 10,
            }}
        >
            <Icon size={14} color={color} strokeWidth={2.2} />
            <Text style={{ color: theme.text, fontSize: 13, fontWeight: "600" }}>
                {label}
            </Text>
        </View>
    );
}

function InterestTag({ label }: { label: string }) {
    const { theme } = useTheme();
    return (
        <View
            style={{
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 20,
                backgroundColor: theme.primary + "15",
                borderWidth: 1,
                borderColor: theme.primary + "30",
            }}
        >
            <Text style={{ color: theme.primary, fontSize: 12, fontWeight: "700" }}>
                {label}
            </Text>
        </View>
    );
}

function SectionTitle({ title }: { title: string }) {
    const { theme } = useTheme();
    return (
        <Text
            style={{
                color: theme.text,
                fontSize: 17,
                fontWeight: "900",
                letterSpacing: -0.4,
                marginBottom: 10,
            }}
        >
            {title}
        </Text>
    );
}

function Divider() {
    const { theme } = useTheme();
    return (
        <View
            style={{ height: 1, backgroundColor: theme.text + "12", marginVertical: 20 }}
        />
    );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function UserProfile() {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();

    // swap DUMMY_USER with real parsed user once backend is ready:
    // const { user: userRaw } = useLocalSearchParams<{ user: string }>();
    // const user = JSON.parse(userRaw);
    const user = DUMMY_USER;

    const age = calculateAge(user.dateOfBirth);
    const imageSize = (width - 40 - 8) / 3;

    return (
        <View style={{ flex: 1, backgroundColor: theme.rootBg }}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {/* ── Hero Image ── */}
                <View style={{ position: "relative" }}>
                    <Image
                        source={
                            user.image
                                ? { uri: user.image }
                                : require("@/assets/images/placeholder.png")
                        }
                        contentFit="cover"
                        transition={400}
                        style={{
                            width: "100%",
                            height: 400,
                            backgroundColor: theme.cardBg,
                        }}
                    />

                    {/* Fade into background */}
                    <View
                        style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: 80,
                            backgroundColor: theme.rootBg,
                            opacity: 0.6,
                        }}
                        pointerEvents="none"
                    />

                    {/* Back button */}
                    <Pressable
                        onPress={() => router.back()}
                        style={{
                            position: "absolute",
                            top: insets.top + 12,
                            left: 16,
                            width: 34,
                            height: 34,
                            borderRadius: 17,
                            backgroundColor: "#00000055",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <ChevronLeft color="#fff" size={20} strokeWidth={2.5} />
                    </Pressable>
                </View>

                {/* ── Content ── */}
                <View style={{ paddingHorizontal: 20, marginTop: 12 }}>
                    {/* Name + Age */}
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "baseline",
                            gap: 8,
                            marginBottom: 14,
                        }}
                    >
                        <Text
                            style={{
                                color: theme.text,
                                fontSize: 26,
                                fontWeight: "900",
                                letterSpacing: -0.8,
                            }}
                        >
                            {user.name}
                        </Text>
                        <Text
                            style={{
                                color: theme.text + "55",
                                fontSize: 22,
                                fontWeight: "400",
                            }}
                        >
                            {age}
                        </Text>
                    </View>

                    {/* Info Pills */}
                    <View
                        style={{
                            flexDirection: "row",
                            flexWrap: "wrap",
                            gap: 8,
                            marginBottom: 4,
                        }}
                    >
                        <InfoPill
                            icon={MapPin}
                            label={user.location}
                            color={theme.primary}
                        />
                        <InfoPill
                            icon={Briefcase}
                            label={user.occupation}
                            color="#818CF8"
                        />
                    </View>

                    <Divider />

                    {/* About */}
                    <SectionTitle title="About" />
                    <Text
                        style={{
                            color: theme.text + "CC",
                            fontSize: 14,
                            lineHeight: 22,
                        }}
                    >
                        {user.bio}
                    </Text>

                    <Divider />

                    {/* Interests */}
                    <SectionTitle title="Interests" />
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                        {user.interests.map((interest, i) => (
                            <InterestTag key={i} label={interest} />
                        ))}
                    </View>

                    <Divider />

                    {/* Gallery */}
                    {user.gallery.length > 0 && (
                        <>
                            <SectionTitle title="Gallery" />
                            <View
                                style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}
                            >
                                {user.gallery.map((uri, i) => (
                                    <Image
                                        key={i}
                                        source={
                                            uri
                                                ? { uri }
                                                : require("@/assets/images/placeholder.png")
                                        }
                                        contentFit="cover"
                                        style={{
                                            width: imageSize,
                                            height: imageSize,
                                            borderRadius: 8,
                                            backgroundColor: theme.cardBg,
                                        }}
                                    />
                                ))}
                            </View>
                            <Divider />
                        </>
                    )}

                    {/* Joined + Conversation since */}
                    <View style={{ gap: 8 }}>
                        <View
                            style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                        >
                            <CalendarDays
                                size={14}
                                color={theme.text + "40"}
                                strokeWidth={2}
                            />
                            <Text style={{ color: theme.text + "40", fontSize: 13 }}>
                                Member since {formatJoinDate(user.createdAt)}
                            </Text>
                        </View>
                        <View
                            style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                        >
                            <MessageCircle
                                size={14}
                                color={theme.text + "40"}
                                strokeWidth={2}
                            />
                            <Text style={{ color: theme.text + "40", fontSize: 13 }}>
                                Chatting since {formatJoinDate(user.conversationSince)}
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
