import { useTheme } from "@/lib/theme/context";
import BackWrapper from "@/components/backwrapper";
import { Text } from "react-native";
import Input from "@/components/input";
import PhoneNumberInput from "@/components/PhoneNumberInput";
import { BtnText, Button } from "@/components/button";
import DateInput from "@/components/dateInput";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import i18n from "@/i18n";
export default function AddProfileDataPage() {
    const { gs, theme } = useTheme();

    const [dateSelect, setDateSelect] = useState(false);

    const t = (key: string) => i18n.t(`auth.register.addProfile.${key}`);
    useEffect(() => {
        router.prefetch("/register/sendVerificationEmail");
    }, []);

    function handleTelefonData(
        prefix: string,
        tel: string,
        internationalTel: string,
        nationalTel: string | undefined,
    ) {
        // TODO: Implement backend call
        const _ = prefix;
        const __ = tel;
        const ___ = internationalTel;
        const ____ = nationalTel;
    }

    return (
        <>
            <BackWrapper>
                <Text style={[gs.h1, { marginTop: 35 }]}>Finish your Profile</Text>
                <Text style={[gs.bodyText, { marginTop: 10, color: theme.base + "54" }]}>
                    {t("subtitleStart")}
                    <Text style={{ fontWeight: "bold" }}>{t("profile")}</Text>{" "}
                    {t("subtitleEnd")}
                </Text>
                <PhoneNumberInput sendData={handleTelefonData} />
                <Input placeholder={t("fullName")} style={{ marginVertical: 16 }} />
                <Input placeholder={t("jobTitle")} style={{ marginVertical: 16 }} />

                {!dateSelect && (
                    <Button onPress={() => setDateSelect(true)}>
                        <BtnText>{t("selectBirthday")}</BtnText>
                    </Button>
                )}
                {dateSelect && <DateInput />}

                <Button
                    onPress={() => router.push("/register/sendVerificationEmail")}
                    style={{ marginTop: "auto" }}
                >
                    <BtnText>{t("continue")}</BtnText>
                </Button>
            </BackWrapper>
        </>
    );
}
