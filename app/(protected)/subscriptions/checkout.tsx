import { useState } from "react";
import * as WebBrowser from "expo-web-browser";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useTheme } from "@/lib/theme/context";
import BackWrapper from "@/components/backwrapper";
import { ShieldCheck, CreditCard, Lock } from "lucide-react-native";
import { type BillingCycle, type Plan, PLANS_MAP as PLANS } from "./plans";

// ─── Order Summary ─────────────────────────────────────────────────────────────

function OrderSummary({ plan, billing }: { plan: Plan; billing: BillingCycle }) {
    const { theme } = useTheme();
    const isYearly = billing === "yearly";
    const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
    const perMonth = isYearly ? plan.yearlyMonthPrice : plan.monthlyPrice;

    return (
        <View style={[styles.card, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Order summary
            </Text>

            <View style={styles.planRow}>
                <View style={[styles.planDot, { backgroundColor: theme.primary }]} />
                <View style={{ flex: 1 }}>
                    <Text style={[styles.planLabel, { color: theme.text }]}>
                        {plan.name} plan · {isYearly ? "Yearly" : "Monthly"}
                    </Text>
                    {isYearly && (
                        <Text style={[styles.savingNote, { color: theme.primary }]}>
                            Save 17% vs monthly
                        </Text>
                    )}
                </View>
                <Text style={[styles.planPrice, { color: theme.text }]}>
                    CHF {price.toFixed(2)}
                </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.cardAccent }]} />

            <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: theme.text }]}>
                    Total today
                </Text>
                <Text style={[styles.totalPrice, { color: theme.text }]}>
                    CHF {price.toFixed(2)}
                </Text>
            </View>

            {isYearly && (
                <Text style={[styles.perMonthNote, { color: theme.grayscale }]}>
                    CHF {perMonth.toFixed(2)}/mo · billed annually
                </Text>
            )}
        </View>
    );
}

// ─── Feature List ──────────────────────────────────────────────────────────────

function IncludedFeatures({ plan }: { plan: Plan }) {
    const { theme } = useTheme();
    return (
        <View style={[styles.card, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
                What{"'"}s included
            </Text>
            <View style={styles.featureList}>
                {plan.features.map((f, i) => (
                    <View key={i} style={styles.featureRow}>
                        <Text style={[styles.checkMark, { color: theme.primary }]}>
                            ✓
                        </Text>
                        <Text style={[styles.featureText, { color: theme.text }]}>
                            {f}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

// ─── Trust Badges ──────────────────────────────────────────────────────────────

function TrustBadges() {
    const { theme } = useTheme();
    const items = [
        { Icon: Lock, label: "Secure payment" },
        { Icon: ShieldCheck, label: "Cancel anytime" },
        { Icon: CreditCard, label: "No hidden fees" },
    ];
    return (
        <View style={styles.trustRow}>
            {items.map(({ Icon, label }) => (
                <View key={label} style={styles.trustItem}>
                    <Icon size={18} color={theme.grayscale} />
                    <Text style={[styles.trustText, { color: theme.grayscale }]}>
                        {label}
                    </Text>
                </View>
            ))}
        </View>
    );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function Checkout() {
    const { theme } = useTheme();
    const { planId, billing } = useLocalSearchParams<{
        planId: string;
        billing: BillingCycle;
    }>();
    const [loading, setLoading] = useState(false);

    const plan = PLANS[planId ?? "premium"];
    const billingCycle: BillingCycle = billing === "yearly" ? "yearly" : "monthly";

    const handleSubscribe = () => {
        setLoading(true);
        // TODO: integrate payment provider
        setTimeout(() => setLoading(false), 2000);
    };

    return (
        <BackWrapper p={false}>
            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.text }]}>Checkout</Text>
                    <Text style={[styles.subtitle, { color: theme.grayscale }]}>
                        Review your order before confirming
                    </Text>
                </View>

                <OrderSummary plan={plan} billing={billingCycle} />
                <IncludedFeatures plan={plan} />
                <TrustBadges />
            </ScrollView>

            {/* Sticky CTA */}
            <View
                style={[
                    styles.footer,
                    {
                        backgroundColor: theme.background,
                        borderTopColor: theme.cardAccent,
                    },
                ]}
            >
                <TouchableOpacity
                    style={[
                        styles.ctaBtn,
                        { backgroundColor: theme.primary },
                        loading && styles.ctaBtnDisabled,
                    ]}
                    onPress={handleSubscribe}
                    activeOpacity={0.85}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.ctaBtnText}>Confirm & Subscribe</Text>
                    )}
                </TouchableOpacity>
                <Text style={[styles.legalNote, { color: theme.grayscale }]}>
                    By subscribing you agree to our{" "}
                    <Text
                        onPress={() =>
                            WebBrowser.openBrowserAsync(
                                "https://mindsofd23b.github.io/Landing-Elysio/termsandconditions/",
                                {
                                    presentationStyle:
                                        WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
                                    controlsColor: theme.primary,
                                    toolbarColor: theme.background,
                                    enableBarCollapsing: true,
                                },
                            )
                        }
                        style={{ color: theme.primary }}
                    >
                        Terms and Conditions
                    </Text>{" "}
                    and{" "}
                    <Text
                        onPress={() =>
                            WebBrowser.openBrowserAsync(
                                "https://mindsofd23b.github.io/Landing-Elysio/privacypolicy/",
                                {
                                    presentationStyle:
                                        WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
                                    controlsColor: theme.primary,
                                    toolbarColor: theme.background,
                                    enableBarCollapsing: true,
                                },
                            )
                        }
                        style={{ color: theme.primary }}
                    >
                        Privacy Policy
                    </Text>
                    .
                </Text>
            </View>
        </BackWrapper>
    );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    scroll: {
        paddingHorizontal: 20,
        paddingBottom: 24,
        gap: 14,
    },
    header: {
        paddingTop: 8,
        paddingBottom: 4,
    },
    title: {
        fontSize: 26,
        fontWeight: "800",
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 14,
        marginTop: 4,
    },

    card: {
        borderRadius: 16,
        padding: 18,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: "700",
        letterSpacing: 0.4,
        textTransform: "uppercase",
        marginBottom: 14,
    },

    planRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    planDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    planLabel: {
        fontSize: 15,
        fontWeight: "600",
    },
    savingNote: {
        fontSize: 12,
        marginTop: 2,
        fontWeight: "500",
    },
    planPrice: {
        fontSize: 15,
        fontWeight: "700",
    },
    divider: {
        height: 1,
        marginVertical: 14,
    },
    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: "700",
    },
    totalPrice: {
        fontSize: 20,
        fontWeight: "800",
        letterSpacing: -0.5,
    },
    perMonthNote: {
        fontSize: 12,
        marginTop: 6,
        textAlign: "right",
    },

    featureList: { gap: 10 },
    featureRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
    },
    checkMark: {
        fontSize: 13,
        fontWeight: "700",
        marginTop: 2,
    },
    featureText: {
        fontSize: 14,
        lineHeight: 20,
        flex: 1,
    },

    trustRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingVertical: 8,
    },
    trustItem: {
        alignItems: "center",
        gap: 6,
    },
    trustText: {
        fontSize: 11,
        fontWeight: "500",
    },

    footer: {
        paddingHorizontal: 20,
        paddingTop: 14,
        paddingBottom: 32,
        borderTopWidth: 1,
    },
    ctaBtn: {
        borderRadius: 50,
        paddingVertical: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    ctaBtnDisabled: {
        opacity: 0.7,
    },
    ctaBtnText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
    legalNote: {
        fontSize: 11,
        textAlign: "center",
        marginTop: 10,
        lineHeight: 16,
    },
});
