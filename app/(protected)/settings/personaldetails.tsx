// Made with the help of ChatGPT.

import BackWrapper from "@/components/backwrapper";
import { useTheme } from "@/lib/theme/context";
import { BtnText, Button } from "@/components/button";
import Input from "@/components/input";
import { router, Stack } from "expo-router";
// import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

type FieldProps = {
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    keyboardType?: "default" | "email-address" | "phone-pad";
    autoComplete?: "email" | "tel" | "off" | "username" | "current-password";
};

function Field({
    label,
    placeholder,
    value,
    onChangeText,
    keyboardType,
    autoComplete,
}: FieldProps) {
    const { theme } = useTheme();

    const styles = StyleSheet.create({
        inputWrap: { width: "100%" },
        label: {
            marginTop: 11,
            fontSize: 14,
            fontWeight: "600",
            marginBottom: -7,
            lineHeight: 12,
            color: theme.primary,
        },
    });

    return (
        <View style={styles.inputWrap}>
            <Text style={styles.label}>{label}</Text>
            <Input
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
                autoComplete={autoComplete}
            />
        </View>
    );
}

export default function PersonalDetails() {
    const { gs, theme } = useTheme();
    const styles = makeStyles();

    const [fullName, setFullName] = useState("Lara Gut");
    const [email, setEmail] = useState("lara.gut@example.com");
    const [phone, setPhone] = useState("+41 79 123 45 67");
    const [country, setCountry] = useState("Switzerland");
    const [birthday, setBirthday] = useState("14.02.2002");
    const [profileImage] = useState(
        "https://images.unsplash.com/photo-1517849845537-4d257902454a",
    );

    function handleBirthdayChange(text: string) {
        const numbersOnly = text.replace(/\D/g, "").slice(0, 8);

        if (numbersOnly.length <= 2) {
            setBirthday(numbersOnly);
            return;
        }
        if (numbersOnly.length <= 4) {
            setBirthday(`${numbersOnly.slice(0, 2)}.${numbersOnly.slice(2)}`);
            return;
        }

        setBirthday(
            `${numbersOnly.slice(0, 2)}.${numbersOnly.slice(2, 4)}.${numbersOnly.slice(4, 8)}`,
        );
    }

    // async function changePicture() {
    //     const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    //     if (!permission.granted) return;

    //     const result = await ImagePicker.launchImageLibraryAsync({
    //         mediaTypes: ["images"],
    //         allowsEditing: true,
    //         aspect: [1, 1],
    //         quality: 1,
    //     });

    //     if (!result.canceled) setProfileImage(result.assets[0].uri);
    // }

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />

            <BackWrapper>
                <Text style={[gs.h1, styles.title]}>Edit Profile</Text>

                <View style={styles.profileWrap}>
                    <View>
                        <Image source={{ uri: profileImage }} style={styles.avatar} />
                        <Pressable
                            style={[styles.editIcon, { backgroundColor: theme.primary }]}
                        >
                            <Ionicons name="pencil" size={18} color="#fff" />
                        </Pressable>
                    </View>
                    <Text style={[styles.name, { color: theme.text }]}>{fullName}</Text>
                    <Text style={[styles.emailTop, { color: theme.text + "80" }]}>
                        {email}
                    </Text>
                </View>

                <View style={styles.form}>
                    <Field
                        label="Full Name"
                        placeholder="Your Full Name"
                        value={fullName}
                        onChangeText={setFullName}
                    />
                    <Field
                        label="Email Address"
                        placeholder="Your Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoComplete="email"
                    />
                    <Field
                        label="Phone Number"
                        placeholder="Your Phone Number"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                        autoComplete="tel"
                    />
                    <Field
                        label="Date of Birth"
                        placeholder="dd.mm.yyyy"
                        value={birthday}
                        onChangeText={handleBirthdayChange}
                        keyboardType="phone-pad"
                    />
                    <Field
                        label="Country"
                        placeholder="Country"
                        value={country}
                        onChangeText={setCountry}
                    />
                </View>

                <Button style={{ marginTop: "auto" }} onPress={() => router.back()}>
                    <BtnText>Save and Exit</BtnText>
                </Button>
            </BackWrapper>
        </>
    );
}

const makeStyles = () =>
    StyleSheet.create({
        title: { marginTop: -25, textAlign: "center" },
        profileWrap: { alignItems: "center", marginTop: 20 },
        avatar: { width: 130, height: 130, borderRadius: 24 },
        editIcon: {
            position: "absolute",
            right: 8,
            bottom: 8,
            width: 38,
            height: 38,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
        },
        name: { fontSize: 24, fontWeight: "800", marginTop: 8 },
        emailTop: { fontSize: 14, marginTop: 2 },
        form: { flex: 1, marginTop: 10, gap: 4 },
    });
