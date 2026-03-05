import React, { useState } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "@/app/theme/context";

export default function DateInput() {
    const { theme } = useTheme();
    const [date, setDate] = useState<Date | null>(null);
    const [open, setOpen] = useState(false);

    return (
        <View>
            <DateTimePicker
                value={date || new Date()}
                mode="date"
                maximumDate={new Date()}
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, selectedDate) => {
                    setOpen(false);
                    if (event.type === "set" && selectedDate) {
                        setDate(selectedDate);
                    }
                }}
            />
        </View>
    );
}
