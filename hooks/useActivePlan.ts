import { useEffect, useState } from "react";
import Purchases, { CustomerInfo } from "react-native-purchases";
import { PlanType } from "@/lib/constants";

function resolvePlan(info: CustomerInfo): PlanType {
    const active = info.entitlements.active;
    if (active[PlanType.GOLD]) return PlanType.GOLD;
    if (active[PlanType.PREMIUM]) return PlanType.PREMIUM;
    if (active[PlanType.BASIC]) return PlanType.BASIC;
    return PlanType.FREE;
}

export function useActivePlan() {
    const [plan, setPlan] = useState<PlanType>(PlanType.FREE);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Purchases.getCustomerInfo()
            .then((info) => setPlan(resolvePlan(info)))
            .catch(() => setPlan(PlanType.FREE))
            .finally(() => setLoading(false));

        const remove = Purchases.addCustomerInfoUpdateListener((info) => {
            setPlan(resolvePlan(info));
        });

        return () => {
            if (typeof remove === "function") remove();
            else if (remove && typeof (remove as any).remove === "function")
                (remove as any).remove();
        };
    }, []);

    return { plan, loading };
}
