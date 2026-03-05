import { Text, View } from "react-native";
import { useTheme } from "@/app/theme/context";

export default function Index() {
    const { gs } = useTheme();

    return (
        <View style={gs.container}>
            <Text style={gs.bodyText}>Edit app/(tabs)/chat.tsx to edit this screen.</Text>
        </View>
    );
}
