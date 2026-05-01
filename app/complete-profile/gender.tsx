import BackWrapper from "@/components/backwrapper";
import { useTheme } from "@/lib/theme/context";
import { BtnText, Button } from "@/components/button";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Mars, Venus } from "lucide-react-native";
import { useCompleteProfileStore } from "@/utils/completeProfileStore";

type GenderType = "male" | "female";

export default function CompleteProfileGender() {
    const { gs, theme } = useTheme();
    const { data, setGender } = useCompleteProfileStore();

    const [selected, setSelected] = useState<GenderType | null>(
        data.gender ? (data.gender as GenderType) : null,
    );

    const muted = theme.base + "B3";
    const mutedSoft = theme.base + "0D";
    const primarySoft = theme.primary + "0D";

    const cardStyle = (type: GenderType) => ({
        borderColor: selected === type ? theme.primary : muted,
        backgroundColor: selected === type ? primarySoft : mutedSoft,
    });

    const labelColor = (type: GenderType) =>
        selected === type ? theme.primary : theme.base;

    const onSubmit = () => {
        if (!selected) return;
        setGender(selected);
        router.push("/complete-profile/interestedIn");
    };

    return (
        <BackWrapper>
            <Text style={[gs.h1, { marginTop: 35 }]}>What&apos;s your gender?</Text>
            <Text style={[gs.bodyText, { marginTop: 10, color: theme.base + "54" }]}>
                This helps us find the{" "}
                <Text style={{ fontWeight: "bold" }}>right matches</Text> for you.
            </Text>

            <View style={styles.cardsArea}>
                <Pressable
                    style={[styles.card, cardStyle("male")]}
                    onPress={() => setSelected("male")}
                >
                    <Mars size={36} color={labelColor("male")} />
                    <Text style={[styles.cardText, { color: labelColor("male") }]}>
                        Male
                    </Text>
                </Pressable>
                <Pressable
                    style={[styles.card, cardStyle("female")]}
                    onPress={() => setSelected("female")}
                >
                    <Venus size={36} color={labelColor("female")} />
                    <Text style={[styles.cardText, { color: labelColor("female") }]}>
                        Female
                    </Text>
                </Pressable>
            </View>

            <Button style={{ marginTop: "auto" }} onPress={onSubmit} disabled={!selected}>
                <BtnText>Continue</BtnText>
            </Button>
        </BackWrapper>
    );
}

const styles = StyleSheet.create({
    cardsArea: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16 },
    card: {
        width: 200,
        height: 180,
        borderRadius: 22,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
    },
    cardText: { marginTop: 10, fontSize: 16, fontWeight: "600" },
});
