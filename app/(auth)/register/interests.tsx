import BackWrapper from "@/components/backwrapper";
import { BtnText, Button } from "@/components/button";
import { useTheme } from "@/lib/theme/context";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from "react-native";
import { Theme } from "@/lib/theme/theme";
import { BlurTint, BlurView } from "expo-blur";

type Activity = { id: string | number; name: string };
type ActivitiesByTitle = Record<string, Activity[]>;

const MIN = 3;
const MAX = 12;

export default function Interests() {
    const renderCount = useRef(0);
    renderCount.current++;
    console.log(`interests rendered: ${renderCount.current} times`);

    const { theme, gs } = useTheme();
    const styles = makeStyles(theme);

    useEffect(() => {
        router.prefetch("/register/addProfilePicture");
    }, []);

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<ActivitiesByTitle>({});
    const [selected, setSelected] = useState<(string | number)[]>([]);
    const [errorOpen, setErrorOpen] = useState(false);
    const tintColor = useColorScheme()?.toString();

    const canContinue = selected.length >= MIN && selected.length <= MAX;

    const toggleId = (id: string | number) => {
        setSelected((prev) => {
            const exists = prev.includes(id);
            if (exists) return prev.filter((x) => x !== id);

            if (prev.length >= MAX) {
                setErrorOpen(true);
                return prev;
            }
            return [...prev, id];
        });
    };

    const onContinue = () => {
        if (!canContinue) {
            setErrorOpen(true);
            return;
        }
        router.push("/register/addProfilePicture");
    };

    useEffect(() => {
        const t = setTimeout(() => {
            setData({
                Sports: [
                    { id: 1, name: "Gym" },
                    { id: 2, name: "Swimming" },
                    { id: 3, name: "Ski" },
                    { id: 4, name: "Hiking" },
                    { id: 5, name: "Running" },
                    { id: 6, name: "Cycling" },
                ],
                Arts: [
                    { id: 10, name: "Music" },
                    { id: 11, name: "Art" },
                    { id: 12, name: "Photography" },
                    { id: 13, name: "Film" },
                    { id: 14, name: "Writing" },
                ],
                dumb: [
                    { id: 15, name: "Gym" },
                    { id: 21, name: "Swimming" },
                    { id: 31, name: "Ski" },
                    { id: 41, name: "Hiking" },
                    { id: 51, name: "Running" },
                    { id: 61, name: "Cycling" },
                ],
                grey: [
                    { id: 22, name: "Music" },
                    { id: 23, name: "Art" },
                    { id: 24, name: "Photography" },
                    { id: 25, name: "Film" },
                    { id: 26, name: "Writing" },
                ],
                play: [
                    { id: 80, name: "Gym" },
                    { id: 27, name: "Swimming" },
                    { id: 33, name: "Ski" },
                    { id: 43, name: "Hiking" },
                    { id: 53, name: "Running" },
                    { id: 63, name: "Cycling" },
                ],
                game: [
                    { id: 103, name: "Music" },
                    { id: 112, name: "Art" },
                    { id: 122, name: "Photography" },
                    { id: 132, name: "Film" },
                    { id: 142, name: "Writing" },
                ],
            });
            setLoading(false);
        }, 900);

        return () => clearTimeout(t);
    }, []);

    return (
        <BackWrapper>
            <View style={styles.page}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={[gs.h1, { marginTop: 35 }]}>Select your Interests </Text>

                    <Text
                        style={[gs.bodyText, { marginTop: 10, color: theme.text + "54" }]}
                    >
                        Pick 6 interests to match with users who have similar things in
                        common
                    </Text>

                    <View style={styles.scrollArea}>
                        {loading ? (
                            <>
                                <View style={styles.section}>
                                    <View
                                        style={[
                                            styles.skeletonTitle,
                                            { backgroundColor: theme.text + "22" },
                                        ]}
                                    />
                                    <View
                                        style={[
                                            styles.divider,
                                            { backgroundColor: theme.text + "22" },
                                        ]}
                                    />
                                    <View style={styles.wrap}>
                                        {Array.from({ length: 10 }).map((_, i) => (
                                            <View
                                                key={`sk-a-${i}`}
                                                style={[
                                                    styles.skeletonChip,
                                                    {
                                                        backgroundColor:
                                                            theme.text + "22",
                                                    },
                                                ]}
                                            />
                                        ))}
                                    </View>
                                </View>

                                <View style={styles.section}>
                                    <View
                                        style={[
                                            styles.skeletonTitle,
                                            { backgroundColor: theme.text + "22" },
                                        ]}
                                    />
                                    <View
                                        style={[
                                            styles.divider,
                                            { backgroundColor: theme.text + "22" },
                                        ]}
                                    />
                                    <View style={styles.wrap}>
                                        {Array.from({ length: 8 }).map((_, i) => (
                                            <View
                                                key={`sk-b-${i}`}
                                                style={[
                                                    styles.skeletonChip,
                                                    {
                                                        backgroundColor:
                                                            theme.text + "22",
                                                    },
                                                ]}
                                            />
                                        ))}
                                    </View>
                                </View>

                                <View style={styles.section}>
                                    <View
                                        style={[
                                            styles.skeletonTitle,
                                            { backgroundColor: theme.text + "22" },
                                        ]}
                                    />
                                    <View
                                        style={[
                                            styles.divider,
                                            { backgroundColor: theme.text + "22" },
                                        ]}
                                    />
                                    <View style={styles.wrap}>
                                        {Array.from({ length: 12 }).map((_, i) => (
                                            <View
                                                key={`sk-c-${i}`}
                                                style={[
                                                    styles.skeletonChip,
                                                    {
                                                        backgroundColor:
                                                            theme.text + "22",
                                                    },
                                                ]}
                                            />
                                        ))}
                                    </View>
                                </View>
                            </>
                        ) : (
                            Object.entries(data).map(([title, items]) => (
                                <View key={title} style={styles.section}>
                                    <Text
                                        style={[
                                            styles.sectionTitle,
                                            { color: theme.text },
                                        ]}
                                    >
                                        {title}
                                    </Text>

                                    <View
                                        style={[
                                            styles.divider,
                                            { backgroundColor: theme.text + "22" },
                                        ]}
                                    />

                                    <View style={styles.wrap}>
                                        {items.map((a) => {
                                            const active = selected.includes(a.id);

                                            return (
                                                <Pressable
                                                    key={String(a.id)}
                                                    onPress={() => toggleId(a.id)}
                                                    style={[
                                                        styles.chip,
                                                        {
                                                            borderColor: active
                                                                ? theme.primary
                                                                : theme.text + "22",
                                                            backgroundColor: active
                                                                ? theme.primary
                                                                : theme.background,
                                                        },
                                                    ]}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.chipText,
                                                            {
                                                                color: active
                                                                    ? "#fff"
                                                                    : theme.text,
                                                            },
                                                        ]}
                                                    >
                                                        {a.name}
                                                    </Text>
                                                </Pressable>
                                            );
                                        })}
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                </ScrollView>
                <Button
                    style={{ marginTop: "auto", width: "100%", alignSelf: "stretch" }}
                    disabled={!canContinue}
                    onPress={onContinue}
                >
                    <BtnText>Continue</BtnText>
                </Button>

                {errorOpen ? (
                    <Pressable
                        style={styles.errorWrap}
                        onPress={() => setErrorOpen(false)}
                    >
                        <BlurView
                            intensity={50}
                            tint={(tintColor as BlurTint) || "dark"}
                            style={[styles.errorCard]}
                        >
                            <Text style={[styles.errorTitle, { color: theme.text }]}>
                                Selection limit
                            </Text>
                            <Text
                                style={[styles.errorText, { color: theme.text + "B3" }]}
                            >
                                Please choose minimum {MIN} and maximum {MAX} interests.
                            </Text>
                            <Pressable
                                style={[
                                    styles.errorOk,
                                    { backgroundColor: theme.primary },
                                ]}
                                onPress={() => setErrorOpen(false)}
                            >
                                <Text style={styles.errorOkText}>OK</Text>
                            </Pressable>
                        </BlurView>
                    </Pressable>
                ) : null}
            </View>
        </BackWrapper>
    );
}

const makeStyles = (theme: Theme) =>
    StyleSheet.create({
        page: {
            flex: 1,
            width: "100%",
            height: "100%",
        },

        scrollArea: {
            flex: 1,
            marginTop: 18,
        },

        scrollContent: {
            paddingBottom: 24,
        },

        section: {
            marginBottom: 18,
        },

        sectionTitle: {
            fontSize: 16,
            fontWeight: "800",
        },

        divider: {
            height: 1.5,
            width: "100%",
            marginTop: 8,
            marginBottom: 12,
            borderRadius: 999,
        },

        wrap: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 10,
        },

        chip: {
            borderWidth: 1.5,
            borderRadius: 12,
            paddingHorizontal: 10,
            paddingVertical: 8,
            minWidth: 78,
            alignItems: "center",
            justifyContent: "center",
        },

        chipText: {
            fontSize: 14,
            fontWeight: "600",
        },

        skeletonTitle: {
            width: 140,
            height: 16,
            borderRadius: 6,
        },

        skeletonChip: {
            width: 90,
            height: 34,
            borderRadius: 12,
        },

        errorWrap: {
            ...StyleSheet.absoluteFillObject,
            justifyContent: "center",
            paddingHorizontal: 24,
        },

        errorCard: {
            borderRadius: 16,
            padding: 18,
            overflow: "hidden",
            backgroundColor: theme.background + "CC",
            borderWidth: 1,
            borderColor: theme.base + "80",
        },
        errorTitle: { fontSize: 18, fontWeight: "800" },
        errorText: { marginTop: 8, fontSize: 14, lineHeight: 20 },
        errorOk: {
            marginTop: 14,
            alignSelf: "flex-end",
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 10,
        },
        errorOkText: { color: "#fff", fontWeight: "800" },
    });
