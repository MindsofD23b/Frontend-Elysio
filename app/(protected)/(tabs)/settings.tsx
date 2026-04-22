import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/lib/theme/context";
import {
    ChevronRight,
    Eye,
    Gem,
    Globe,
    Heart,
    MessageCircle,
    Moon,
    User,
} from "lucide-react-native";
import { router } from "expo-router";
import { useAuth } from "@/lib/auth/AuthProvider";
import { createT } from "@/i18n";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import { BtnText, Button } from "@/components/button";

const t = createT("auth.settings");
const version = Constants.expoConfig?.version;

const BROWSER_OPTS = (theme: any): Parameters<typeof WebBrowser.openBrowserAsync>[1] => ({
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
    controlsColor: theme.primary,
    toolbarColor: theme.background,
    enableBarCollapsing: true,
});

function SectionLabel({ label }: { label: string }) {
    return <Text style={styles.sectionLabel}>{label}</Text>;
}

function SettingsCard({ children }: { children: React.ReactNode }) {
    const { theme } = useTheme();
    return (
        <View style={[styles.card, { backgroundColor: theme.background }]}>
            {children}
        </View>
    );
}

type RowProps = {
    icon: React.ElementType;
    label: string;
    last?: boolean;
    onPress: () => void;
};

function SettingsRow({ icon: Icon, label, last, onPress }: RowProps) {
    const { theme } = useTheme();
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.row,
                !last && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: theme.text + "18",
                },
                pressed && { backgroundColor: theme.text + "08" },
            ]}
        >
            <View style={[styles.iconCircle, { backgroundColor: theme.primary + "18" }]}>
                <Icon size={16} color={theme.primary} strokeWidth={2} />
            </View>
            <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
            <ChevronRight size={16} color={theme.text + "44"} strokeWidth={2.5} />
        </Pressable>
    );
}

export default function SettingsScreen() {
    const { theme } = useTheme();
    const { logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        router.replace("/login");
    };

    return (
        <ScrollView
            style={[styles.scroll, { backgroundColor: theme.cardBg }]}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            alwaysBounceVertical={true}
        >
            <View style={{ gap: 0 }}>
                {/* ── Account ── */}
                <SectionLabel label={t("personalDetails")} />
                <SettingsCard>
                    <SettingsRow
                        icon={User}
                        label={t("personalDetails")}
                        onPress={() => router.push("/settings/personaldetails")}
                    />
                    <SettingsRow
                        icon={Heart}
                        label={t("interests")}
                        onPress={() => router.push("/settings/interests")}
                    />
                    <SettingsRow
                        icon={Gem}
                        label={t("subscription")}
                        last
                        onPress={() => router.push("/subscriptions")}
                    />
                </SettingsCard>

                {/* ── App ── */}
                <SectionLabel label="App" />
                <SettingsCard>
                    <SettingsRow
                        icon={Moon}
                        label={t("appearance")}
                        last
                        onPress={() => router.push("/settings/apperance")}
                    />
                </SettingsCard>

                {/* ── Legal ── */}
                <SectionLabel label="Legal" />
                <SettingsCard>
                    <SettingsRow
                        icon={Globe}
                        label={t("termsAndConditions")}
                        onPress={() =>
                            WebBrowser.openBrowserAsync(
                                "https://mindsofd23b.github.io/Landing-Elysio/termsandconditions/",
                                BROWSER_OPTS(theme),
                            )
                        }
                    />
                    <SettingsRow
                        icon={MessageCircle}
                        label={t("privacyPolicy")}
                        onPress={() =>
                            WebBrowser.openBrowserAsync(
                                "https://mindsofd23b.github.io/Landing-Elysio/privacypolicy/",
                                BROWSER_OPTS(theme),
                            )
                        }
                    />
                    <SettingsRow
                        icon={Eye}
                        label={t("aboutUs")}
                        last
                        onPress={() =>
                            WebBrowser.openBrowserAsync(
                                "https://mindsofd23b.github.io/Landing-Elysio/aboutus/",
                                BROWSER_OPTS(theme),
                            )
                        }
                    />
                </SettingsCard>

                {/* ── Version ── */}
                <SectionLabel label="Info" />
                <View style={[styles.card, { backgroundColor: theme.background }]}>
                    <View style={styles.infoRow}>
                        <Text style={[styles.rowLabel, { color: theme.text }]}>
                            Version
                        </Text>
                        <Text style={[styles.infoValue, { color: theme.text + "66" }]}>
                            {version}
                        </Text>
                    </View>
                </View>
            </View>

            {/* ── Logout ── */}
            <Button onPress={handleLogout}>
                <BtnText>{t("logOut")}</BtnText>
            </Button>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scroll: { flex: 1 },
    content: {
        padding: 16,
        paddingBottom: 24,
        gap: 0,
        flexGrow: 1,
        justifyContent: "space-between",
    },

    sectionLabel: {
        fontSize: 13,
        color: "rgba(100,100,100,0.9)",
        marginBottom: 8,
        marginLeft: 4,
        fontWeight: "400",
    },
    card: {
        borderRadius: 16,
        marginBottom: 24,
        overflow: "hidden",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 14,
        paddingVertical: 13,
    },
    iconCircle: {
        width: 30,
        height: 30,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    rowLabel: { flex: 1, fontSize: 15, fontWeight: "500" },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        paddingVertical: 13,
    },
    infoValue: { fontSize: 14 },
});
