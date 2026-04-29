import { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    TextInput,
    Image,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme/context";
import { Theme } from "@/lib/theme/theme";

interface ReportedUser {
    id: string;
    name: string;
    avatarUrl?: string;
}

interface Props {
    user: ReportedUser;
    onBack: () => void;
    onSubmit?: (reason: string, block: boolean) => void;
}

const REPORT_REASONS = [
    "Inappropriate behaviour",
    "Explicit content",
    "Harassment or bullying",
    "Hate speech",
    "Illegal activities",
    "Spam or scam",
    "Underage user",
    "Impersonation",
];

export default function ReportUser({ user, onBack, onSubmit }: Props) {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [customText, setCustomText] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const reportText = customText.trim() || selectedReason || "";

    function handleChip(reason: string) {
        setSelectedReason((prev) => (prev === reason ? null : reason));
        setCustomText((prev) =>
            prev.trim() === "" || REPORT_REASONS.includes(prev.trim()) ? reason : prev,
        );
    }

    async function handleSubmit(andBlock: boolean) {
        if (!reportText) {
            Alert.alert(
                "Missing reason",
                "Please select or describe the reason for your report.",
            );
            return;
        }
        setSubmitting(true);
        try {
            onSubmit?.(reportText, andBlock);
            Alert.alert(
                andBlock ? "Reported & Blocked" : "Report Submitted",
                andBlock
                    ? `${user.name} has been reported and blocked.`
                    : `Your report has been submitted. We'll review it shortly.`,
                [{ text: "OK", onPress: onBack }],
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <SafeAreaView style={styles.safe}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <View style={styles.header}>
                    <Pressable style={styles.backBtn} onPress={onBack} hitSlop={10}>
                        <Ionicons name="arrow-back" size={22} color={theme.text} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Report</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.userCard}>
                        <View style={styles.avatarWrapper}>
                            {user.avatarUrl ? (
                                <Image
                                    source={{ uri: user.avatarUrl }}
                                    style={styles.avatar}
                                />
                            ) : (
                                <View style={[styles.avatar, styles.avatarFallback]}>
                                    <Text style={styles.avatarInitial}>
                                        {user.name.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                            )}
                            <View style={styles.reportBadge}>
                                <Ionicons name="flag" size={10} color={theme.white} />
                            </View>
                        </View>
                        <View style={styles.userInfo}>
                            <Text style={styles.reportingLabel}>You are reporting</Text>
                            <Text style={styles.userName}>{user.name}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.sectionLabel}>What is the issue?</Text>
                    <View style={styles.chipsGrid}>
                        {REPORT_REASONS.map((reason) => (
                            <Pressable
                                key={reason}
                                style={[
                                    styles.chip,
                                    selectedReason === reason && styles.chipSelected,
                                ]}
                                onPress={() => handleChip(reason)}
                            >
                                <Text
                                    style={[
                                        styles.chipText,
                                        selectedReason === reason &&
                                            styles.chipTextSelected,
                                    ]}
                                >
                                    {reason}
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    <Text style={styles.sectionLabel}>Add more detail (optional)</Text>
                    <TextInput
                        style={styles.textArea}
                        placeholder="Describe what happened…"
                        placeholderTextColor={theme.grayscale}
                        multiline
                        numberOfLines={5}
                        textAlignVertical="top"
                        value={customText}
                        onChangeText={setCustomText}
                        maxLength={500}
                    />
                    <Text style={styles.charCount}>{customText.length}/500</Text>

                    <View style={styles.noteBox}>
                        <Ionicons
                            name="shield-checkmark-outline"
                            size={14}
                            color={theme.grayscale}
                            style={{ marginTop: 1 }}
                        />
                        <Text style={styles.noteText}>
                            Reports are anonymous. Our team reviews every report within 24
                            hours.
                        </Text>
                    </View>

                    <View style={styles.actions}>
                        <Pressable
                            style={[styles.btnSubmit, submitting && styles.btnDisabled]}
                            onPress={() => handleSubmit(false)}
                            disabled={submitting}
                        >
                            <Text style={styles.btnSubmitText}>Submit report</Text>
                        </Pressable>

                        <Pressable
                            style={[styles.btnBlock, submitting && styles.btnDisabled]}
                            onPress={() => handleSubmit(true)}
                            disabled={submitting}
                        >
                            <Ionicons
                                name="ban-outline"
                                size={16}
                                color="#df1d1d"
                                style={{ marginRight: 7 }}
                            />
                            <Text style={styles.btnBlockText}>Submit & Block</Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const makeStyles = (theme: Theme) =>
    StyleSheet.create({
        safe: {
            flex: 1,
            backgroundColor: theme.background,
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: theme.background,
            borderBottomWidth: 1,
            borderBottomColor: theme.base + "14",
        },
        backBtn: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: theme.base + "10",
            alignItems: "center",
            justifyContent: "center",
        },
        headerTitle: {
            fontSize: 17,
            fontWeight: "700",
            color: theme.text,
            letterSpacing: 0.2,
        },
        scroll: {
            paddingHorizontal: 20,
            paddingTop: 24,
            paddingBottom: 40,
        },
        userCard: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: theme.base + "08",
            borderRadius: 18,
            padding: 16,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: theme.base + "14",
        },
        avatarWrapper: {
            position: "relative",
            marginRight: 14,
        },
        avatar: {
            width: 58,
            height: 58,
            borderRadius: 29,
        },
        avatarFallback: {
            backgroundColor: theme.primary + "22",
            alignItems: "center",
            justifyContent: "center",
        },
        avatarInitial: {
            fontSize: 22,
            fontWeight: "700",
            color: theme.primary,
        },
        reportBadge: {
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: "#df1d1d",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 2,
            borderColor: theme.background,
        },
        userInfo: {
            flex: 1,
        },
        reportingLabel: {
            fontSize: 11,
            color: theme.grayscale,
            fontWeight: "500",
            marginBottom: 3,
            textTransform: "uppercase",
            letterSpacing: 0.7,
        },
        userName: {
            fontSize: 18,
            fontWeight: "700",
            color: theme.text,
        },
        divider: {
            height: 1,
            backgroundColor: theme.base + "14",
            marginBottom: 22,
        },
        sectionLabel: {
            fontSize: 14,
            fontWeight: "600",
            color: theme.text,
            marginBottom: 12,
            letterSpacing: 0.1,
        },
        chipsGrid: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 26,
        },
        chip: {
            paddingHorizontal: 13,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor: theme.base + "10",
            borderWidth: 1.5,
            borderColor: theme.base + "18",
        },
        chipSelected: {
            backgroundColor: theme.base,
            borderColor: theme.base,
        },
        chipText: {
            fontSize: 13,
            fontWeight: "500",
            color: theme.grayscale,
        },
        chipTextSelected: {
            color: theme.white,
        },
        textArea: {
            backgroundColor: theme.base + "08",
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: theme.base + "18",
            padding: 14,
            fontSize: 14,
            color: theme.text,
            minHeight: 110,
            lineHeight: 20,
        },
        charCount: {
            fontSize: 12,
            color: theme.grayscale,
            textAlign: "right",
            marginTop: 5,
            marginBottom: 18,
        },
        noteBox: {
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 8,
            backgroundColor: theme.base + "08",
            borderRadius: 12,
            padding: 12,
            marginBottom: 28,
        },
        noteText: {
            flex: 1,
            fontSize: 12,
            color: theme.grayscale,
            lineHeight: 17,
        },
        actions: {
            gap: 12,
        },
        btnSubmit: {
            backgroundColor: theme.base,
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: "center",
            justifyContent: "center",
        },
        btnSubmitText: {
            color: theme.white,
            fontSize: 15,
            fontWeight: "700",
            letterSpacing: 0.2,
        },
        btnBlock: {
            flexDirection: "row",
            backgroundColor: theme.background,
            borderRadius: 16,
            paddingVertical: 15,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1.5,
            borderColor: "#df1d1d",
        },
        btnBlockText: {
            color: "#df1d1d",
            fontSize: 15,
            fontWeight: "700",
            letterSpacing: 0.2,
        },
        btnDisabled: {
            opacity: 0.5,
        },
    });
