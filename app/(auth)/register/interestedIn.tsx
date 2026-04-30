import BackWrapper from "@/components/backwrapper";
import { useTheme } from "@/lib/theme/context";
import { BtnText, Button } from "@/components/button";
import { router, Stack } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Mars, Venus, Users } from "lucide-react-native";
import { useRegisterStore } from "@/utils/registerStore";

type InterestedInType = "male" | "female" | "everyone";

export default function InterestedIn() {
    const { gs, theme } = useTheme();
    const styles = makeStyles();
    const { data, setInterestedIn } = useRegisterStore();

    const [selected, setSelected] = useState<InterestedInType | null>(
        data.interestedIn ? (data.interestedIn as InterestedInType) : null,
    );

    const muted = theme.base + "B3";
    const mutedSoft = theme.base + "0D";
    const primarySoft = theme.primary + "0D";

    const getCardStyle = (type: InterestedInType) => {
        const active = selected === type;
        return {
            borderColor: active ? theme.primary : muted,
            backgroundColor: active ? primarySoft : mutedSoft,
        };
    };

    const getLabelColor = (type: InterestedInType) =>
        selected === type ? theme.primary : theme.base;

    const onSubmit = () => {
        if (!selected) return;
        setInterestedIn(selected);
        router.push("/register/agePreferences");
    };

    const options: { type: InterestedInType; label: string; Icon: any }[] = [
        { type: "male", label: "Men", Icon: Mars },
        { type: "female", label: "Women", Icon: Venus },
        { type: "everyone", label: "Everyone", Icon: Users },
    ];

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <BackWrapper>
                <Text style={[gs.h1, { marginTop: 35 }]}>Who are you interested in?</Text>

                <Text
                    style={[
                        gs.bodyText,
                        { marginTop: 10, color: theme.base + "54", textAlign: "left" },
                    ]}
                >
                    This helps us find the{" "}
                    <Text style={{ fontWeight: "bold" }}>right matches</Text> for you.
                </Text>

                <View style={styles.cardsArea}>
                    {options.map(({ type, label, Icon }) => (
                        <Pressable
                            key={type}
                            style={[styles.card, getCardStyle(type)]}
                            onPress={() => setSelected(type)}
                        >
                            <Icon size={36} color={getLabelColor(type)} />
                            <Text
                                style={[styles.cardText, { color: getLabelColor(type) }]}
                            >
                                {label}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                <Button
                    style={{ marginTop: "auto" }}
                    onPress={onSubmit}
                    disabled={!selected}
                >
                    <BtnText>Continue</BtnText>
                </Button>
            </BackWrapper>
        </>
    );
}

const makeStyles = () =>
    StyleSheet.create({
        cardsArea: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            gap: 16,
        },

        card: {
            width: 200,
            height: 120,
            borderRadius: 22,
            borderWidth: 2,
            alignItems: "center",
            justifyContent: "center",
        },

        cardText: {
            marginTop: 10,
            fontSize: 16,
            fontWeight: "600",
        },
    });
