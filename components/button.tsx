import { Pressable, StyleSheet, Text, useColorScheme } from "react-native";

interface ButtonProps {
    children: React.ReactNode;
    onPress: () => void;
}

export default function Button({ children, onPress }: ButtonProps) {
    let colorScheme = useColorScheme();

    if (colorScheme === "dark") {

    } else {

    }

    return (
        <Pressable onPress={onPress} style={styles.button}>
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