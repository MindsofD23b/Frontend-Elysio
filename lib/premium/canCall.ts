import { CONSTANTS, PlanType } from "../constants";

export function canCall(userPlan: PlanType, currentNumberOfCalls: number) {
    const plan = CONSTANTS.PLANS[userPlan];

    return currentNumberOfCalls < plan.maxCalls;
}
