import { Text, View } from "react-native";
import { useTheme } from "../../theme/context";

export default function Index() {
    const { gs } = useTheme();
    return (
        <View style={gs.container}>
            <Text style={gs.bodyText}>
                Edit app/(tabs)/stats.tsx to edit this screen.
            </Text>
        </View>
    );
}
