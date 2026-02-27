// theme/context.tsx
import { createContext, useContext } from "react";
import { makeGlobalStyles } from "./styles";
import { colors } from "./theme";

type ThemeContext = {
    theme: typeof colors.light;
    gs: ReturnType<typeof makeGlobalStyles>;
};

export const themeContext = createContext<ThemeContext | null>(null);
export const useTheme = () => useContext(themeContext)!;