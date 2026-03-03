import BackWrapper from "@/components/backwrapper";
import { BtnText, Button } from "@/components/button";
import { useTheme } from "@/app/theme/context";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
    Animated,
    FlatList,
    Keyboard,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
    Dimensions,
} from "react-native";
import {
    Camera,
    ChefHat,
    Coffee,
    Dumbbell,
    Film,
    Music,
    Pencil,
    BookOpen,
    Mountain,
    Snowflake,
    Waves,
    Hash,
    ChessKnight,
    X,
    Search,
} from "lucide-react-native";

type InterestItem = {
    label: string;
    icon: React.ComponentType<{ size?: number; color?: string }>;
};

type InterestGroup = {
    title: string;
    items: string[];
};

const PINK = "#FF63A1";
const GREY_BORDER = "rgba(0,0,0,0.25)";
const GREY_TEXT = "rgba(0,0,0,0.75)";
const GREY_BG = "#FFFFFF";

const MIN = 6;
const MAX = 12;

// Base interests (no preselection!)
const INTERESTS: InterestItem[] = [
    { label: "Movie", icon: Film },
    { label: "Swimming", icon: Waves },
    { label: "Ski", icon: Snowflake },
    { label: "Gym", icon: Dumbbell },
    { label: "Reading Books", icon: BookOpen },
    { label: "Cooking", icon: ChefHat },
    { label: "Photography", icon: Camera },
    { label: "Hiking", icon: Mountain },
    { label: "Coffee", icon: Coffee },
    { label: "Art", icon: Pencil },
    { label: "Music", icon: Music },
    { label: "Chess", icon: ChessKnight },
];

// Groups for the popup (you can extend)
const GROUPS: InterestGroup[] = [
    { title: "Popular", items: INTERESTS.map((i) => i.label) },
    { title: "Sports", items: ["Swimming", "Gym", "Hiking", "Ski"] },
    { title: "Creative", items: ["Art", "Photography", "Music", "Movie"] },
];

function getIconForLabel(label: string) {
    const found = INTERESTS.find((x) => x.label.toLowerCase() === label.toLowerCase());
    return found?.icon ?? Hash; //
}

export default function Interests() {
    const { theme } = useTheme();

    const [selected, setSelected] = useState<string[]>([]);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [activeGroup, setActiveGroup] = useState<InterestGroup>(GROUPS[0]);

    const [errorOpen, setErrorOpen] = useState(false);

    const anim = useRef(new Animated.Value(0)).current;
    const screenH = Dimensions.get("window").height;

    const canContinue = selected.length >= MIN && selected.length <= MAX;

    const showError = () => setErrorOpen(true);
    const hideError = () => setErrorOpen(false);

    const toggleInterest = (label: string) => {
        setSelected((prev) => {
            const exists = prev.includes(label);

            if (exists) return prev.filter((x) => x !== label);

            // Trying to add new
            if (prev.length >= MAX) {
                showError();
                return prev;
            }

            return [...prev, label];
        });
    };

    const openSheet = () => {
        setSheetOpen(true);
        setQuery("");
        Animated.timing(anim, {
            toValue: 1,
            duration: 220,
            useNativeDriver: true,
        }).start();
    };

    const closeSheet = () => {
        Keyboard.dismiss();
        Animated.timing(anim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (finished) setSheetOpen(false);
        });
    };

    const sheetTranslateY = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [screenH, 0],
    });

    const filteredItems = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return activeGroup.items;

        const typed = query.trim();
        const inGroup = activeGroup.items.some((x) => x.toLowerCase() === q);
        const matches = activeGroup.items.filter((x) => x.toLowerCase().includes(q));

        // allow custom interest suggestion on top
        if (typed.length > 0 && !inGroup) return [typed, ...matches];
        return matches;
    }, [query, activeGroup]);

    const onContinue = () => {
        if (!canContinue) {
            showError();
            return;
        }
        router.push("/auth/register/password");
    };

    return (
        <BackWrapper>
            <View style={[styles.page, { backgroundColor: theme.background }]}>
                <Text style={[styles.title, { color: theme.text }]}>
                    Select your Interest
                </Text>

                <Text style={[styles.subtitle, { color: theme.text + "7A" }]}>
                    Pick 6 interests to match with users who have similar things in common
                </Text>

                {/* Search pill */}
                <Pressable
                    onPress={openSheet}
                    style={[
                        styles.searchPill,
                        { borderColor: GREY_BORDER, backgroundColor: "#fff" },
                    ]}
                >
                    <Search size={16} color="rgba(0,0,0,0.45)" />
                    <Text style={{ color: "rgba(0,0,0,0.45)", fontSize: 14 }}>
                        Search / Groups / Add your own
                    </Text>
                </Pressable>

                {/* Grid */}
                <View style={styles.grid}>
                    {INTERESTS.map(({ label, icon: Icon }) => {
                        const active = selected.includes(label);
                        return (
                            <Pressable
                                key={label}
                                onPress={() => toggleInterest(label)}
                                style={[
                                    styles.chip,
                                    {
                                        borderColor: active ? PINK : GREY_BORDER,
                                        backgroundColor: active ? PINK : GREY_BG,
                                    },
                                ]}
                            >
                                <Icon size={18} color={active ? "#fff" : "#000"} />
                                <Text
                                    style={[
                                        styles.chipText,
                                        { color: active ? "#fff" : "#000" },
                                    ]}
                                >
                                    {label}
                                </Text>
                            </Pressable>
                        );
                    })}

                    {/* show custom selected interests too */}
                    {selected
                        .filter((x) => !INTERESTS.some((i) => i.label === x))
                        .map((label) => {
                            const Icon = getIconForLabel(label);
                            return (
                                <Pressable
                                    key={label}
                                    onPress={() => toggleInterest(label)}
                                    style={[
                                        styles.chip,
                                        { borderColor: PINK, backgroundColor: PINK },
                                    ]}
                                >
                                    <Icon size={18} color="#fff" />
                                    <Text style={[styles.chipText, { color: "#fff" }]}>
                                        {label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                </View>

                {/* Continue */}
                <Button
                    style={[
                        styles.continueBtn,
                        {
                            marginTop: "auto",
                            marginBottom: 30,
                            backgroundColor: canContinue ? PINK : "rgba(0,0,0,0.15)",
                        },
                    ]}
                    onPress={onContinue}
                >
                    <BtnText>Continue</BtnText>
                </Button>

                {/* Bottom sheet */}
                <Modal visible={sheetOpen} transparent animationType="none">
                    <Pressable style={styles.backdrop} onPress={closeSheet} />

                    <Animated.View
                        style={[
                            styles.sheet,
                            {
                                transform: [{ translateY: sheetTranslateY }],
                                backgroundColor: theme.background,
                            },
                        ]}
                    >
                        <View style={styles.handle} />

                        <View style={styles.sheetHeader}>
                            <Text style={[styles.sheetTitle, { color: theme.text }]}>
                                Pick Interests
                            </Text>

                            <Pressable onPress={closeSheet} style={styles.closeBtn}>
                                <X size={18} color={theme.text} />
                            </Pressable>
                        </View>

                        {/* Groups */}
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.groupRow}
                            data={GROUPS}
                            keyExtractor={(g) => g.title}
                            renderItem={({ item }) => {
                                const active = item.title === activeGroup.title;
                                return (
                                    <Pressable
                                        onPress={() => {
                                            setActiveGroup(item);
                                            setQuery("");
                                        }}
                                        style={[
                                            styles.groupPill,
                                            {
                                                borderColor: GREY_BORDER,
                                                backgroundColor: active ? PINK : "#fff",
                                            },
                                        ]}
                                    >
                                        <Text
                                            style={{
                                                color: active ? "#fff" : "#000",
                                                fontWeight: "600",
                                                fontSize: 13,
                                            }}
                                        >
                                            {item.title}
                                        </Text>
                                    </Pressable>
                                );
                            }}
                        />

                        {/* Search / Add */}
                        <View
                            style={[
                                styles.searchBox,
                                { borderColor: GREY_BORDER, backgroundColor: "#fff" },
                            ]}
                        >
                            <TextInput
                                value={query}
                                onChangeText={setQuery}
                                placeholder="Type your interest…"
                                placeholderTextColor="rgba(0,0,0,0.45)"
                                style={styles.searchInput}
                                returnKeyType="done"
                                onSubmitEditing={() => {
                                    const t = query.trim();
                                    if (!t) return;

                                    toggleInterest(t);
                                    setQuery("");
                                }}
                            />
                            {query.length > 0 ? (
                                <Pressable
                                    onPress={() => setQuery("")}
                                    style={styles.clearX}
                                >
                                    <X size={16} color="rgba(0,0,0,0.55)" />
                                </Pressable>
                            ) : null}
                        </View>

                        {/* Items */}
                        <FlatList
                            data={filteredItems}
                            keyExtractor={(x) => x}
                            keyboardShouldPersistTaps="handled"
                            contentContainerStyle={{ paddingBottom: 110 }}
                            renderItem={({ item }) => {
                                const active = selected.includes(item);
                                const Icon = getIconForLabel(item);

                                return (
                                    <Pressable
                                        onPress={() => toggleInterest(item)}
                                        style={[
                                            styles.sheetRow,
                                            {
                                                borderColor: "rgba(0,0,0,0.08)",
                                                backgroundColor: active
                                                    ? "rgba(255,99,161,0.12)"
                                                    : "transparent",
                                            },
                                        ]}
                                    >
                                        <Icon
                                            size={18}
                                            color={active ? PINK : "rgba(0,0,0,0.75)"}
                                        />
                                        <Text
                                            style={{
                                                color: GREY_TEXT,
                                                fontSize: 16,
                                                flex: 1,
                                                marginLeft: 10,
                                            }}
                                        >
                                            {item}
                                        </Text>
                                        <View
                                            style={[
                                                styles.checkDot,
                                                {
                                                    backgroundColor: active
                                                        ? PINK
                                                        : "rgba(0,0,0,0.12)",
                                                },
                                            ]}
                                        />
                                    </Pressable>
                                );
                            }}
                        />

                        <View style={styles.sheetBottom}>
                            <Button onPress={closeSheet}>
                                <BtnText>Select</BtnText>
                            </Button>
                        </View>
                    </Animated.View>
                </Modal>

                {/* Error popup */}
                <Modal visible={errorOpen} transparent animationType="fade">
                    <Pressable style={styles.errorBackdrop} onPress={hideError} />
                    <View style={styles.errorCard}>
                        <Text style={styles.errorTitle}>Selection limit</Text>
                        <Text style={styles.errorText}>
                            Please choose minimum {MIN} and maximum {MAX} interests.
                        </Text>
                        <Pressable style={styles.errorOk} onPress={hideError}>
                            <Text style={styles.errorOkText}>OK</Text>
                        </Pressable>
                    </View>
                </Modal>
            </View>
        </BackWrapper>
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        flexDirection: "column",
        width: "100%",
        height: "100%",
        paddingHorizontal: 24,
        paddingTop: 35,
    },

    title: {
        fontSize: 34,
        fontWeight: "800",
    },
    subtitle: {
        marginTop: 10,
        fontSize: 16,
        lineHeight: 22,
    },

    searchPill: {
        marginTop: 18,
        height: 40,
        borderRadius: 20,
        borderWidth: 1.5,
        paddingHorizontal: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        alignSelf: "flex-start",
    },

    grid: {
        marginTop: 24,
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 14,
    },

    chip: {
        borderWidth: 1.5,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 10,
        minWidth: 90,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        justifyContent: "center",
    },
    chipText: {
        fontSize: 16,
        fontWeight: "600",
    },

    continueBtn: {
        width: "100%",
    },

    // Sheet
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.35)",
    },
    sheet: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 18,
        paddingTop: 10,
        minHeight: "72%",
    },
    handle: {
        width: 44,
        height: 5,
        borderRadius: 999,
        backgroundColor: "#fff",
        alignSelf: "center",
        marginBottom: 10,
    },
    sheetHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 4,
    },
    sheetTitle: {
        fontSize: 22,
        fontWeight: "800",
    },
    closeBtn: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.12)",
        backgroundColor: "#fff",
    },

    groupRow: {
        paddingVertical: 14,
        gap: 10,
        paddingHorizontal: 4,
    },
    groupPill: {
        height: 36,
        borderRadius: 18,
        paddingHorizontal: 14,
        borderWidth: 1.5,
        alignItems: "center",
        justifyContent: "center",
    },

    searchBox: {
        height: 44,
        borderRadius: 22,
        borderWidth: 1.5,
        paddingHorizontal: 14,
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 4,
        marginBottom: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: "#000",
    },
    clearX: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
    },

    sheetRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 6,
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    checkDot: {
        width: 18,
        height: 18,
        borderRadius: 9,
    },

    sheetBottom: {
        position: "absolute",
        left: 18,
        right: 18,
        bottom: 24,
    },

    // Error modal
    errorBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.35)",
    },
    errorCard: {
        position: "absolute",
        left: 24,
        right: 24,
        top: "40%",
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 18,
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#000",
    },
    errorText: {
        marginTop: 8,
        fontSize: 14,
        color: "rgba(0,0,0,0.7)",
        lineHeight: 20,
    },
    errorOk: {
        marginTop: 14,
        alignSelf: "flex-end",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: PINK,
    },
    errorOkText: {
        color: "#fff",
        fontWeight: "800",
    },
});
