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
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "New passwords do not match.");
            return;
        }
        if (newPassword.length < 8) {
            Alert.alert("Error", "Password must be at least 8 characters.");
            return;
        }

        try {
            await run({
                method: "PATCH",
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            Alert.alert("Success", "Password changed successfully.", [
                { text: "OK", onPress: () => router.back() },
            ]);
        } catch (err: any) {
            Alert.alert("Error", err?.message ?? "Something went wrong.");
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
                <Text style={[gs.h1, styles.title]}>Security</Text>

                <Text style={[styles.subtitle, { color: theme.text + "66" }]}>
                    Change your password below.
                </Text>

                <View style={styles.form}>
                    <View style={styles.fieldWrap}>
                        <Text style={[styles.label, { color: theme.primary }]}>
                            Current Password
                        </Text>
                        <Input
                            placeholder="Current password"
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            autoComplete="current-password"
                            secureTextEntry
                            style={{ marginTop: 0 }}
                        />
                    </View>

                    <View style={styles.fieldWrap}>
                        <Text style={[styles.label, { color: theme.primary }]}>
                            New Password
                        </Text>
                        <Input
                            placeholder="New password"
                            value={newPassword}
                            onChangeText={setNewPassword}
                            autoComplete="new-password"
                            secureTextEntry
                            style={{ marginTop: 0 }}
                        />
                    </View>

                    <View style={styles.fieldWrap}>
                        <Text style={[styles.label, { color: theme.primary }]}>
                            Confirm New Password
                        </Text>
                        <Input
                            placeholder="Repeat new password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            autoComplete="new-password"
                            secureTextEntry
                            style={{ marginTop: 0 }}
                        />
                    </View>
                </View>

                <Button style={{ marginTop: 24 }} onPress={handleSave} disabled={loading}>
                    {loading ? <Loader /> : <BtnText>Save Password</BtnText>}
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
