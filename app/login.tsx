import Button from "@/components/button";
import { Link } from "expo-router";
import { HomeIcon } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "./theme/context";
import { colors } from "./theme/theme";

export default function Login() {
    const { theme, gs } = useTheme();

    return (
        <View style={gs.container}>
            <HomeIcon size={48} color={theme.accent} />
            <Text style={gs.h1}>Elysio</Text>

            <Text style={gs.h2}>Login to continue</Text>
            <Button onPress={() => alert("Login button pressed")}>Continue with Email</Button>
            <Button onPress={() => alert("Login button pressed")}>Continue with Phone Number</Button>

            <Link href="/register"><Text style={gs.btnText}>Don&apos;t have an account? Register</Text></Link>

            <View>
                <View></View>
                <View><Text style={gs.bodyText}>or</Text></View>
                <View></View>
            </View>


        </View>
    );
}

export const makeStyles = (theme: typeof colors.light) =>
    StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: theme.background,
        },
        button: {
            backgroundColor: theme.primary,
            padding: 10,
            borderRadius: 5,
            alignItems: "center",
        },
        buttonText: {
            color: theme.text,
            fontSize: 16,
            fontWeight: "bold",
        },
        text: {
            color: theme.text,
        }
    });
