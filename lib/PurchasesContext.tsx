import { createContext, useContext } from "react";

export const PurchasesContext = createContext(false);

export function usePurchasesReady() {
    return useContext(PurchasesContext);
}
