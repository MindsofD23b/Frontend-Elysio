import BackWrapper from "@/components/backwrapper";
import { useTheme } from "@/lib/theme/context";
import { BtnText, Button } from "@/components/button";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Mars, Venus, Users } from "lucide-react-native";
import { useCompleteProfileStore } from "@/utils/completeProfileStore";

type InterestedInType = "male" | "female" | "everyone";

export default function CompleteProfileInterestedIn() {
    const { gs, theme } = useTheme();
    const { data, setInterestedIn } = useCompleteProfileStore();

    const [selected, setSelected] = useState<InterestedInType | null>(
        data.interestedIn ? (data.interestedIn as InterestedInType) : null,
    );

    const muted = theme.base + "B3";
    const mutedSoft = theme.base + "0D";
    const primarySoft = theme.primary + "0D";

    const cardStyle = (type: InterestedInType) => ({
        borderColor: selected === type ? theme.primary : muted,
        backgroundColor: selected === type ? primarySoft : mutedSoft,
    });

    const labelColor = (type: InterestedInType) =>
        selected === type ? theme.primary : theme.base;

    const onSubmit = () => {
        if (!selected) return;
        setInterestedIn(selected);
        router.push("/complete-profile/agePreferences");
    };

    const options: { type: InterestedInType; label: string; Icon: any }[] = [
        { type: "male", label: "Men", Icon: Mars },
        { type: "female", label: "Women", Icon: Venus },
        { type: "everyone", label: "Everyone", Icon: Users },
    ];

    return (
        <BackWrapper>
            <Text style={[gs.h1, { marginTop: 35 }]}>Who are you interested in?</Text>
            <Text style={[gs.bodyText, { marginTop: 10, color: theme.base + "54" }]}>
                This helps us find the{" "}
                <Text style={{ fontWeight: "bold" }}>right matches</Text> for you.
            </Text>

            <View style={styles.cardsArea}>
                {options.map(({ type, label, Icon }) => (
                    <Pressable
                        key={type}
                        style={[styles.card, cardStyle(type)]}
                        onPress={() => setSelected(type)}
                    >
                        <Icon size={36} color={labelColor(type)} />
                        <Text style={[styles.cardText, { color: labelColor(type) }]}>
                            {label}
                        </Text>
                    </Pressable>
                ))}
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
        height: 120,
        borderRadius: 22,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
    },
    cardText: { marginTop: 10, fontSize: 16, fontWeight: "600" },
});
