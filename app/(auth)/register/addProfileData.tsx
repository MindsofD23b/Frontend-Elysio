import { useTheme } from "@/lib/theme/context";
import BackWrapper from "@/components/backwrapper";
import { Text } from "react-native";
import Input from "@/components/input";
import PhoneNumberInput from "@/components/PhoneNumberInput";
import { BtnText, Button } from "@/components/button";
import DateInput from "@/components/dateInput";
import { useEffect, useState } from "react";
import { router } from "expo-router";

export default function AddProfileDataPage() {
    const { gs, theme } = useTheme();

    const [dateSelect, setDateSelect] = useState(false);

    useEffect(() => {
        router.prefetch("/register/sendVerificationEmail");
    }, []);

    function handleTelefonData(
        tel: string,
        internationalTel: string,
        nationalTel: string | undefined,
    ) {}

    return (
        <>
            <BackWrapper>
                <Text style={[gs.h1, { marginTop: 35 }]}>Finish your Profile</Text>
                <Text style={[gs.bodyText, { marginTop: 10, color: theme.base + "54" }]}>
                    Make your <Text style={{ fontWeight: "bold" }}>Profile</Text>{" "}
                    attractive
                </Text>
                <PhoneNumberInput sendData={handleTelefonData} />
                <Input placeholder="Full name" style={{ marginVertical: 16 }} />
                <Input placeholder="Job Title" style={{ marginVertical: 16 }} />

                {!dateSelect && (
                    <Button onPress={() => setDateSelect(true)}>
                        <BtnText>Select your birthday</BtnText>
                    </Button>
                )}
                {dateSelect && <DateInput />}

                <Button
                    onPress={() => router.push("/register/sendVerificationEmail")}
                    style={{ marginTop: "auto" }}
                >
                    <BtnText>Continue</BtnText>
                </Button>
            </BackWrapper>
        </>
    );
}
