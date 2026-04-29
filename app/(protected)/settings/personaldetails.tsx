// Created with Claude.ai and ChatGPT

import BackWrapper from "@/components/backwrapper";
import { useTheme } from "@/lib/theme/context";
import { BtnText, Button } from "@/components/button";
import Input from "@/components/input";
import { router, useFocusEffect } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import type { Theme } from "@/lib/theme/theme";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { datePickerCallback } from "@/utils/datePickerCallback";
import { useSafeAreaControl } from "@/components/SafeArea";
import { useAuthFetch } from "@/hooks/useAuthFetch";

const MAX_BIO_LENGTH = 150;
const MAX_GALLERY_IMAGES = 6;

const inputStyle = {
    height: 52,
    borderWidth: 0,
    borderRadius: 18,
    paddingHorizontal: 16,
    fontSize: 15,
    marginTop: 0,
} as const;

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

    const input = (
        <Input
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            autoComplete={autoComplete}
            editable={!onPress}
            onPress={onPress}
            style={[inputStyle, { backgroundColor: theme.card }]}
        />
    );

    return (
        <View style={styles.inputWrap}>
            <Text style={styles.label}>{label}</Text>
            {onPress ? <Pressable onPress={onPress}>{input}</Pressable> : input}
        </View>
    );
}

export default function PersonalDetails() {
    const { gs, theme } = useTheme();
    const styles = makeStyles(theme);

    const { setDisableSafeArea } = useSafeAreaControl();

    useFocusEffect(
        useCallback(() => {
            setDisableSafeArea(true);

            return () => {
                setDisableSafeArea(false);
            };
        }, [setDisableSafeArea]),
    );

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [country, setCountry] = useState("");
    const [birthday, setBirthday] = useState("");
    const [bio, setBio] = useState("");
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [galleryImages, setGalleryImages] = useState<string[]>([]);
    const [isEditingGallery, setIsEditingGallery] = useState(false);

    const bioCharactersLeft = MAX_BIO_LENGTH - bio.length;

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

        if (userData.aboutMe) setBio(userData.aboutMe);
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

    async function addGalleryImage() {
        if (galleryImages.length >= MAX_GALLERY_IMAGES) return;

        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setGalleryImages((currentImages) => [...currentImages, result.assets[0].uri]);
        }
    }

    function deleteGalleryImage(imageUri: string) {
        setGalleryImages((currentImages) =>
            currentImages.filter((image) => image !== imageUri),
        );
    }

    function handleSaveAndExit() {
        // TODO: Save updated data via API call
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
                                    params: { birthday },
                                });
                            }}
                        />
                        <Field
                            label="Country"
                            placeholder="Country"
                            value={country}
                            onChangeText={setCountry}
                        />

                        <View style={styles.bioWrap}>
                            <View style={styles.bioHeader}>
                                <Text style={styles.label}>Bio</Text>
                                <Text style={styles.counter}>{bioCharactersLeft}</Text>
                            </View>
                            <TextInput
                                style={styles.bioInput}
                                placeholder="Show people what you like - maybe your perfect video date, your vibe, or what makes you laugh."
                                placeholderTextColor={theme.text + "70"}
                                value={bio}
                                onChangeText={setBio}
                                maxLength={MAX_BIO_LENGTH}
                                multiline
                                textAlignVertical="top"
                            />
                        </View>

                        <View style={styles.galleryHeader}>
                            <Text style={styles.sectionTitle}>Gallery</Text>
                            <Pressable
                                onPress={() => setIsEditingGallery((value) => !value)}
                            >
                                <Text style={styles.editText}>
                                    {isEditingGallery ? "Done" : "Edit"}
                                </Text>
                            </Pressable>
                        </View>

                        <View style={styles.galleryGrid}>
                            {galleryImages.map((imageUri) => (
                                <View key={imageUri} style={styles.galleryItem}>
                                    <Image
                                        source={{ uri: imageUri }}
                                        style={styles.galleryImage}
                                    />
                                    {isEditingGallery && (
                                        <Pressable
                                            style={styles.deleteIcon}
                                            onPress={() => deleteGalleryImage(imageUri)}
                                        >
                                            <Ionicons
                                                name="trash"
                                                size={18}
                                                color="#fff"
                                            />
                                        </Pressable>
                                    )}
                                </View>
                            ))}

                            {!isEditingGallery &&
                                galleryImages.length < MAX_GALLERY_IMAGES && (
                                    <Pressable
                                        style={styles.addImageBox}
                                        onPress={addGalleryImage}
                                    >
                                        <Ionicons
                                            name="add"
                                            size={28}
                                            color={theme.primary}
                                        />
                                        <Text style={styles.addImageText}>Add</Text>
                                    </Pressable>
                                )}

                            {Array.from({
                                length:
                                    MAX_GALLERY_IMAGES -
                                    galleryImages.length -
                                    (!isEditingGallery &&
                                    galleryImages.length < MAX_GALLERY_IMAGES
                                        ? 1
                                        : 0),
                            }).map((_, index) => (
                                <View
                                    key={`empty-${index}`}
                                    style={styles.emptyImageBox}
                                />
                            ))}
                        </View>
                    </View>

                    <Button style={{ marginTop: 20 }} onPress={handleSaveAndExit}>
                        <BtnText>Save and Exit</BtnText>
                    </Button>
                </KeyboardAwareScrollView>
            </BackWrapper>
        </>
    );
}

const makeStyles = (theme: Theme) =>
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

        label: {
            marginTop: 11,
            fontSize: 14,
            fontWeight: "600",
            color: theme.primary,
        },

        // BIO
        bioWrap: { width: "100%", marginTop: 14 },
        bioHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
        },
        counter: {
            marginTop: 11,
            fontSize: 13,
            fontWeight: "600",
            color: theme.text + "90",
        },
        bioInput: {
            minHeight: 105,
            borderRadius: 18,
            paddingHorizontal: 16,
            paddingVertical: 14,
            marginTop: 8,
            fontSize: 15,
            color: theme.text,
            backgroundColor: theme.card,
        },

        // GALLERY
        galleryHeader: {
            marginTop: 18,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: "800",
            color: theme.text,
        },
        editText: {
            fontSize: 15,
            fontWeight: "700",
            color: theme.primary,
        },
        galleryGrid: {
            marginTop: 12,
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 10,
        },
        galleryItem: {
            width: "31%",
            aspectRatio: 1,
            borderRadius: 16,
            overflow: "hidden",
            backgroundColor: theme.card,
        },
        galleryImage: { width: "100%", height: "100%" },
        deleteIcon: {
            position: "absolute",
            top: 8,
            right: 8,
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: theme.black + "AA",
            alignItems: "center",
            justifyContent: "center",
        },
        addImageBox: {
            width: "31%",
            aspectRatio: 1,
            borderRadius: 16,
            borderWidth: 1.5,
            borderStyle: "dashed",
            borderColor: theme.primary,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.card,
        },
        addImageText: {
            marginTop: 4,
            fontSize: 13,
            fontWeight: "700",
            color: theme.primary,
        },
        emptyImageBox: {
            width: "31%",
            aspectRatio: 1,
            borderRadius: 16,
            backgroundColor: theme.cardAccent,
            opacity: 0.45,
        },
    });
