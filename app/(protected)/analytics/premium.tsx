import BackWrapper from "@/components/backwrapper";
import { useTheme } from "@/app/theme/context";
import { Stack } from "expo-router";
import React from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Theme } from "@/app/theme/theme";
import { Ionicons } from "@expo/vector-icons";

type Plan = {
    title: string;
    priceMain: string;
    priceDecimals?: string;
    oldPrice?: string;
    per: string;
    badge: string;
    badgeBg: string;
    accent: string;
    filledButton: boolean;
    buttonText: string;
    features: string[];
};

export default function PremiumScreen() {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    const plans: Plan[] = [
        {
            title: "Free",
            priceMain: "CHF 0",
            per: "/month",
            badge: "Current",
            badgeBg: "#E67FC9",
            accent: "#E67FC9",
            filledButton: true,
            buttonText: "Current Plan",
            features: [
                "Limited queues",
                "Normal analytics",
                "Less Dating Tips",
                "3 Streak on Ice",
            ],
        },

        {
            title: "Essential",
            priceMain: "CHF 9.95",
            per: "/month",
            badge: "POPULAR",
            badgeBg: "#CE0093",
            accent: "#CE0093",
            filledButton: true,
            buttonText: "Get Essential",
            features: [
                "Unlimited queues",
                "Access to improved analytics",
                "Enable availability",
                "5 Streak on Ice",
            ],
        },
        {
            title: "Premium",
            priceMain: "CHF 26.",
            priceDecimals: "95",
            oldPrice: "35.95",
            per: "/month",
            badge: "Save 25%",
            badgeBg: "#8688F433",
            accent: "#8688F4",
            filledButton: false,
            buttonText: "Get Premium",
            features: [
                "Exclusive Badge",
                "Unlimited Photos",
                "Unlimited Dating Tips",
                "10 Streak on Ice",
            ],
        },
    ];

    return (
        <BackWrapper>
            <View style={styles.page}>
                <Text style={styles.screenTitle}>Premium</Text>

                <Text style={styles.subtitle}>
                    Unlock exclusive features and benefits with Premium. Enjoy unlimited
                    single queues, and many more features.
                </Text>

                <View style={styles.cardsWrap}>
                    {plans.map((plan) => (
                        <View
                            key={plan.title}
                            style={[
                                styles.card,
                                {
                                    backgroundColor: "#131313",
                                    shadowColor: plan.accent,
                                },
                            ]}
                        >
                            <View style={styles.cardTopRow}>
                                <Text style={styles.planTitle}>{plan.title}</Text>

                                <View
                                    style={[
                                        styles.badge,
                                        { backgroundColor: plan.badgeBg },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.badgeText,
                                            {
                                                color:
                                                    plan.title === "Premium"
                                                        ? "#A9ABFF"
                                                        : "#FFFFFF",
                                            },
                                        ]}
                                    >
                                        {plan.badge}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.priceRow}>
                                <Text style={[styles.priceMain, { color: plan.accent }]}>
                                    {plan.priceMain}
                                </Text>

                                {plan.priceDecimals ? (
                                    <Text
                                        style={[
                                            styles.priceDecimals,
                                            { color: plan.accent },
                                        ]}
                                    >
                                        {plan.priceDecimals}
                                    </Text>
                                ) : null}

                                {plan.oldPrice ? (
                                    <View style={styles.oldPriceWrap}>
                                        <Text
                                            style={[
                                                styles.oldPrice,
                                                { color: plan.accent },
                                            ]}
                                        >
                                            {plan.oldPrice}
                                        </Text>
                                        <View style={styles.strikeLine} />
                                    </View>
                                ) : null}

                                <Text style={styles.perText}>{plan.per}</Text>
                            </View>

                            <Pressable
                                style={[
                                    styles.cta,
                                    plan.filledButton
                                        ? {
                                              backgroundColor: plan.accent,
                                              borderColor: plan.accent,
                                          }
                                        : {
                                              backgroundColor: "transparent",
                                              borderColor: plan.accent,
                                          },
                                ]}
                                onPress={() => {}}
                            >
                                <Text
                                    style={[
                                        styles.ctaText,
                                        {
                                            color: plan.filledButton
                                                ? "#FFFFFF"
                                                : plan.accent,
                                        },
                                    ]}
                                >
                                    {plan.buttonText}
                                </Text>
                            </Pressable>

                            <View style={styles.featuresWrap}>
                                {plan.features.map((feature) => (
                                    <View key={feature} style={styles.featureRow}>
                                        <View
                                            style={[
                                                styles.checkCircle,
                                                {
                                                    backgroundColor: plan.accent,
                                                    shadowColor: plan.accent,
                                                },
                                            ]}
                                        >
                                            <Ionicons
                                                name="checkmark"
                                                size={13}
                                                color="#fff"
                                            />
                                        </View>

                                        <Text style={styles.featureText}>{feature}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ))}
                </View>

                <Text style={styles.footerText}>
                    By continuing, you agree to our{" "}
                    <Text
                        style={styles.linkPink}
                        onPress={() =>
                            Linking.openURL(
                                "https://mindsofd23b.github.io/Landing-Elysio/termsandconditions/",
                            )
                        }
                    >
                        Terms of Service
                    </Text>{" "}
                    and{" "}
                    <Text
                        style={styles.linkPink}
                        onPress={() => Linking.openURL("DEINE_PRIVACY_URL")}
                    >
                        Privacy Policy
                    </Text>
                    . Subscription automatically renews unless auto-renew is turned off at
                    least 24-hours before the end of the current period.
                </Text>
            </View>
        </BackWrapper>
    );
}

const makeStyles = (theme: Theme) =>
    StyleSheet.create({
        page: {
            flex: 1,
            width: "100%",
            justifyContent: "space-between",
            paddingTop: 2,
            paddingBottom: 6,
        },

        screenTitle: {
            textAlign: "center",
            marginTop: -8,
            fontSize: 26,
            color: "#F3F3F3",
            fontWeight: "900",
        },

        subtitle: {
            marginTop: 8,
            textAlign: "center",
            color: "#C3C3C3B3",
            fontSize: 13,
            lineHeight: 18,
            paddingHorizontal: 16,
            fontWeight: "800",
        },

        cardsWrap: {
            marginTop: 12,
            gap: 10,
        },

        card: {
            borderRadius: 18,
            paddingHorizontal: 14,
            paddingTop: 12,
            paddingBottom: 12,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.18,
            shadowRadius: 14,
            elevation: 6,
        },

        cardTopRow: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
        },

        planTitle: {
            fontSize: 21,
            color: "#C3C3C3CC",
            fontWeight: "900",
        },

        badge: {
            minWidth: 84,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 8,
            alignItems: "center",
            justifyContent: "center",
        },

        badgeText: {
            fontSize: 10,
            fontWeight: "900",
        },

        priceRow: {
            flexDirection: "row",
            alignItems: "flex-end",
            flexWrap: "wrap",
            marginTop: 8,
        },

        priceMain: {
            fontSize: 25,
            lineHeight: 28,
            fontWeight: "900",
        },

        priceDecimals: {
            fontSize: 15,
            lineHeight: 20,
            marginBottom: 2,
            fontWeight: "900",
        },

        oldPriceWrap: {
            marginLeft: 7,
            marginBottom: 4,
            position: "relative",
            justifyContent: "center",
        },

        oldPrice: {
            fontSize: 13,
            opacity: 0.95,
            marginBottom: 15,
            fontWeight: "900",
        },

        strikeLine: {
            position: "absolute",
            height: 2,
            width: "108%",
            borderRadius: 99,
            marginBottom: 13,
            backgroundColor: "#FF3B30",
            transform: [{ rotate: "-16deg" }],
        },

        perText: {
            marginLeft: 5,
            marginBottom: 1,
            fontSize: 13,
            color: "#C3C3C3CC",
            fontWeight: "900",
        },

        cta: {
            marginTop: 12,
            minHeight: 40,
            borderRadius: 13,
            borderWidth: 2,
            alignItems: "center",
            justifyContent: "center",
        },

        ctaText: {
            fontSize: 14,
            fontWeight: "900",
        },

        featuresWrap: {
            marginTop: 14,
            gap: 8,
        },

        featureRow: {
            flexDirection: "row",
            alignItems: "center",
        },

        checkCircle: {
            width: 24,
            height: 24,
            borderRadius: 999,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 9,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 8,
            elevation: 4,
        },

        featureText: {
            flexShrink: 1,
            fontSize: 13,
            color: "#C3C3C3CC",
            fontWeight: "800",
        },

        footerText: {
            marginTop: 10,
            textAlign: "center",
            fontSize: 12,
            lineHeight: 17,
            paddingHorizontal: 18,
            color: "#C3C3C3CC",
            fontWeight: "800",
        },

        linkPink: {
            color: "#CE0093",
            fontWeight: "900",
        },
    });
