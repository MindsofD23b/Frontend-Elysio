import { useColorScheme } from "react-native";
import { ThemeContext } from "@/lib/theme/context";
import { makeGlobalStyles } from "@/lib/theme/styles";
import { colors, strToOption, Theme, ThemeOptions } from "@/lib/theme/theme";
import { useEffect, useMemo, useState } from "react";
import { get } from "@/utils/store";

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

    const gs = useMemo(() => makeGlobalStyles(theme), [theme]);

    const contextValue = useMemo(() => ({ theme, gs, setTheme }), [theme, gs]);

    return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}
