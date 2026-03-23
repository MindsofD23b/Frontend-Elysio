import { Text, View } from "react-native";
import { useTheme } from "@/lib/theme/context";

export default function Index() {
    const { gs } = useTheme();

    return (
        <View style={gs.container}>
            <Text style={gs.bodyText}>
                Edit app/(tabs)/favorites.tsx to edit this screen.
            </Text>
        </View>
    );
}
