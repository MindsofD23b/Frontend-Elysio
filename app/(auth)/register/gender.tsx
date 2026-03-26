import BackWrapper from "@/components/backwrapper";
import { useTheme } from "@/lib/theme/context";
import { BtnText, Button } from "@/components/button";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Mars, Venus } from "lucide-react-native";
import i18n from "@/i18n";
import { Theme } from "@/lib/theme/theme";

type GenderType = "male" | "female";

export default function Gender() {
    const { gs, theme } = useTheme();
    const styles = makeStyles(theme);
    const t = (key: string) => i18n.t(`auth.register.gender.${key}`);
    useEffect(() => {
        router.prefetch("/register/interests");
    }, []);

    const [selected, setSelected] = useState<GenderType | null>(null);

    const muted = theme.base + "B3";
    const mutedSoft = theme.base + "0D";
    const primarySoft = theme.primary + "0D";

    const getCardStyle = (type: GenderType) => {
        const active = selected === type;
        return {
            borderColor: active ? theme.primary : muted,
            backgroundColor: active ? primarySoft : mutedSoft,
        };
    };

    const getLabelColor = (type: GenderType) =>
        selected === type ? theme.primary : theme.base;

    return (
        <>
            <BackWrapper>
                <Text style={[gs.h1, { marginTop: 35 }]}>{t("title")}</Text>
                <Text
                    style={[
                        gs.bodyText,
                        { marginTop: 10, color: theme.base + "54", textAlign: "left" },
                    ]}
                >
                    {t("body")}
                    <Text style={{ fontWeight: "bold" }}>{t("bodyBold")}a</Text>
                </Text>

                <View style={styles.cardsArea}>
                    <Pressable
                        style={[styles.card, getCardStyle("male")]}
                        onPress={() => setSelected("male")}
                    >
                        <Mars size={36} color={getLabelColor("male")} />
                        <Text style={[styles.cardText, { color: getLabelColor("male") }]}>
                            {t("male")}
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
                            {t("female")}
                        </Text>
                    </Pressable>
                </View>

                <Button
                    style={{ marginTop: "auto" }}
                    onPress={() => router.push("/register/interests")}
                    disabled={!selected}
                >
                    <BtnText>{t("continue")}</BtnText>
                </Button>
            </BackWrapper>
        </>
    );
}
const makeStyles = (_theme: Theme) =>
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
