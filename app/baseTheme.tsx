import { useColorScheme } from "react-native";
import { ThemeContext } from "@/app/theme/context";
import { makeGlobalStyles } from "@/app/theme/styles";
import { colors, Theme } from "@/app/theme/theme";
import { useState } from "react";

export default function BaseTheme({ children }: { children: React.ReactNode }) {
    const system = useColorScheme();

    const [theme, setTheme] = useState<Theme>(
        colors[system === "dark" ? "dark" : "light"],
    );

    const gs = makeGlobalStyles(theme);

    return (
        <ThemeContext.Provider value={{ theme, gs, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
