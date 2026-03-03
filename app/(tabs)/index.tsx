import { Link } from "expo-router";
import { Text, View } from "react-native";
import { useTheme } from "../theme/context";

export default function Index() {
    const { gs } = useTheme();

    return (
        <View style={gs.container}>
            <Text style={gs.bodyText}>
                Edit app/(tabs)/index.tsx to edit this screen.
            </Text>
            {/* TODO: REMOVE THIS CODE BEFORE COMMIT */}
            <Link href="/auth/login">Go to Login</Link>
            <Link href="/auth/register/gender">Go to Gender</Link>
        </View>
    );
}
