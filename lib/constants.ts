export enum PlanType {
    FREE = "free",
    PAID = "paid",
}

export const CONSTANTS = {
    PLANS: {
        [PlanType.FREE]: {
            maxCalls: 10,
        },
        [PlanType.PAID]: {
            maxCalls: 50,
        },
    },
};
