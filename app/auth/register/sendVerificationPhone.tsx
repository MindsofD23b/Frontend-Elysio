import BackWrapper from "@/components/backwrapper";
import { Text } from "react-native";
import { useTheme } from "@/app/theme/context";
import { useSearchParams } from "expo-router/build/hooks";

export default function SendVerificationPhone() {
    const { gs, theme } = useTheme();

    const searchParams = useSearchParams();


    const number = searchParams.get("tel") || "+41 79 123 45 67";

    return (
        <>
            <BackWrapper>
                <Text style={[gs.h1, { marginTop: 35 }]}>SendVerificationPhone</Text>
                <Text style={[gs.bodyText, { marginTop: 30, color: theme.base + "54", textAlign: "left" }]}>
                    We have sent a code to your
                    <Text style={{ fontWeight: "bold" }}> Phone Number:
                        {"\n"}
                        <Text style={{ color: theme.primary }}>{number}</Text>
                    </Text>
                </Text>
            </BackWrapper>
        </>
    );
}