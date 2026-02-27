import { useTheme } from "@/app/theme/context";
import Button from "@/components/button";
import { Link } from "expo-router";
import { HomeIcon } from "lucide-react-native";
import { Text, View } from "react-native";

export default function Login() {
    const { gs, theme } = useTheme();

    return (
        <View style={gs.container}>
            <HomeIcon size={48} color={theme.primary} />
            <Text>Elysio</Text>

            <Text>Login to continue</Text>
            <Button onPress={() => alert("Login button pressed")}>Continue with Email</Button>
            <Button onPress={() => alert("Login button pressed")}>Continue with Phone Number</Button>

            <Link href="/register">Don`t have an account? Register</Link>
        </View>
    );
}