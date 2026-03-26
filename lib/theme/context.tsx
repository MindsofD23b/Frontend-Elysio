// Made with ChatGPT
import { createContext, useContext } from "react";
import { makeGlobalStyles } from "@/lib/theme/styles";
import { Theme } from "@/lib/theme/theme";

// Made with https://claude.ai
type TThemeContext = {
    theme: Theme;
    gs: ReturnType<typeof makeGlobalStyles>;
    // with ChatGPT
    setTheme: (t: Theme) => void;
};

export const ThemeContext = createContext<TThemeContext | null>(null);

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("ThemeProvider missing");
    return ctx;
}
