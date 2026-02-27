import { Pressable, StyleSheet, Text } from "react-native";

interface ButtonProps {
    children: React.ReactNode;
    disabled?: boolean;
    onPress: () => void;
}

export default function Button({ children, disabled, onPress }: ButtonProps) {
    return (
        <Pressable onPress={onPress} style={styles.button} disabled={disabled}>
            <Text style={styles.buttonText}>{children}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: "#EC136A",
        padding: 10,
        borderRadius: 5,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});