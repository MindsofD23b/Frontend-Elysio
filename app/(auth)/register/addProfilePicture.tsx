import { useTheme } from "@/lib/theme/context";
import BackWrapper from "@/components/backwrapper";
import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { BtnText, Button } from "@/components/button";
import { router, Stack } from "expo-router";
import { createT } from "@/i18n";

const I18N_PATH = "auth.register.profilePicture";

export default function AddProfilePicturePage() {
    const { gs, theme } = useTheme();
    const t = createT(I18N_PATH);

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <BackWrapper>
                <Text style={[gs.h1, { marginTop: 35 }]}>{t("title")}</Text>

                <Text style={[gs.bodyText, { marginTop: 10, color: theme.base + "54" }]}>
                    {t("makeAttractive")}{" "}
                    <Text style={{ fontWeight: "bold" }}>{t("makeAttractiveBold")}</Text>{" "}
                    {t("makeAttractiveSuffix")}
                </Text>

                <Pressable onPress={() => alert("Profile picture upload comes next")}>
                    <View
                        style={{
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            marginVertical: 32,
                            borderRadius: 16,
                        }}
                    >
                        <Image
                            source={require("@/assets/blank-profile.png")}
                            placeholder="|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj["
                            transition={1000}
                            style={{ width: 200, height: 200, borderRadius: 16 }}
                        />
                    </View>
                </Pressable>

                <Button
                    onPress={() => router.push("/register/addProfileData")}
                    style={{ marginTop: "auto" }}
                >
                    <BtnText>{t("continue")}</BtnText>
                </Button>
            </BackWrapper>
        </>
    );
}
