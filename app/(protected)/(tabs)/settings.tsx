import { BtnText, Button } from "@/components/button";
import { Image, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/lib/theme/context";
import { Eye, Gem, Globe, Heart, MessageCircle, Moon, User } from "lucide-react-native";
import { router } from "expo-router";
import { useAuth } from "@/lib/auth/AuthProvider";
import { createT } from "@/i18n";
import Constants from "expo-constants";
import { MenuRow } from "@/components/menuRow";
import * as WebBrowser from "expo-web-browser";
import { useAuthFetch } from "@/hooks/useAuthFetch";

type UserProfile = {
    id: string;
    email: string | null;
    firstName: string;
    lastName: string;
    photoUrl: string | null;
};

const t = createT("auth.settings");
const version = Constants.expoConfig?.version;

export default function SettingsScreen() {
    const { gs, theme } = useTheme();
    const { logout } = useAuth();
    const [profile] = useAuthFetch<UserProfile>("/users/me", {}, { useCache: false });

    const mutedText = theme.text + "8C";
    const divider = theme.text + "26";
    const iconColor = theme.text + "E6";

    const handleLogout = async () => {
        await logout();
        router.replace("/login");
    };

    return (
        <View style={gs.container}>
            <Text style={[styles.title, { marginTop: 20, color: theme.text }]}>
                {t("title")}
            </Text>

            <View style={styles.profileWrap}>
                {profile?.photoUrl ? (
                    <Image source={{ uri: profile.photoUrl }} style={styles.avatar} />
                ) : (
                    <View
                        style={[
                            styles.avatar,
                            styles.avatarPlaceholder,
                            { backgroundColor: theme.text + "1A" },
                        ]}
                    />
                )}
                <Text style={[styles.name, { color: theme.text }]}>
                    {profile ? `${profile.firstName} ${profile.lastName}` : ""}
                </Text>
                <Text style={[styles.email, { color: mutedText }]}>
                    {profile?.email ?? ""}
                </Text>
            </View>

            <View style={styles.list}>
                <MenuRow
                    icon={User}
                    label={t("personalDetails")}
                    divider={divider}
                    iconColor={iconColor}
                    textColor={theme.text}
                    href="/settings/apperance"
                />
                <MenuRow
                    icon={Gem}
                    label={t("subscription")}
                    divider={divider}
                    iconColor={iconColor}
                    textColor={theme.text}
                    href="/subscriptions"
                />
                <MenuRow
                    icon={Heart}
                    label={t("interests")}
                    divider={divider}
                    iconColor={iconColor}
                    textColor={theme.text}
                    href="/settings/apperance"
                />
                <MenuRow
                    icon={Globe}
                    label={t("termsAndConditions")}
                    divider={divider}
                    iconColor={iconColor}
                    textColor={theme.text}
                    onPress={() =>
                        WebBrowser.openBrowserAsync(
                            "https://mindsofd23b.github.io/Landing-Elysio/termsandconditions/",
                            {
                                presentationStyle:
                                    WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
                                controlsColor: theme.primary,
                                toolbarColor: theme.background,
                                enableBarCollapsing: true,
                            },
                        )
                    }
                />
                <MenuRow
                    icon={MessageCircle}
                    label={t("privacyPolicy")}
                    divider={divider}
                    iconColor={iconColor}
                    textColor={theme.text}
                    onPress={() =>
                        WebBrowser.openBrowserAsync(
                            "https://mindsofd23b.github.io/Landing-Elysio/privacypolicy/",
                            {
                                presentationStyle:
                                    WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
                                controlsColor: theme.primary,
                                toolbarColor: theme.background,
                                enableBarCollapsing: true,
                            },
                        )
                    }
                />
                <MenuRow
                    icon={Eye}
                    label={t("aboutUs")}
                    divider={divider}
                    iconColor={iconColor}
                    textColor={theme.text}
                    onPress={() => {
                        WebBrowser.openBrowserAsync(
                            "https://mindsofd23b.github.io/Landing-Elysio/aboutus/",
                            {
                                presentationStyle:
                                    WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
                                controlsColor: theme.primary,
                                toolbarColor: theme.background,
                                enableBarCollapsing: true,
                            },
                        );
                    }}
                />
                <MenuRow
                    icon={Moon}
                    label={t("appearance")}
                    divider={divider}
                    iconColor={iconColor}
                    textColor={theme.text}
                    href="/settings/apperance"
                />
            </View>

            <View style={[styles.list, { marginTop: 0 }]}>
                {[{ label: "Version", value: version }].map((item) => (
                    <View
                        key={item.label}
                        style={[styles.infoRow, { borderBottomColor: divider }]}
                    >
                        <Text style={[styles.infoLabel, { color: theme.text }]}>
                            {item.label}
                        </Text>
                        <Text
                            style={[styles.infoValue, { color: mutedText }]}
                            numberOfLines={1}
                        >
                            {item.value}
                        </Text>
                    </View>
                ))}
            </View>

            <Button style={{ marginTop: "auto" }} onPress={handleLogout}>
                <BtnText>{t("logOut")}</BtnText>
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    infoRow: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 14,
        paddingHorizontal: 7,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    infoLabel: {
        fontSize: 16,
        fontWeight: "600",
    },
    infoValue: {
        fontSize: 14,
        fontWeight: "400",
        flexShrink: 1,
        marginLeft: 8,
        textAlign: "right",
    },
    title: {
        fontSize: 26,
        fontWeight: "800",
        textAlign: "center",
    },

    profileWrap: {
        alignItems: "center",
        marginTop: 10,
    },

    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
    },
    avatarPlaceholder: {
        width: 110,
        height: 110,
        borderRadius: 55,
    },

    name: {
        fontSize: 22,
        fontWeight: "700",
        marginTop: 6,
    },

    email: {
        fontSize: 13,
        marginTop: 2,
    },

    list: {
        width: "100%",
        marginTop: 10,
    },

    modeRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 16,
    },
    modeItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
});
