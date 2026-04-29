export enum PlanType {
    FREE = "free",
    BASIC = "basic",
    PREMIUM = "premium",
    GOLD = "gold",
}

export const CONSTANTS = {
    PLANS: {
        [PlanType.FREE]: { maxCalls: 5 },
        [PlanType.BASIC]: { maxCalls: 10 },
        [PlanType.PREMIUM]: { maxCalls: 30 },
        [PlanType.GOLD]: { maxCalls: 100 },
    },
};
