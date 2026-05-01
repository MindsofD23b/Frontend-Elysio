import BackWrapper from "@/components/backwrapper";
import { useTheme } from "@/lib/theme/context";
import { BtnText, Button } from "@/components/button";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import LabeledInput from "@/components/LabeledInput";
import { useCompleteProfileStore } from "@/utils/completeProfileStore";

export default function CompleteProfileName() {
    const { gs, theme } = useTheme();
    const { data, setPersonalDetails } = useCompleteProfileStore();

    const [firstName, setFirstName] = useState(data.firstName);
    const [lastName, setLastName] = useState(data.lastName);
    const [error, setError] = useState<string | null>(null);

    const onSubmit = () => {
        if (!firstName.trim() || !lastName.trim()) {
            setError("Please enter your first and last name.");
            return;
        }
        setPersonalDetails({ firstName: firstName.trim(), lastName: lastName.trim() });
        router.push("/complete-profile/gender");
    };

    return (
        <BackWrapper>
            <Text style={[gs.h1, { marginTop: 35 }]}>What&apos;s your name?</Text>
            <Text style={[gs.bodyText, { marginTop: 10, color: theme.base + "54" }]}>
                Tell us your <Text style={{ fontWeight: "bold" }}>real name</Text> so
                others can find you.
            </Text>

            <View style={styles.form}>
                <LabeledInput
                    label="First name"
                    placeholder="Anna"
                    value={firstName}
                    onChangeText={(v) => {
                        setFirstName(v);
                        setError(null);
                    }}
                    autoCapitalize="words"
                />
                <LabeledInput
                    label="Last name"
                    placeholder="Müller"
                    value={lastName}
                    onChangeText={(v) => {
                        setLastName(v);
                        setError(null);
                    }}
                    autoCapitalize="words"
                />
                {error ? <Text style={styles.error}>{error}</Text> : null}
            </View>

            <Button
                style={{ marginTop: "auto" }}
                onPress={onSubmit}
                disabled={!firstName.trim() || !lastName.trim()}
            >
                <BtnText>Continue</BtnText>
            </Button>
        </BackWrapper>
    );
}

const styles = StyleSheet.create({
    form: { marginTop: 18, gap: 0, width: "100%" },
    error: { color: "red", fontSize: 12, marginTop: 4 },
});
