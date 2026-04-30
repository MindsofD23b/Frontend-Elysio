import BackWrapper from "@/components/backwrapper";
import { useTheme } from "@/lib/theme/context";
import { BtnText, Button } from "@/components/button";
import { router, Stack } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useRegisterStore } from "@/utils/registerStore";

export default function AgePreferences() {
    const { gs, theme } = useTheme();
    const styles = makeStyles(theme);
    const { data, setAgePreferences } = useRegisterStore();

    const [minAge, setMinAge] = useState(String(data.minPreferredAge || 18));
    const [maxAge, setMaxAge] = useState(String(data.maxPreferredAge || 35));
    const [error, setError] = useState<string | null>(null);

    const validate = () => {
        const min = parseInt(minAge, 10);
        const max = parseInt(maxAge, 10);

        if (isNaN(min) || isNaN(max)) {
            setError("Please enter valid ages.");
            return null;
        }
        if (min < 18) {
            setError("Minimum age must be at least 18.");
            return null;
        }
        if (max > 99) {
            setError("Maximum age cannot exceed 99.");
            return null;
        }
        if (min >= max) {
            setError("Minimum age must be less than maximum age.");
            return null;
        }
        return { min, max };
    };

    const onSubmit = () => {
        setError(null);
        const result = validate();
        if (!result) return;

        setAgePreferences(result.min, result.max);
        router.push("/register/interests");
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <BackWrapper>
                <Text style={[gs.h1, { marginTop: 35 }]}>Age preference</Text>

                <Text
                    style={[
                        gs.bodyText,
                        { marginTop: 10, color: theme.base + "54", textAlign: "left" },
                    ]}
                >
                    Set the <Text style={{ fontWeight: "bold" }}>age range</Text>{" "}
                    you&apos;re open to.
                </Text>

                <View style={styles.form}>
                    <View style={styles.row}>
                        <View style={styles.inputWrapper}>
                            <Text style={[styles.label, { color: theme.base + "80" }]}>
                                Min age
                            </Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    { color: theme.text, borderColor: theme.base + "33" },
                                ]}
                                value={minAge}
                                onChangeText={(v) => {
                                    setMinAge(v.replace(/\D/g, ""));
                                    setError(null);
                                }}
                                keyboardType="number-pad"
                                maxLength={2}
                                placeholder="18"
                                placeholderTextColor={theme.base + "54"}
                            />
                        </View>

                        <Text style={[styles.dash, { color: theme.base + "54" }]}>—</Text>

                        <View style={styles.inputWrapper}>
                            <Text style={[styles.label, { color: theme.base + "80" }]}>
                                Max age
                            </Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    { color: theme.text, borderColor: theme.base + "33" },
                                ]}
                                value={maxAge}
                                onChangeText={(v) => {
                                    setMaxAge(v.replace(/\D/g, ""));
                                    setError(null);
                                }}
                                keyboardType="number-pad"
                                maxLength={2}
                                placeholder="35"
                                placeholderTextColor={theme.base + "54"}
                            />
                        </View>
                    </View>

                    {error && <Text style={styles.errorText}>{error}</Text>}
                </View>

                <Button style={{ marginTop: "auto" }} onPress={onSubmit}>
                    <BtnText>Continue</BtnText>
                </Button>
            </BackWrapper>
        </>
    );
}

const makeStyles = (theme: any) =>
    StyleSheet.create({
        form: {
            marginTop: 40,
            gap: 12,
        },

        row: {
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "center",
            gap: 16,
        },

        inputWrapper: {
            alignItems: "center",
            gap: 6,
        },

        label: {
            fontSize: 13,
            fontWeight: "500",
        },

        input: {
            width: 90,
            height: 56,
            borderRadius: 14,
            borderWidth: 1.5,
            textAlign: "center",
            fontSize: 22,
            fontWeight: "600",
        },

        dash: {
            fontSize: 24,
            marginBottom: 10,
        },

        errorText: {
            color: "red",
            fontSize: 12,
            textAlign: "center",
            marginTop: 4,
        },
    });
