import React, { useState } from "react";
import { useColorScheme } from "react-native";
import { ThemeContext } from "./theme/context";
import { makeGlobalStyles } from "./theme/styles";
import { colors, Theme } from "./theme/theme";

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
