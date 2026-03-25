import { useState } from "react";
import { View, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function DateInput() {
    const [date, setDate] = useState<Date | null>(null);
    const [_open, setOpen] = useState(false);

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
