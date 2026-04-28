import { useCallback, useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Dimensions,
    NativeSyntheticEvent,
    NativeScrollEvent,
    ActivityIndicator,
} from "react-native";
import { useTheme } from "@/lib/theme/context";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import BackWrapper from "@/components/backwrapper";
import { router, useFocusEffect } from "expo-router";
import { type BillingCycle, type Plan, PLANS } from "@/lib/plans";
import Purchases from "react-native-purchases";
import { useActivePlan } from "@/hooks/useActivePlan";
import { useSafeAreaControl } from "@/components/SafeArea";

type RcPrice = { price: number; currencyCode: string };
type RcPrices = Record<string, { monthly?: RcPrice; yearly?: RcPrice }>;

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Card takes most of the screen, but leaves a peek of the next card
const CARD_WIDTH = SCREEN_WIDTH * 0.82;
const CARD_GAP = 14;
const SIDE_PADDING = (SCREEN_WIDTH - CARD_WIDTH) / 2; // bleibt gleich

// ─── Billing Toggle ───────────────────────────────────────────────────────────

function BillingToggle({
    value,
    onChange,
}: {
    value: BillingCycle;
    onChange: (v: BillingCycle) => void;
}) {
    const { theme } = useTheme();
    return (
        <View style={[styles.toggleTrack, { backgroundColor: theme.accent + "18" }]}>
            <TouchableOpacity
                style={[
                    styles.toggleBtn,
                    value === "monthly" && { backgroundColor: theme.background },
                ]}
                onPress={() => onChange("monthly")}
                activeOpacity={0.8}
            >
                <Text
                    style={[
                        styles.toggleText,
                        { color: value === "monthly" ? theme.text : theme.accent },
                    ]}
                >
                    Monthly
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[
                    styles.toggleBtn,
                    value === "yearly" && { backgroundColor: theme.background },
                ]}
                onPress={() => onChange("yearly")}
                activeOpacity={0.8}
            >
                <Text
                    style={[
                        styles.toggleText,
                        { color: value === "yearly" ? theme.text : theme.accent },
                    ]}
                >
                    Yearly
                </Text>
                {value === "yearly" && (
                    <View style={[styles.savePill, { backgroundColor: theme.primary }]}>
                        <Text style={styles.savePillText}>-17%</Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
}

// ─── Plan Card ────────────────────────────────────────────────────────────────

function PlanCard({
    plan,
    billing,
    rcPrices,
    isActive,
    onSubscribe,
}: {
    plan: Plan;
    billing: BillingCycle;
    rcPrices: RcPrices;
    isActive: boolean;
    onSubscribe: () => void;
}) {
    const { theme } = useTheme();
    const price = billing === "monthly" ? plan.monthlyPrice : plan.yearlyMonthPrice;
    const rcData =
        billing === "monthly" ? rcPrices[plan.id]?.monthly : rcPrices[plan.id]?.yearly;
    const displayPrice = rcData?.price ?? price;
    const displayCurrency = rcData?.currencyCode ?? "CHF";
    const isHighlight = plan.highlight;
    const isMonthly = billing === "monthly";

    const cardBg = isHighlight ? theme.primary : theme.background;
    const textColor = isHighlight ? "#fff" : theme.text;
    const mutedColor = isHighlight ? "rgba(255,255,255,0.6)" : theme.accent;
    const dividerColor = isHighlight ? "rgba(255,255,255,0.15)" : theme.accent + "22";
    const btnBg = isHighlight ? "#fff" : theme.primary;
    const btnTextColor = isHighlight ? theme.primary : "#fff";
    const priceText = isMonthly ? "/mo" : "/annually";

    const whole = Math.floor(displayPrice);
    const cents = (displayPrice % 1).toFixed(2).slice(1);

    const opacity = useSharedValue(1);

    useEffect(() => {
        opacity.value = 0;

        opacity.value = withTiming(1, { duration: 350 });
    }, [billing]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    const { setDisabledEdges } = useSafeAreaControl();

    useFocusEffect(
        useCallback(() => {
            setDisabledEdges(["top"]);

            return () => {
                setDisabledEdges([]);
            };
        }, []),
    );

    return (
        <View
            style={[
                styles.card,
                {
                    backgroundColor: cardBg,
                    width: CARD_WIDTH,
                    shadowColor: isHighlight ? theme.primary : "#000",
                    shadowOpacity: isHighlight ? 0.25 : 0.1,
                    borderWidth: isActive ? 2 : 0,
                    borderColor: isActive
                        ? isHighlight
                            ? "#fff"
                            : theme.primary
                        : "transparent",
                },
            ]}
        >
            {/* Badge */}
            {isActive ? (
                <View style={styles.badgeRow}>
                    <View
                        style={[
                            styles.badge,
                            {
                                backgroundColor: isHighlight
                                    ? "rgba(255,255,255,0.3)"
                                    : theme.primary + "22",
                                borderColor: isHighlight
                                    ? "rgba(255,255,255,0.5)"
                                    : theme.primary,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.badgeText,
                                { color: isHighlight ? "#fff" : theme.primary },
                            ]}
                        >
                            ✓ ACTIVE
                        </Text>
                    </View>
                </View>
            ) : plan.badge ? (
                <View style={styles.badgeRow}>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{plan.badge}</Text>
                    </View>
                </View>
            ) : (
                <View style={styles.badgePlaceholder} />
            )}

            {/* Tier */}
            <Text style={[styles.tierLabel, { color: mutedColor }]}>{plan.tier}</Text>

            {/* Name */}
            <Text style={[styles.planName, { color: textColor }]}>
                {plan.name}
                <Text style={[styles.planNameItalic, { color: mutedColor }]}>
                    {plan.nameItalic}
                </Text>
            </Text>

            <Text style={[styles.tagline, { color: mutedColor }]}>{plan.tagline}</Text>

            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            {/* Price + CTA */}
            <View style={styles.priceRow}>
                <TouchableOpacity
                    style={[styles.ctaBtn, { backgroundColor: btnBg }]}
                    onPress={onSubscribe}
                    activeOpacity={0.85}
                >
                    <Text style={[styles.ctaBtnText, { color: btnTextColor }]}>
                        {isActive ? "Active" : "Subscribe"}
                    </Text>
                </TouchableOpacity>

                <Animated.View style={[styles.priceBlock, animatedStyle]}>
                    <View style={styles.priceBlock}>
                        <Text style={[styles.priceDollar, { color: mutedColor }]}>
                            {displayCurrency}
                        </Text>
                        <Text style={[styles.priceAmount, { color: textColor }]}>
                            {whole}
                        </Text>
                        <View>
                            <Text style={[styles.priceCents, { color: textColor }]}>
                                {cents}
                            </Text>
                            <Text
                                style={[
                                    styles.pricePer,
                                    { color: mutedColor, minWidth: 50 },
                                ]}
                            >
                                {priceText}
                            </Text>
                        </View>
                    </View>
                </Animated.View>
            </View>

            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            {/* Features */}
            <View style={styles.featureList}>
                {plan.features.map((f, i) => (
                    <View key={i} style={styles.featureRow}>
                        <Text
                            style={[
                                styles.checkMark,
                                { color: isHighlight ? "#fff" : theme.primary },
                            ]}
                        >
                            ✓
                        </Text>
                        <Text style={[styles.featureText, { color: textColor }]}>
                            {f}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

// ─── Pagination Dots ──────────────────────────────────────────────────────────

function PaginationDots({ total, active }: { total: number; active: number }) {
    const { theme } = useTheme();
    return (
        <View style={styles.dotsRow}>
            {Array.from({ length: total }).map((_, i) => (
                <View
                    key={i}
                    style={[
                        styles.dot,
                        {
                            backgroundColor:
                                i === active ? theme.primary : theme.accent + "40",
                            width: i === active ? 20 : 6,
                        },
                    ]}
                />
            ))}
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function SubscriptionPlans() {
    const { theme } = useTheme();
    const { plan: activePlan } = useActivePlan();
    const [billing, setBilling] = useState<BillingCycle>("monthly");
    const [activeIndex, setActiveIndex] = useState(1);
    const [rcPrices, setRcPrices] = useState<RcPrices>({});
    const [offeringsLoading, setOfferingsLoading] = useState(true);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        async function loadOfferings() {
            try {
                const offerings = await Purchases.getOfferings();
                const prices: RcPrices = {};
                for (const plan of PLANS) {
                    const monthlyOffering = offerings.all[`${plan.id}_monthly`];
                    const yearlyOffering = offerings.all[`${plan.id}_yearly`];
                    prices[plan.id] = {
                        monthly: monthlyOffering?.monthly
                            ? {
                                  price: monthlyOffering.monthly.product.price,
                                  currencyCode:
                                      monthlyOffering.monthly.product.currencyCode,
                              }
                            : undefined,
                        yearly: yearlyOffering?.annual
                            ? {
                                  price: yearlyOffering.annual.product.price,
                                  currencyCode:
                                      yearlyOffering.annual.product.currencyCode,
                              }
                            : undefined,
                    };
                }
                setRcPrices(prices);
            } catch {
                // fall back to hardcoded prices silently
            } finally {
                setOfferingsLoading(false);
            }
        }
        loadOfferings();
    }, []);

    const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + CARD_GAP));
        setActiveIndex(Math.max(0, Math.min(index, PLANS.length - 1)));
    };

    if (offeringsLoading) {
        return (
            <View
                style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: theme.background,
                }}
            >
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <BackWrapper m p={false}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>
                    Choose your plan
                </Text>
                <Text style={[styles.subtitle, { color: theme.accent }]}>
                    Upgrade or downgrade at any time.
                </Text>
            </View>

            {/* Toggle */}
            <View style={styles.toggleWrapper}>
                <BillingToggle value={billing} onChange={setBilling} />
            </View>

            {/* Cards — peek layout */}
            <FlatList
                ref={flatListRef}
                data={PLANS}
                keyExtractor={(p) => p.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_WIDTH + CARD_GAP}
                snapToAlignment="start"
                decelerationRate="fast"
                contentContainerStyle={{
                    paddingHorizontal: SIDE_PADDING,
                    paddingVertical: 20,
                    gap: CARD_GAP,
                }}
                initialScrollIndex={1}
                getItemLayout={(_, index) => ({
                    length: CARD_WIDTH + CARD_GAP,
                    offset: (CARD_WIDTH + CARD_GAP) * index,
                    index,
                })}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                renderItem={({ item }) => (
                    <PlanCard
                        plan={item}
                        billing={billing}
                        rcPrices={rcPrices}
                        isActive={activePlan === item.id}
                        onSubscribe={() => {
                            router.push({
                                pathname: "/subscriptions/checkout",
                                params: { planId: item.id, billing },
                            });
                        }}
                    />
                )}
            />

            {/* Dots */}
            <PaginationDots total={PLANS.length} active={activeIndex} />

            <Text style={[styles.cancelNote, { color: theme.accent }]}>
                Cancel anytime · No hidden fees
            </Text>
        </BackWrapper>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 24,
        paddingTop: 16,
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

    toggleWrapper: {
        paddingHorizontal: 24,
        marginTop: 14,
    },
    toggleTrack: {
        flexDirection: "row",
        borderRadius: 10,
        padding: 3,
    },
    toggleBtn: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        gap: 6,
    },
    toggleText: {
        fontSize: 14,
        fontWeight: "600",
    },
    savePill: {
        borderRadius: 20,
        paddingHorizontal: 6,
        paddingVertical: 1,
    },
    savePillText: {
        fontSize: 10,
        fontWeight: "700",
        color: "#fff",
    },

    // Card
    card: {
        borderRadius: 20,
        padding: 22,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 20,
        elevation: 6,
    },
    badgeRow: { marginBottom: 10 },
    badgePlaceholder: { height: 24, marginBottom: 10 },
    badge: {
        alignSelf: "flex-start",
        backgroundColor: "rgba(255,255,255,0.25)",
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.35)",
    },
    badgeText: {
        fontSize: 10,
        fontWeight: "700",
        color: "#fff",
        letterSpacing: 1,
    },
    tierLabel: {
        fontSize: 11,
        fontWeight: "500",
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    planName: {
        fontSize: 32,
        fontWeight: "800",
        letterSpacing: -0.5,
        lineHeight: 36,
    },
    planNameItalic: {
        fontStyle: "italic",
        fontWeight: "400",
        fontSize: 28,
    },
    tagline: {
        fontSize: 13,
        marginTop: 6,
    },
    divider: {
        height: 1,
        marginVertical: 16,
    },
    priceRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    ctaBtn: {
        paddingHorizontal: 22,
        paddingVertical: 12,
        borderRadius: 50,
    },
    ctaBtnText: {
        fontSize: 15,
        fontWeight: "700",
    },
    priceBlock: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    priceDollar: {
        fontSize: 14,
        marginTop: 4,
        fontWeight: "500",
    },
    priceAmount: {
        fontSize: 36,
        fontWeight: "800",
        lineHeight: 40,
        letterSpacing: -1,
    },
    priceCents: {
        fontSize: 13,
        fontWeight: "600",
        lineHeight: 18,
    },
    pricePer: {
        fontSize: 11,
        lineHeight: 14,
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
        fontSize: 13,
        lineHeight: 18,
        flex: 1,
    },

    dotsRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 6,
        marginTop: 4,
        marginBottom: 8,
    },
    dot: {
        height: 6,
        borderRadius: 3,
    },
    cancelNote: {
        fontSize: 12,
        textAlign: "center",
        paddingBottom: 20,
    },
});
