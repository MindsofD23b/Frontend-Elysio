// theme/context.tsx
import { createContext, useContext } from "react";
import { makeGlobalStyles } from "./styles";
import { colors } from "./theme";

type TThemeContext = {
    theme: typeof colors.light;
    gs: ReturnType<typeof makeGlobalStyles>;
};

export const ThemeContext = createContext<TThemeContext | null>(null);
export const useTheme = () => useContext(ThemeContext)!;