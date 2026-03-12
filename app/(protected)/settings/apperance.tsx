import { useTheme } from "@/app/theme/context";
import { colors, strToOption, ThemeOptions } from "@/app/theme/theme";
import BackWrapper from "@/components/backwrapper";
import Select from "@/components/SelectInput";
import { get, store } from "@/utils/store";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { Pressable, Switch, Text, useColorScheme, View } from "react-native";

export default function Apperance() {
    const COLOR_SCHEME = useColorScheme();
    const [mode, setModeRaw] = useState<ThemeOptions>(ThemeOptions.light);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        const resolved =
            mode === ThemeOptions.automatic ? strToOption(COLOR_SCHEME ?? "light") : mode;

        setTheme(colors[resolved === ThemeOptions.dark ? "dark" : "light"]);
    }, [mode]);

    useEffect(() => {
        get<ThemeOptions>("theme").then((val) => {
            setModeRaw(val || ThemeOptions.light);
        });
    }, []);

    async function setMode(newVal: ThemeOptions) {
        setModeRaw(newVal);
        await store("theme", newVal);

        console.log(newVal);
    }

    function setAutomatic() {
        if (mode === ThemeOptions.automatic) {
            setMode(strToOption(COLOR_SCHEME ?? "light"));
            return;
        }
        setMode(ThemeOptions.automatic);
    }

    return (
        <>
            <BackWrapper>
                <View
                    style={{
                        backgroundColor: theme.card,
                        paddingVertical: 16,
                        borderRadius: 24,
                    }}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            gap: 24,
                            justifyContent: "center",
                            marginTop: 16,
                        }}
                    >
                        <Pressable
                            onPress={() => setMode(ThemeOptions.light)}
                            style={{
                                flex: 1,
                                maxWidth: 100,
                                flexDirection: "column",
                                gap: 8,
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <Image
                                source={require("@/assets/images/preview-ligth.png")}
                                style={{ height: 150, width: 80 }}
                                contentFit="fill"
                            />
                            <Text style={{ color: theme.text }}>Light</Text>
                            <Select
                                checked={mode === ThemeOptions.light}
                                onChange={() => setMode(ThemeOptions.light)}
                                label=""
                            />
                        </Pressable>
                        <Pressable
                            onPress={() => setMode(ThemeOptions.dark)}
                            style={{
                                flexDirection: "column",
                                flex: 1,
                                maxWidth: 100,
                                gap: 8,
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <Image
                                source={require("@/assets/images/preview-dark.png")}
                                style={{ height: 150, width: 80 }}
                                contentFit="fill"
                            />
                            <Text style={{ color: theme.text }}>Dark</Text>
                            <Select
                                checked={mode === ThemeOptions.dark}
                                label=""
                                onChange={() => setMode(ThemeOptions.dark)}
                            />
                        </Pressable>
                    </View>
                    <View
                        style={{
                            backgroundColor: theme.cardAccent,
                            height: 1,
                            borderRadius: 10,
                            marginHorizontal: 16,
                        }}
                    />
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            paddingHorizontal: 20,
                            paddingTop: 10,
                            alignItems: "center",
                        }}
                    >
                        <Text style={{ color: theme.text }}>System Theme</Text>

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
        </>
    );
}
