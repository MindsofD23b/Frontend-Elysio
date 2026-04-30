import { createT } from "@/i18n";
import BackWrapper from "@/components/backwrapper";
import { BtnText, Button, Loader } from "@/components/button";
import Input from "@/components/input";
import { useTheme } from "@/lib/theme/context";
import { useCallback, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaControl } from "@/components/SafeArea";
import { useFocusEffect, router } from "expo-router";
import { useAuthFetch } from "@/hooks/useAuthFetch";

const t = createT("settings.security");

export default function Security() {
    const { gs, theme } = useTheme();
    const styles = makeStyles();

    const { setDisabledEdges } = useSafeAreaControl();

    useFocusEffect(
        useCallback(() => {
            setDisabledEdges(["top"]);
            return () => setDisabledEdges([]);
        }, []),
    );

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [, loading, , run] = useAuthFetch<void>(
        "/auth/change-password",
        {},
        { manual: true },
    );

    async function handleSave() {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert(t("error"), t("errors.fillAllFields"));
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert(t("error"), t("errors.passwordsNoMatch"));
            return;
        }
        if (newPassword.length < 8) {
            Alert.alert(t("error"), t("errors.passwordTooShort"));
            return;
        }

        try {
            await run({
                method: "PATCH",
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            Alert.alert(t("success"), t("successMessage"), [
                { text: t("ok"), onPress: () => router.back() },
            ]);
        } catch (err: any) {
            Alert.alert(t("error"), err?.message ?? t("errors.somethingWentWrong"));
        }
    }

    return (
        <BackWrapper m>
            <KeyboardAwareScrollView
                contentContainerStyle={styles.page}
                showsVerticalScrollIndicator={false}
                enableOnAndroid
                extraScrollHeight={20}
            >
                <Text style={[gs.h1, styles.title]}>{t("title")}</Text>

                <Text style={[styles.subtitle, { color: theme.text + "66" }]}>
                    {t("subtitle")}
                </Text>

                <View style={styles.form}>
                    <View style={styles.fieldWrap}>
                        <Text style={[styles.label, { color: theme.primary }]}>
                            {t("currentPassword")}
                        </Text>
                        <Input
                            placeholder={t("currentPasswordPlaceholder")}
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            autoComplete="current-password"
                            secureTextEntry
                            style={{ marginTop: 0 }}
                        />
                    </View>

                    <View style={styles.fieldWrap}>
                        <Text style={[styles.label, { color: theme.primary }]}>
                            {t("newPassword")}
                        </Text>
                        <Input
                            placeholder={t("newPasswordPlaceholder")}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            autoComplete="new-password"
                            secureTextEntry
                            style={{ marginTop: 0 }}
                        />
                    </View>

                    <View style={styles.fieldWrap}>
                        <Text style={[styles.label, { color: theme.primary }]}>
                            {t("confirmNewPassword")}
                        </Text>
                        <Input
                            placeholder={t("confirmPasswordPlaceholder")}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            autoComplete="new-password"
                            secureTextEntry
                            style={{ marginTop: 0 }}
                        />
                    </View>
                </View>

                <Button style={{ marginTop: 24 }} onPress={handleSave} disabled={loading}>
                    {loading ? <Loader /> : <BtnText>{t("savePassword")}</BtnText>}
                </Button>
            </KeyboardAwareScrollView>
        </BackWrapper>
    );
}

const makeStyles = () =>
    StyleSheet.create({
        page: {
            width: "100%",
            paddingTop: 2,
            paddingBottom: 24,
        },
        title: { marginTop: 2, textAlign: "center" },
        subtitle: { marginTop: 8, textAlign: "center", fontSize: 14 },
        form: { marginTop: 24, gap: 4 },
        fieldWrap: { width: "100%", marginTop: 14 },
        label: {
            fontSize: 14,
            fontWeight: "600",
            marginBottom: 6,
        },
    });
