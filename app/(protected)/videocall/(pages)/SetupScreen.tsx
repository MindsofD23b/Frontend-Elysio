import { useState, useMemo } from "react";
import { createT } from "@/i18n";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme/context";
import { Theme } from "@/lib/theme/theme";
import BackWrapper from "@/components/backwrapper";
import { BtnText, Button } from "@/components/button";
import { ArrowRightIcon, Check } from "lucide-react-native";

const t = createT("videocall.setup");

function getCameras() {
    return [
        { id: "front", label: t("frontCamera") },
        { id: "back", label: t("backCamera") },
    ];
}
function getMicrophones() {
    return [
        { id: "default", label: t("builtInMic") },
        { id: "headset", label: t("headsetMic") },
    ];
}
const INTERESTS = [
    "Music",
    "Travel",
    "Gaming",
    "Fitness",
    "Art",
    "Photography",
    "Movies",
    "Cooking",
    "Tech",
    "Books",
    "Hiking",
    "Fashion",
    "Sports",
    "Design",
    "Languages",
];

interface Props {
    onConnect: (camera: string, mic: string, interests: string[]) => void;
    onTestStreak?: () => void;
}

export function SetupScreen({ onConnect, onTestStreak }: Props) {
    const CAMERAS = getCameras();
    const MICROPHONES = getMicrophones();
    const [selectedCamera, setSelectedCamera] = useState(CAMERAS[0].id);
    const [selectedMic, setSelectedMic] = useState(MICROPHONES[0].id);
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const { theme } = useTheme();
    const s = useMemo(() => makeStyles(theme), [theme]);

    function toggleInterest(interest: string) {
        setSelectedInterests((prev) =>
            prev.includes(interest)
                ? prev.filter((i) => i !== interest)
                : [...prev, interest],
        );
    }

    return (
        <BackWrapper m>
            <ScrollView
                contentContainerStyle={s.scroll}
                showsVerticalScrollIndicator={false}
            >
                <View style={s.header}>
                    <Text style={s.title}>{t("title")}</Text>
                    <Text style={s.subtitle}>{t("subtitle")}</Text>
                </View>

                {/* Camera */}
                <View style={s.section}>
                    <View style={s.sectionHeader}>
                        <Ionicons name="videocam-outline" size={16} color="#888" />
                        <Text style={s.sectionLabel}>{t("camera")}</Text>
                    </View>
                    <View style={s.pillRow}>
                        {CAMERAS.map((cam) => (
                            <Pressable
                                key={cam.id}
                                style={[
                                    s.pill,
                                    selectedCamera === cam.id && s.pillActive,
                                ]}
                                onPress={() => setSelectedCamera(cam.id)}
                            >
                                <Text
                                    style={[
                                        s.pillText,
                                        selectedCamera === cam.id && s.pillTextActive,
                                    ]}
                                >
                                    {cam.label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                {/* Microphone */}
                <View style={s.section}>
                    <View style={s.sectionHeader}>
                        <Feather name="mic" size={15} color="#888" />
                        <Text style={s.sectionLabel}>{t("microphone")}</Text>
                    </View>
                    <View style={s.pillRow}>
                        {MICROPHONES.map((mic) => (
                            <Pressable
                                key={mic.id}
                                style={[s.pill, selectedMic === mic.id && s.pillActive]}
                                onPress={() => setSelectedMic(mic.id)}
                            >
                                <Text
                                    style={[
                                        s.pillText,
                                        selectedMic === mic.id && s.pillTextActive,
                                    ]}
                                >
                                    {mic.label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                {/* Interests */}
                <View style={s.section}>
                    <View style={s.sectionHeader}>
                        <Ionicons name="sparkles-outline" size={16} color="#888" />
                        <Text style={s.sectionLabel}>
                            {t("interests")}{" "}
                            <Text style={s.sectionLabelMuted}>
                                {t("interestsMatchHint")}
                            </Text>
                        </Text>
                    </View>
                    <View style={s.interestGrid}>
                        {INTERESTS.map((interest) => {
                            const active = selectedInterests.includes(interest);
                            return (
                                <Pressable
                                    key={interest}
                                    style={[s.interestTag, active && s.interestTagActive]}
                                    onPress={() => toggleInterest(interest)}
                                >
                                    {active && (
                                        <Check
                                            size={14}
                                            color="#fff"
                                            style={{ marginRight: 6 }}
                                        />
                                    )}
                                    <Text
                                        style={[
                                            s.interestText,
                                            active && s.interestTextActive,
                                        ]}
                                    >
                                        {interest}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                <Button
                    onPress={() =>
                        onConnect(selectedCamera, selectedMic, selectedInterests)
                    }
                >
                    <BtnText>{t("findMatch")}</BtnText>
                    <ArrowRightIcon size={18} color="#fff" />
                </Button>

                {onTestStreak && (
                    <Pressable
                        onPress={onTestStreak}
                        style={{
                            marginTop: 10,
                            alignItems: "center",
                            paddingVertical: 10,
                        }}
                    >
                        <Text style={{ color: theme.text + "55", fontSize: 12 }}>
                            {t("devTestStreak")}
                        </Text>
                    </Pressable>
                )}
            </ScrollView>
        </BackWrapper>
    );
}

const makeStyles = (theme: Theme) =>
    StyleSheet.create({
        scroll: { paddingBottom: 48 },
        header: { marginBottom: 36 },
        title: {
            color: theme.text,
            fontSize: 28,
            fontWeight: "700",
            letterSpacing: -0.5,
            marginBottom: 6,
        },
        subtitle: { color: "#777", fontSize: 15 },
        section: { marginBottom: 28 },
        sectionHeader: {
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginBottom: 12,
        },
        sectionLabel: {
            color: "#bbb",
            fontSize: 13,
            fontWeight: "600",
            letterSpacing: 0.3,
            textTransform: "uppercase",
        },
        sectionLabelMuted: {
            color: "#555",
            fontWeight: "400",
            textTransform: "none",
            fontSize: 12,
        },
        pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
        pill: {
            paddingHorizontal: 14,
            paddingVertical: 9,
            borderRadius: 10,
            backgroundColor: theme.dbase,
            borderWidth: 1,
            borderColor: theme.accent,
        },
        pillActive: { backgroundColor: theme.primary, borderColor: theme.primary },
        pillText: { color: theme.accent, fontSize: 14, fontWeight: "500" },
        pillTextActive: { color: theme.background },
        interestGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
        interestTag: {
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 13,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor: theme.dbase,
            borderWidth: 1,
            borderColor: theme.accent,
        },
        interestTagActive: { backgroundColor: theme.primary, borderColor: theme.primary },
        interestText: { color: theme.accent, fontSize: 14, fontWeight: "500" },
        interestTextActive: { color: theme.background },
        cta: {
            marginTop: "auto",
            backgroundColor: theme.primary,
            borderRadius: 16,
            paddingVertical: 16,
            paddingHorizontal: 24,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
        },
    });
