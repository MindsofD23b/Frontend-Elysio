import Button from "@/components/button";
import { Link } from "expo-router";
import { HomeIcon } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

export default function Login() {
    return (
        <View style={styles.container}>
            <HomeIcon size={48} color="#EC136A" />
            <Text>Elysio</Text>

            <Text>Login to continue</Text>
            <Button onPress={() => alert("Login button pressed")}>Continue with Email</Button>
            <Button onPress={() => alert("Login button pressed")}>Continue with Phone Number</Button>

            <Link href="/register">Don`t have an account? Register</Link>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});