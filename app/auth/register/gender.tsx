import BackWrapper from "@/components/backwrapper";
import { useTheme } from "@/app/theme/context";
import { BtnText, Button } from "@/components/button";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Mars, Venus } from "lucide-react-native";
import { Theme } from "@/app/theme/theme";

type GenderType = "male" | "female";

export default function Gender() {
    const { gs, theme } = useTheme();
    const styles = makeStyles(theme);

    const [selected, setSelected] = useState<GenderType | null>(null);

    const primary = theme.primary;
    const muted = theme.black;
    const mutedSoft = theme.black + "1A";
    const primarySoft = theme.primary + "14";

    const getCardStyle = (type: GenderType) => {
        const active = selected === type;
        return {
            borderColor: active ? primary : muted,
            backgroundColor: active ? primarySoft : mutedSoft,
        };
    };

    const getLabelColor = (type: GenderType) => (selected === type ? primary : muted);

    return (
        <>
            <BackWrapper>
                <Text style={[gs.h1, { marginTop: 35 }]}>Select your Gender </Text>
                <Text
                    style={[
                        gs.bodyText,
                        { marginTop: 10, color: theme.base + "54", textAlign: "left" },
                    ]}
                >
                    Please select <Text style={{ fontWeight: "bold" }}>your Gender</Text>
                </Text>

                <View style={styles.cardsArea}>
                    <Pressable
                        style={[styles.card, getCardStyle("male")]}
                        onPress={() => setSelected("male")}
                    >
                        <Mars size={36} color={getLabelColor("male")} />
                        <Text style={[styles.cardText, { color: getLabelColor("male") }]}>
                            Male
                        </Text>
                    </Pressable>

                    <Pressable
                        style={[styles.card, getCardStyle("female")]}
                        onPress={() => setSelected("female")}
                    >
                        <Venus size={36} color={getLabelColor("female")} />
                        <Text
                            style={[styles.cardText, { color: getLabelColor("female") }]}
                        >
                            Female
                        </Text>
                    </Pressable>
                </View>

                <Button
                    style={{ marginTop: "auto" }}
                    onPress={() => router.push("/auth/register/interests")}
                    disabled={!selected}
                >
                    <BtnText>Continue</BtnText>
                </Button>
            </BackWrapper>
        </>
    );
}
const makeStyles = (theme: Theme) =>
    StyleSheet.create({
        cardsArea: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            gap: 16,
        },

        card: {
            width: 200,
            height: 180,
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
