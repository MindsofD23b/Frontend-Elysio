// with ChatGPT
import { createContext, useContext } from "react";
import { makeGlobalStyles } from "@/app/theme/styles";
import { Theme } from "@/app/theme/theme";

// Made with https://claude.ai
type TThemeContext = {
    theme: Theme;
    gs: ReturnType<typeof makeGlobalStyles>;
    setTheme: (t: Theme) => void;
};

export const ThemeContext = createContext<TThemeContext | null>(null);

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("ThemeProvider missing");
    return ctx;
}
