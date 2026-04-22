// Made with the help of Claude.ai and ChatGPT

import { useTheme } from "@/lib/theme/context";
import { LucideIcon } from "lucide-react-native";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type DateIdea = {
    title: string;
    desc: string;
    price: string;
    duration: string;
};

type Props = {
    label: string;
    icon: LucideIcon;
    ideas: DateIdea[];
    onPress: () => void;
};

export function CategoryGridCard({ label, icon: Icon, onPress }: Props) {
    const { theme } = useTheme();

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.card,
                {
                    backgroundColor: theme.background,
                    borderColor: theme.text + "18",
                },
                pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] },
            ]}
        >
            <Icon size={28} color={theme.primary} strokeWidth={2} />
            <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
        </Pressable>
    );
}

type IdeaListProps = {
    ideas: DateIdea[];
};

export function DateIdeaList({ ideas }: IdeaListProps) {
    const { theme } = useTheme();
    const visible = ideas.slice(0, 3);
    const locked = ideas.slice(3);

    return (
        <View style={styles.listWrap}>
            {/* Visible ideas */}
            {visible.map((idea, i) => (
                <IdeaCard key={i} idea={idea} theme={theme} />
            ))}

            {/* Locked ideas with blur overlay */}
            {locked.length > 0 && (
                <View style={styles.lockedWrap}>
                    <View style={{ gap: 10, opacity: 0.0, pointerEvents: "none" }}>
                        {locked.map((idea, i) => (
                            <IdeaCard key={i} idea={idea} theme={theme} />
                        ))}
                    </View>

                    {/* Overlay  */}
                    <Pressable
                        style={[
                            styles.blurOverlay,
                            { backgroundColor: theme.background + "CC" },
                        ]}
                        onPress={() => router.push("../(protected)/subscriptions")}
                    >
                        <View
                            style={[
                                styles.premiumBadge,
                                { backgroundColor: theme.primary },
                            ]}
                        >
                            <Text style={styles.premiumBadgeText}>✦ PREMIUM</Text>
                        </View>
                        <Text style={styles.premiumTitle}>Buy Premium</Text>
                        <Text style={styles.premiumSub}>Unlock more ideas</Text>
                    </Pressable>
                </View>
            )}
        </View>
    );
}

function IdeaCard({ idea, theme }: { idea: DateIdea; theme: any }) {
    return (
        <View
            style={[
                styles.ideaCard,
                { backgroundColor: theme.text + "08", borderColor: theme.text + "15" },
            ]}
        >
            <View style={styles.ideaTop}>
                <Text style={[styles.ideaTitle, { color: theme.text }]} numberOfLines={1}>
                    {idea.title}
                </Text>
                <Text style={[styles.ideaPrice, { color: theme.primary }]}>
                    {idea.price}
                </Text>
            </View>
            <Text
                style={[styles.ideaDesc, { color: theme.text + "88" }]}
                numberOfLines={2}
            >
                {idea.desc}
            </Text>
            <Text style={[styles.ideaDuration, { color: theme.text + "55" }]}>
                ⏱ {idea.duration}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    // Grid card
    card: {
        flex: 1,
        borderRadius: 18,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        paddingHorizontal: 8,
        gap: 10,
    },
    iconWrap: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    label: {
        fontSize: 12,
        fontWeight: "700",
        textAlign: "center",
        letterSpacing: 0.2,
    },

    // Idea list
    listWrap: {
        gap: 10,
    },
    ideaCard: {
        borderRadius: 14,
        borderWidth: 1,
        padding: 14,
        gap: 5,
    },
    ideaTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 8,
    },
    ideaTitle: {
        fontSize: 15,
        fontWeight: "700",
        flex: 1,
    },
    ideaPrice: {
        fontSize: 13,
        fontWeight: "700",
    },
    ideaDesc: {
        fontSize: 13,
        lineHeight: 18,
    },
    ideaDuration: {
        fontSize: 12,
        marginTop: 2,
    },

    // Locked / premium
    lockedWrap: {
        borderRadius: 16,
        overflow: "hidden",
        gap: 10,
        minHeight: 120,
    },
    blurOverlay: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    premiumInner: {
        alignItems: "center",
        gap: 6,
    },
    premiumBadge: {
        paddingHorizontal: 14,
        paddingVertical: 5,
        borderRadius: 50,
        marginBottom: 4,
    },
    premiumBadgeText: {
        color: "#fff",
        fontSize: 11,
        fontWeight: "800",
        letterSpacing: 1,
    },
    premiumTitle: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "900",
        letterSpacing: -0.3,
    },
    premiumSub: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 13,
    },
});
