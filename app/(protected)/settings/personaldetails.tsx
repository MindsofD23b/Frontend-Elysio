// Made with the help of ChatGPT and Claude.ai

import BackWrapper from "@/components/backwrapper";
import { useTheme } from "@/lib/theme/context";
import { BtnText, Button, Loader } from "@/components/button";
import Input from "@/components/input";
import { router, Stack, useFocusEffect, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { datePickerCallback } from "@/utils/datePickerCallback";
import { useSafeAreaControl } from "@/components/SafeArea";
import { useAuthFetch } from "@/hooks/useAuthFetch";

type UserMe = {
    id: string;
    email: string | null;
    phoneNumber: string | null;
    emailVerified: boolean;
    gender: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    country: string;
    language: string;
    jobTitle: string | null;
    aboutMe: string | null;
    createdAt: string;
    photoUrl: string | null;
};

type Props =
    | {
          onChangeText: (text: string) => void;
          onPress?: never;
      }
    | {
          onChangeText?: never;
          onPress: () => void;
      };

type FieldProps = {
    label: string;
    placeholder: string;
    value: string;
    keyboardType?: "default" | "email-address" | "phone-pad";
    autoComplete?: "email" | "tel" | "off" | "username" | "current-password";
} & Props;

function Field({
    label,
    placeholder,
    value,
    onChangeText,
    onPress,
    keyboardType,
    autoComplete,
}: FieldProps) {
    const { theme } = useTheme();

    const styles = StyleSheet.create({
        inputWrap: { width: "100%", marginTop: 14 },
        label: {
            fontSize: 14,
            fontWeight: "600",
            marginBottom: 6,
            color: theme.primary,
        },
    });

    return (
        <View style={styles.inputWrap}>
            <Text style={styles.label}>{label}</Text>
            {onPress ? (
                <Pressable onPress={onPress}>
                    <Input
                        placeholder={placeholder}
                        value={value}
                        onChangeText={onChangeText}
                        keyboardType={keyboardType}
                        autoComplete={autoComplete}
                        readOnly={!!onPress}
                        onPress={onPress}
                        style={{ marginTop: 0 }}
                    />
                </Pressable>
            ) : (
                <Input
                    placeholder={placeholder}
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType={keyboardType}
                    autoComplete={autoComplete}
                    readOnly={!!onPress}
                    style={{ marginTop: 0 }}
                />
            )}
        </View>
    );
}

export default function PersonalDetails() {
    const { gs, theme } = useTheme();
    const styles = makeStyles();

    const { setDisabledEdges } = useSafeAreaControl();

    useFocusEffect(
        useCallback(() => {
            setDisabledEdges(["top"]);

            return () => {
                setDisabledEdges([]);
            };
        }, []),
    );

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [country, setCountry] = useState("");
    const [birthday, setBirthday] = useState("");
    const [profileImage, setProfileImage] = useState<string | null>(null);

    const [userData, userLoading] = useAuthFetch<UserMe>("/users/me", { method: "GET" });

    useEffect(() => {
        if (!userData) return;

        setFullName(`${userData.firstName} ${userData.lastName}`);
        setEmail(userData.email ?? "");
        setPhone(userData.phoneNumber ?? "");
        setCountry(userData.country ?? "");

        if (userData.dateOfBirth) {
            const d = new Date(userData.dateOfBirth);
            const day = String(d.getDate()).padStart(2, "0");
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const year = d.getFullYear();
            setBirthday(`${day}.${month}.${year}`);
        }

        if (userData.photoUrl) setProfileImage(userData.photoUrl);
    }, [userData]);

    datePickerCallback.set((newDate) => setBirthday(newDate));

    async function changePicture() {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) setProfileImage(result.assets[0].uri);
    }

    function handleSaveAndExit() {
        // Hier könntest du die aktualisierten Daten speichern, z.B. durch einen API-Aufruf

        router.back();
    }

    return (
        <>
            <BackWrapper m>
                <KeyboardAwareScrollView
                    contentContainerStyle={styles.page}
                    showsVerticalScrollIndicator={false}
                    enableOnAndroid={true}
                    extraScrollHeight={20}
                >
                    <Text style={[gs.h1, styles.title, { marginTop: 2 }]}>
                        Edit Profile
                    </Text>

                    <View style={styles.profileWrap}>
                        <View>
                            {profileImage ? (
                                <Image
                                    source={{ uri: profileImage }}
                                    style={styles.avatar}
                                />
                            ) : (
                                <View
                                    style={[
                                        styles.avatar,
                                        { backgroundColor: theme.text + "22" },
                                    ]}
                                />
                            )}
                            <Pressable
                                style={[
                                    styles.editIcon,
                                    { backgroundColor: theme.primary },
                                ]}
                                onPress={changePicture}
                            >
                                <Ionicons name="pencil" size={18} color="#fff" />
                            </Pressable>
                        </View>
                        <Text style={[styles.name, { color: theme.text }]}>
                            {userLoading ? "" : fullName}
                        </Text>
                        <Text style={[styles.emailTop, { color: theme.text + "80" }]}>
                            {userLoading ? "" : email}
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
                            onPress={() => {
                                router.push({
                                    pathname: "/datePickerModal",
                                    params: {
                                        birthday,
                                    },
                                });
                            }}
                            keyboardType="phone-pad"
                        />
                        <Field
                            label="Country"
                            placeholder="Country"
                            value={country}
                            onChangeText={setCountry}
                        />
                    </View>

                    <Button style={{ marginTop: 20 }} onPress={handleSaveAndExit}>
                        <BtnText>Save and Exit</BtnText>
                    </Button>
                </KeyboardAwareScrollView>
            </BackWrapper>
        </>
    );
}

const makeStyles = () =>
    StyleSheet.create({
        page: {
            width: "100%",
            paddingTop: 2,
            paddingBottom: 24,
        },

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
