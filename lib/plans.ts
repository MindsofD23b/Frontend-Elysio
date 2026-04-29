export type BillingCycle = "monthly" | "yearly";

export interface Plan {
    id: string;
    tier: string;
    name: string;
    nameItalic: string;
    tagline: string;
    monthlyPrice: number;
    yearlyPrice: number;
    yearlyMonthPrice: number;
    features: string[];
    badge?: string;
    highlight?: boolean;
}

export const PLANS: Plan[] = [
    {
        id: "basic",
        tier: "01  Basic",
        name: "Basic",
        nameItalic: "plan",
        tagline: "One request at a time",
        monthlyPrice: 5.9,
        yearlyMonthPrice: 4.9,
        yearlyPrice: 58.9,
        features: [
            "Up to 10 video calls per day",
            "Basic profile customization",
            "Text chat after matching",
            "Standard support",
        ],
    },
    {
        id: "premium",
        tier: "02  Premium",
        name: "Premium",
        nameItalic: "plan",
        tagline: "Double your output 2×",
        monthlyPrice: 12.9,
        yearlyMonthPrice: 10.9,
        yearlyPrice: 130.9,
        badge: "BEST VALUE",
        highlight: true,
        features: [
            "Everything in Basic",
            "Up to 30 video calls per day",
            "See who liked you",
            "Priority in discovery feed",
            "Read receipts in chat",
            "Standard support",
        ],
    },
    {
        id: "gold",
        tier: "03  Gold",
        name: "Gold",
        nameItalic: "plan",
        tagline: "Fitting your individual needs",
        monthlyPrice: 29.9,
        yearlyMonthPrice: 24.9,
        yearlyPrice: 298.9,
        features: [
            "Everything in Premium",
            "Up to 100 video calls per day",
            "Profile boost every week",
            "Standard support",
        ],
    },
];

export const PLANS_MAP: Record<string, Plan> = Object.fromEntries(
    PLANS.map((p) => [p.id, p]),
);
