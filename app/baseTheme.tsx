import { useColorScheme } from "react-native";
import { ThemeContext } from "./theme/context";
import { makeGlobalStyles } from "./theme/styles";
import { colors } from "./theme/theme";

export default function BaseTheme({ children }: { children: React.ReactNode }) {
    const colorScheme = useColorScheme();
    const theme = colors[colorScheme === "dark" ? "dark" : "light"];
    const gs = makeGlobalStyles(theme);

    return (
        <ThemeContext.Provider value={{ theme, gs }}>
            {children}
        </ThemeContext.Provider>
    );
}