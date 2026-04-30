// Made with the help of Claude.ai and ChatGPT

import { createT } from "@/i18n";
import { useTheme } from "@/lib/theme/context";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

const t = createT("favorites.ideaDetail");

type Props = {
    title: string;
    location: string;
    price: number;
    effort: string;
    duration: string;
    vibe: string;
    isTopPick?: boolean;
    onPress?: () => void;
};

export function DateIdeaCard({
    title,
    location,
    price,
    effort,
    duration,
    vibe,
    isTopPick,
    onPress,
}: Props) {
    const { theme } = useTheme();
    const s = makeStyles(theme);

    return (
        <View style={s.card}>
            {isTopPick && (
                <View style={s.topPickBadge}>
                    <Ionicons name="star" size={10} color={theme.primary} />
                    <Text style={s.topPickText}>{t("topPick")}</Text>
                </View>
            )}
            <View style={s.priceTag}>
                <Text style={s.priceText}>${price}</Text>
            </View>
            <Text style={s.title}>{title}</Text>
            <View style={s.locationRow}>
                <Ionicons name="location-outline" size={12} color="#aaa" />
                <Text style={s.locationText}>{location}</Text>
            </View>
            <View style={s.metaRow}>
                <View style={s.metaItem}>
                    <Text style={s.metaLabel}>{t("effort")}</Text>
                    <Text style={[s.metaValue, { color: theme.primary }]}>{effort}</Text>
                </View>
                <View style={s.metaItem}>
                    <Text style={s.metaLabel}>{t("time")}</Text>
                    <Text style={s.metaValueWhite}>{duration}</Text>
                </View>
                <View style={s.metaItem}>
                    <Text style={s.metaLabel}>{t("vibe")}</Text>
                    <Text style={[s.metaValue, { color: theme.planPremium }]}>
                        {vibe}
                    </Text>
                </View>
            </View>
            <Pressable style={s.exploreBtn} onPress={onPress}>
                <Text style={s.exploreBtnText}>{t("exploreDetails")}</Text>
            </Pressable>
        </View>
    );
}

const makeStyles = (theme: any) =>
    StyleSheet.create({
        card: {
            backgroundColor: theme.cardBg,
            borderRadius: 20,
            padding: 18,
            gap: 10,
            borderWidth: 1,
            borderColor: theme.primary + "22",
        },
        topPickBadge: {
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            alignSelf: "flex-end",
            backgroundColor: theme.cardBgDeep,
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: theme.primary + "44",
        },
        topPickText: {
            color: theme.primary,
            fontSize: 10,
            fontWeight: "800",
            letterSpacing: 1,
        },
        priceTag: {
            position: "absolute",
            top: 18,
            right: 18,
            backgroundColor: theme.primary,
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 6,
        },
        priceText: { color: theme.white, fontWeight: "800", fontSize: 14 },
        title: {
            color: theme.text,
            fontSize: 26,
            fontWeight: "900",
            lineHeight: 30,
            marginTop: 4,
        },
        locationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
        locationText: { color: theme.text + "66", fontSize: 12 },
        metaRow: { flexDirection: "row", gap: 20, marginTop: 4 },
        metaItem: { gap: 2 },
        metaLabel: {
            color: theme.text + "55",
            fontSize: 9,
            fontWeight: "800",
            letterSpacing: 1,
        },
        metaValue: { fontSize: 13, fontWeight: "700" },
        metaValueWhite: { color: theme.text, fontSize: 13, fontWeight: "700" },
        exploreBtn: {
            backgroundColor: theme.primary,
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: "center",
            marginTop: 4,
        },
        exploreBtnText: { color: theme.white, fontWeight: "800", fontSize: 15 },
    });
