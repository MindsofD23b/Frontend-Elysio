import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View, Text, StyleSheet, useColorScheme } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { BtnText, Button } from "@/components/button";
import { datePickerCallback } from "@/utils/datePickerCallback";

export default function DatePickerModal() {
    const { birthday } = useLocalSearchParams<{
        birthday: string;
    }>();
    const darkmode = useColorScheme() === "dark";

    const [date, setDate] = useState(
        birthday ? new Date(birthday.split(".").reverse().join("-")) : new Date(),
    );

    function handleSave() {
        const formatted = date.toLocaleDateString("de-CH");
        datePickerCallback.call(formatted);
        router.back();
    }

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: darkmode ? "#fff" : "#000" }]}>
                Date of Birth
            </Text>

            <DateTimePicker
                value={date}
                mode="date"
                display="spinner"
                onChange={(_, selected) => selected && setDate(selected)}
            />

            <Button onPress={handleSave} style={styles.button}>
                <BtnText>Save</BtnText>
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
    title: { fontSize: 22, fontWeight: "700", marginBottom: 20 },
    button: {
        marginTop: 20,
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 12,
    },
    buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
