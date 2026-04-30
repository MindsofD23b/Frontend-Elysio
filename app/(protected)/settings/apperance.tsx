import { createT } from "@/i18n";
import { useTheme } from "@/lib/theme/context";
import { colors, strToOption, ThemeOptions } from "@/lib/theme/theme";
import BackWrapper from "@/components/backwrapper";
import Select from "@/components/SelectInput";
import { get, store } from "@/utils/store";
import { Image } from "expo-image";
import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Switch, Text, useColorScheme, View } from "react-native";
import { useSafeAreaControl } from "@/components/SafeArea";
import { useFocusEffect } from "expo-router";

const t = createT("settings.appearance");

export default function Apperance() {
    const COLOR_SCHEME = useColorScheme();
    const [mode, setModeRaw] = useState<ThemeOptions>();
    const [loaded, setLoaded] = useState(false);
    const { theme, setTheme } = useTheme();

    const { setDisableSafeArea } = useSafeAreaControl();

    useFocusEffect(
        useCallback(() => {
            setDisableSafeArea(true);

            return () => {
                setDisableSafeArea(false);
            };
        }, [setDisableSafeArea]),
    );

    useEffect(() => {
        if (!loaded) return;
        const resolved =
            mode === ThemeOptions.automatic ? strToOption(COLOR_SCHEME ?? "light") : mode;
        setTheme(colors[resolved === ThemeOptions.dark ? "dark" : "light"]);
    }, [mode, loaded, COLOR_SCHEME, setTheme]);

    useEffect(() => {
        get<ThemeOptions>("theme").then((val) => {
            setModeRaw(val || ThemeOptions.light);
            setLoaded(true);
        });
    }, []);

    async function setMode(newVal: ThemeOptions) {
        setModeRaw(newVal);
        await store("theme", newVal);
    }

    function setAutomatic() {
        if (mode === ThemeOptions.automatic) {
            setMode(strToOption(COLOR_SCHEME ?? "light"));
            return;
        }
        setMode(ThemeOptions.automatic);
    }

    const s = makeStyles(theme);

    return (
        <BackWrapper m bg={theme.cardBg}>
            <Text style={s.sectionLabel}>{t("theme")}</Text>
            <View style={[s.card, { backgroundColor: theme.background }]}>
                <View style={s.pickerRow}>
                    <Pressable
                        style={s.themeOption}
                        onPress={() => setMode(ThemeOptions.light)}
                    >
                        <Image
                            source={require("@/assets/images/preview-ligth.png")}
                            style={s.preview}
                            contentFit="fill"
                        />
                        <Text style={[s.optionLabel, { color: theme.text }]}>
                            {t("light")}
                        </Text>
                        <Select
                            checked={mode === ThemeOptions.light}
                            onChange={() => setMode(ThemeOptions.light)}
                            label=""
                        />
                    </Pressable>

                    <View style={[s.dividerV, { backgroundColor: theme.text + "14" }]} />

                    <Pressable
                        style={s.themeOption}
                        onPress={() => setMode(ThemeOptions.dark)}
                    >
                        <Image
                            source={require("@/assets/images/preview-dark.png")}
                            style={s.preview}
                            contentFit="fill"
                        />
                        <Text style={[s.optionLabel, { color: theme.text }]}>
                            {t("dark")}
                        </Text>
                        <Select
                            checked={mode === ThemeOptions.dark}
                            label=""
                            onChange={() => setMode(ThemeOptions.dark)}
                        />
                    </Pressable>
                </View>

                <View style={[s.dividerH, { backgroundColor: theme.text + "14" }]} />

                <View style={s.switchRow}>
                    <Text style={[s.switchLabel, { color: theme.text }]}>
                        {t("systemTheme")}
                    </Text>
                    <Switch
                        value={mode === ThemeOptions.automatic}
                        onValueChange={() => setAutomatic()}
                        trackColor={{ false: theme.cardAccent, true: theme.primary }}
                        ios_backgroundColor={theme.cardAccent}
                        thumbColor={theme.dbase}
                    />
                </View>
            </View>
        </BackWrapper>
    );
}

const makeStyles = (theme: any) =>
    StyleSheet.create({
        sectionLabel: {
            fontSize: 13,
            color: "rgba(100,100,100,0.9)",
            marginBottom: 8,
            marginLeft: 4,
            fontWeight: "400",
        },
        card: {
            borderRadius: 16,
            overflow: "hidden",
        },
        pickerRow: {
            flexDirection: "row",
            justifyContent: "center",
            paddingVertical: 24,
            paddingHorizontal: 16,
        },
        themeOption: {
            flex: 1,
            alignItems: "center",
            gap: 10,
        },
        preview: { height: 150, width: 80 },
        optionLabel: { fontSize: 14, fontWeight: "500" },
        dividerV: { width: StyleSheet.hairlineWidth, marginHorizontal: 16 },
        dividerH: { height: StyleSheet.hairlineWidth, marginHorizontal: 16 },
        switchRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 14,
        },
        switchLabel: { fontSize: 15, fontWeight: "500" },
    });
