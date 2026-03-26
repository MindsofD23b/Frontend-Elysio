import BackWrapper from "@/components/backwrapper";
import { BtnText, Button, Loader } from "@/components/button";
import { useTheme } from "@/lib/theme/context";
import { router } from "expo-router";
import { useState } from "react";
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
import { useFetch } from "@/hooks";
import { useRegisterStore } from "@/utils/registerStore";
import { I18n } from "i18n-js";

type InterestItem = {
    id: string;
    name: string;
};

type ActivitiesByTitle = Record<string, InterestItem[]>;

const MIN = 3;
const MAX = 12;

export default function Interests() {
    const i18n = new I18n();
    const t = (key: string, options?: Record<string, unknown>) =>
        i18n.t(`settings.${key}`, options);
    const { theme, gs } = useTheme();
    const styles = makeStyles(theme);
    const tintColor = useColorScheme()?.toString();

    const { data: registerData, setInterests } = useRegisterStore();

    const [selected, setSelected] = useState<string[]>(registerData.interests || []);
    const [errorOpen, setErrorOpen] = useState(false);

    const [data, loading, fetchError] = useFetch<ActivitiesByTitle>("/interests", {
        method: "GET",
    });

    const canContinue = selected.length >= MIN && selected.length <= MAX;

    const toggleId = (id: string) => {
        setSelected((prev) => {
            const exists = prev.includes(id);

            if (exists) {
                return prev.filter((x) => x !== id);
            }

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

        setInterests(selected);
        router.push("/register/addProfileData");
    };

    return (
        <BackWrapper>
            <View style={styles.page}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={[gs.h1, { marginTop: 35 }]}>Select your Interests</Text>

                    <Text
                        style={[gs.bodyText, { marginTop: 10, color: theme.text + "54" }]}
                    >
                        Pick between {MIN} and {MAX} interests to match with users who
                        have similar things in common
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
                        ) : fetchError ? (
                            <View style={{ marginTop: 24 }}>
                                <Text style={{ color: "red", fontSize: 14 }}>
                                    {fetchError instanceof Error
                                        ? fetchError.message
                                        : "Failed to load interests"}
                                </Text>
                            </View>
                        ) : (
                            Object.entries(data || {}).map(([title, items]) => (
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
                                        {items.map((item) => {
                                            const active = selected.includes(item.id);

                                            return (
                                                <Pressable
                                                    key={item.id}
                                                    onPress={() => toggleId(item.id)}
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
                                                        {item.name}
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
                    disabled={!canContinue || loading}
                    onPress={onContinue}
                >
                    {loading ? <Loader /> : <BtnText>Continue</BtnText>}
                </Button>

                {errorOpen ? (
                    <Pressable
                        style={styles.errorWrap}
                        onPress={() => setErrorOpen(false)}
                    >
                        <BlurView
                            intensity={50}
                            tint={(tintColor as BlurTint) || "dark"}
                            style={styles.errorCard}
                        >
                            <Text style={[styles.errorTitle, { color: theme.text }]}>
                                {t("errorTitle")}
                            </Text>
                            <Text
                                style={[styles.errorText, { color: theme.text + "B3" }]}
                            >
                                {t("errorBody", { min: MIN, max: MAX })}
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

        errorTitle: {
            fontSize: 18,
            fontWeight: "800",
        },

        errorText: {
            marginTop: 8,
            fontSize: 14,
            lineHeight: 20,
        },

        errorOk: {
            marginTop: 14,
            alignSelf: "flex-end",
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 10,
        },

        errorOkText: {
            color: "#fff",
            fontWeight: "800",
        },
    });
