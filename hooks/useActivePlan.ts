import { useEffect, useState } from "react";
import Purchases, { CustomerInfo } from "react-native-purchases";
import { PlanType } from "@/lib/constants";
import { usePurchasesReady } from "@/lib/PurchasesContext";

function resolvePlan(info: CustomerInfo): PlanType {
    const active = info.entitlements.active;
    if (active[PlanType.GOLD]) return PlanType.GOLD;
    if (active[PlanType.PREMIUM]) return PlanType.PREMIUM;
    if (active[PlanType.BASIC]) return PlanType.BASIC;
    return PlanType.FREE;
}

export function useActivePlan() {
    const purchasesReady = usePurchasesReady();
    const [plan, setPlan] = useState<PlanType>(PlanType.FREE);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!purchasesReady) return;
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
    }, [purchasesReady]);

    return { plan, loading };
}
