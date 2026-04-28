import { View, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

interface Props {
    value: Date | null;
    onChange: (date: Date) => void;
}

export default function DateInput({ value, onChange }: Props) {
    return (
        <View>
            <DateTimePicker
                value={value || new Date()}
                mode="date"
                maximumDate={new Date()}
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, selectedDate) => {
                    if (event.type === "set" && selectedDate) {
                        onChange(selectedDate);
                    }
                }}
            />
        </View>
    );
}
