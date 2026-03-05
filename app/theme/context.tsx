import { createContext, useContext } from "react";
import { makeGlobalStyles } from "@/app/theme/styles";
import { colors } from "@/app/theme/theme";

// Made with https://claude.ai
type TThemeContext = {
    theme: typeof colors.light;
    gs: ReturnType<typeof makeGlobalStyles>;
};

export const ThemeContext = createContext<TThemeContext | null>(null);
export const useTheme = () => useContext(ThemeContext)!;
