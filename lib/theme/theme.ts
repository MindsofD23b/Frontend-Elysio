export const colors = {
    light: {
        background: "#FFFFFF",
        primary: "#EC136A",
        secondary: "#9EBDCC",
        accent: "#DA9AB4",
        text: "#0B1412",
        base: "#000000",
        dbase: "#FFFFFF",
        white: "#FFFFFF",
        black: "#000000",
        card: "#000000" + "15",
        cardAccent: "#000000" + "2A",

        // screens
        rootBg: "#FFFFFF",
        cardBg: "#F5F5F5",
        cardBgDeep: "#ECECEC",
        circleBg: "#E0E0E0",
        barInactive: "#CCCCCC",

        // stats
        matchColor: "#7c72b0",
        matchValue: "#9B8FDD",
        waitColor: "#d9430e",
        freezeColor: "#6BBFDF",
        interestMusic: "#fc8a92",
        interestGaming: "#c8a4ff",
        interestTravel: "#DA9AB4",

        // plans
        planFree: "#E67FC9",
        planEssential: "#EC136A",
        planPremium: "#9B4DCA",
        grayscale: "#9CA3AF",
        gray: "#ced4da",
        orange: "#f3722c",
    },
    dark: {
        background: "#1E1E1E",
        primary: "#ec136a",
        secondary: "#8F1E4B",
        accent: "#DA9AB4",
        text: "#EAE6E7",
        base: "#FFFFFF",
        dbase: "#000000",
        white: "#FFFFFF",
        black: "#000000",
        card: "#FFFFFF" + "15",
        cardAccent: "#FFFFFF" + "2A",

        // screens
        rootBg: "#141414",
        cardBg: "#141414",
        cardBgDeep: "#131313",
        circleBg: "#222222",
        barInactive: "#3A3A3A",

        // stats
        matchColor: "#7c72b0",
        matchValue: "#9B8FDD",
        waitColor: "#d9430e",
        freezeColor: "#6BBFDF",
        interestMusic: "#fc8a92",
        interestGaming: "#c8a4ff",
        interestTravel: "#DA9AB4",

        // plans
        planFree: "#E67FC9",
        planEssential: "#EC136A",
        planPremium: "#9B4DCA",
        grayscale: "#9CA3AF",
        gray: "#ced4da",
        orange: "#f3722c",
    },
};

export type Theme = typeof colors.light;

export function strToOption(str: string | undefined | null): ThemeOptions {
    switch (str) {
        case "light":
            return ThemeOptions.light;
        case "dark":
            return ThemeOptions.dark;
        default:
            return ThemeOptions.automatic;
    }
}

export enum ThemeOptions {
    light,
    dark,
    automatic,
}
