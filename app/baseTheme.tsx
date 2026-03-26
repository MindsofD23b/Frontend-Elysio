import { useColorScheme } from "react-native";
import { ThemeContext } from "@/app/theme/context";
import { makeGlobalStyles } from "@/app/theme/styles";
import { colors, strToOption, Theme, ThemeOptions } from "@/app/theme/theme";
import { useEffect, useState } from "react";
import { get, store } from "@/utils/store";

export default function BaseTheme({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>(colors.light);
    const COLOR_SCHEME = useColorScheme();

    useEffect(() => {
        get<ThemeOptions>("theme").then((saved) => {
            const option = saved ?? ThemeOptions.automatic;
            const resolved =
                option === ThemeOptions.automatic ? strToOption(COLOR_SCHEME) : option;

            setTheme(colors[resolved === ThemeOptions.dark ? "dark" : "light"]);
        });
    }, [COLOR_SCHEME]);

    const gs = makeGlobalStyles(theme);

    return (
        <ThemeContext.Provider value={{ theme, gs, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
