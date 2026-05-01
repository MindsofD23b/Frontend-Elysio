// Created with Claude.ai and ChatGPT

import { createT } from "@/i18n";
import BackWrapper from "@/components/backwrapper";
import { useTheme } from "@/lib/theme/context";
import { BtnText, Button, Loader } from "@/components/button";
import LabeledInput from "@/components/LabeledInput";
import { router, useFocusEffect } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import type { Theme } from "@/lib/theme/theme";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    Pressable,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { datePickerCallback } from "@/utils/datePickerCallback";
import { useSafeAreaControl } from "@/components/SafeArea";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { useAuth } from "@/lib/auth/AuthProvider";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
} from "react-native-reanimated";

const t = createT("settings.personalDetails");
const MAX_BIO_LENGTH = 150;
const MAX_GALLERY_IMAGES = 6;
const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "https://elysio.jamiepoeffel.ch";

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

type GalleryPhoto = { id: string; url: string };

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonBox({
    width,
    height,
    borderRadius = 12,
    style,
}: {
    width: number | `${number}%`;
    height: number;
    borderRadius?: number;
    style?: object;
}) {
    const { theme } = useTheme();
    const opacity = useSharedValue(1);

    useEffect(() => {
        opacity.value = withRepeat(
            withTiming(0.35, { duration: 800, easing: Easing.inOut(Easing.ease) }),
            -1,
            true,
        );
    }, []);

    const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

    return (
        <Animated.View
            style={[
                { width, height, borderRadius, backgroundColor: theme.cardAccent },
                animStyle,
                style,
            ]}
        />
    );
}

function SkeletonField() {
    return (
        <View style={{ width: "100%", marginTop: 14 }}>
            <SkeletonBox width="40%" height={14} borderRadius={7} />
            <SkeletonBox
                width="100%"
                height={52}
                borderRadius={18}
                style={{ marginTop: 6 }}
            />
        </View>
    );
}

function PersonalDetailsSkeleton() {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    return (
        <View style={styles.page}>
            <View style={styles.profileWrap}>
                <SkeletonBox width={130} height={130} borderRadius={24} />
                <SkeletonBox
                    width={160}
                    height={22}
                    borderRadius={11}
                    style={{ marginTop: 12 }}
                />
                <SkeletonBox
                    width={120}
                    height={14}
                    borderRadius={7}
                    style={{ marginTop: 8 }}
                />
            </View>

            <View style={[styles.form, { marginTop: 10 }]}>
                <SkeletonField />
                <SkeletonField />
                <SkeletonField />
                <SkeletonField />
                <SkeletonField />
                <SkeletonField />

                <View style={{ width: "100%", marginTop: 14 }}>
                    <SkeletonBox width="20%" height={14} borderRadius={7} />
                    <SkeletonBox
                        width="100%"
                        height={105}
                        borderRadius={18}
                        style={{ marginTop: 6 }}
                    />
                </View>

                <View style={[styles.galleryHeader, { marginTop: 18 }]}>
                    <SkeletonBox width={80} height={20} borderRadius={10} />
                    <SkeletonBox width={40} height={16} borderRadius={8} />
                </View>

                <View style={styles.galleryGrid}>
                    {Array.from({ length: MAX_GALLERY_IMAGES }).map((_, i) => (
                        <SkeletonBox
                            key={i}
                            width="31%"
                            height={110}
                            borderRadius={16}
                            style={{ aspectRatio: 1 }}
                        />
                    ))}
                </View>
            </View>

            <SkeletonBox
                width="100%"
                height={52}
                borderRadius={18}
                style={{ marginTop: 20 }}
            />
        </View>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PersonalDetails() {
    const { gs, theme } = useTheme();
    const styles = makeStyles(theme);
    const { token } = useAuth();

    const { setDisableSafeArea } = useSafeAreaControl();
    useFocusEffect(
        useCallback(() => {
            setDisableSafeArea(true);
            return () => setDisableSafeArea(false);
        }, [setDisableSafeArea]),
    );

    // ── Profile fields ──
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [country, setCountry] = useState("");
    const [birthday, setBirthday] = useState("");
    const [jobTitle, setJobTitle] = useState("");
    const [bio, setBio] = useState("");
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const originalPhotoUrl = useRef<string | null>(null);
    const bioCharactersLeft = MAX_BIO_LENGTH - bio.length;

    // ── Gallery ──
    const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);
    const [galleryLoading, setGalleryLoading] = useState(false);
    const [uploadingGallery, setUploadingGallery] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isEditingGallery, setIsEditingGallery] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

    const [userData, userLoading, , refetchMe] = useAuthFetch<UserMe>("/users/me", {
        method: "GET",
    });

    // ── Load profile fields ──
    useEffect(() => {
        if (!userData) return;

        setFullName(`${userData.firstName} ${userData.lastName}`);
        setEmail(userData.email ?? "");
        setPhone(userData.phoneNumber ?? "");
        setCountry(userData.country ?? "");
        setJobTitle(userData.jobTitle ?? "");
        if (userData.aboutMe) setBio(userData.aboutMe);

        if (userData.dateOfBirth) {
            const d = new Date(userData.dateOfBirth);
            const day = String(d.getDate()).padStart(2, "0");
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const year = d.getFullYear();
            setBirthday(`${day}.${month}.${year}`);
        }

        if (userData.photoUrl) {
            setProfileImage(userData.photoUrl);
            originalPhotoUrl.current = userData.photoUrl;
        }

        loadGalleryPhotos();
    }, [userData]);

    datePickerCallback.set((newDate) => setBirthday(newDate));

    // ── Gallery: load ──
    async function loadGalleryPhotos() {
        setGalleryLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/users/me/photos`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) return;
            const photos: GalleryPhoto[] = await res.json();
            setGalleryPhotos(photos);
        } catch {
            // non-critical — gallery simply stays empty
        } finally {
            setGalleryLoading(false);
        }
    }

    // ── Gallery: add ──
    async function addGalleryImage() {
        if (
            galleryPhotos.length >= MAX_GALLERY_IMAGES ||
            uploadingGallery ||
            !userData?.id
        )
            return;

        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (result.canceled) return;

        const uri = result.assets[0].uri;
        const ext = uri.split(".").pop()?.split("?")[0] ?? "jpg";
        const mimeType = ext === "png" ? "image/png" : "image/jpeg";

        setUploadingGallery(true);
        try {
            const formData = new FormData();
            formData.append("file", {
                uri,
                name: `gallery.${ext}`,
                type: mimeType,
            } as any);

            const uploadRes = await fetch(`${BASE_URL}/users/${userData.id}/photos`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            if (!uploadRes.ok) {
                const body = await uploadRes.json().catch(() => ({}));
                throw new Error(body?.message || "Failed to upload photo");
            }

            const { id } = await uploadRes.json();

            // Fetch the signed URL for the newly uploaded photo
            const urlRes = await fetch(
                `${BASE_URL}/users/${userData.id}/photos/${id}/url`,
                { headers: { Authorization: `Bearer ${token}` } },
            );
            if (!urlRes.ok) throw new Error("Could not get photo URL");
            const { url } = await urlRes.json();

            setGalleryPhotos((prev) => [...prev, { id, url }]);
        } catch (err) {
            Alert.alert(
                "Error",
                err instanceof Error ? err.message : "Failed to upload photo",
            );
        } finally {
            setUploadingGallery(false);
        }
    }

    // ── Gallery: delete ──
    async function deleteGalleryImage(photoId: string) {
        if (!userData?.id || deletingId) return;

        Alert.alert("Remove photo", "Remove this photo from your gallery?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Remove",
                style: "destructive",
                onPress: async () => {
                    setDeletingId(photoId);
                    try {
                        const res = await fetch(
                            `${BASE_URL}/users/${userData.id}/photos/${photoId}`,
                            {
                                method: "DELETE",
                                headers: { Authorization: `Bearer ${token}` },
                            },
                        );
                        if (!res.ok) {
                            const body = await res.json().catch(() => ({}));
                            throw new Error(body?.message || "Failed to delete photo");
                        }
                        setGalleryPhotos((prev) => prev.filter((p) => p.id !== photoId));
                    } catch (err) {
                        Alert.alert(
                            "Error",
                            err instanceof Error ? err.message : "Failed to delete photo",
                        );
                    } finally {
                        setDeletingId(null);
                    }
                },
            },
        ]);
    }

    // ── Profile picture ──
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

    // ── Save & exit ──
    const splitName = (name: string) => {
        const trimmed = name.trim();
        const lastSpace = trimmed.lastIndexOf(" ");
        if (lastSpace === -1) return { firstName: trimmed, lastName: "" };
        return {
            firstName: trimmed.slice(0, lastSpace).trim(),
            lastName: trimmed.slice(lastSpace + 1).trim(),
        };
    };

    const parseBirthdayToISO = (dd_mm_yyyy: string): string | undefined => {
        const parts = dd_mm_yyyy.split(".");
        if (parts.length !== 3) return undefined;
        const [day, month, year] = parts;
        if (!day || !month || !year) return undefined;
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    };

    async function handleSaveAndExit() {
        setSaving(true);
        try {
            const { firstName, lastName } = splitName(fullName);
            const dateOfBirth = parseBirthdayToISO(birthday);

            const patch: Record<string, unknown> = {
                firstName,
                lastName,
                country,
                jobTitle,
                aboutMe: bio,
            };
            if (dateOfBirth) patch.dateOfBirth = dateOfBirth;

            const patchRes = await fetch(`${BASE_URL}/users/me`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(patch),
            });
            if (!patchRes.ok) {
                const body = await patchRes.json().catch(() => ({}));
                throw new Error(body?.message || "Failed to update profile");
            }

            const imageChanged =
                profileImage && profileImage !== originalPhotoUrl.current;
            if (imageChanged) {
                const uri = profileImage!;
                const ext = uri.split(".").pop()?.split("?")[0] ?? "jpg";
                const mimeType = ext === "png" ? "image/png" : "image/jpeg";

                const formData = new FormData();
                formData.append("file", {
                    uri,
                    name: `photo.${ext}`,
                    type: mimeType,
                } as any);

                const photoRes = await fetch(`${BASE_URL}/users/me/photo`, {
                    method: "PUT",
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                });
                if (!photoRes.ok) {
                    const body = await photoRes.json().catch(() => ({}));
                    throw new Error(body?.message || "Failed to upload photo");
                }

                originalPhotoUrl.current = profileImage;
            }

            await refetchMe();
            router.back();
        } catch (err) {
            Alert.alert(
                "Error",
                err instanceof Error
                    ? err.message
                    : "Failed to save changes. Please try again.",
            );
            console.error("Save error:", err);
        } finally {
            setSaving(false);
        }
    }

    // ─── Render ───────────────────────────────────────────────────────────────

    const showAddButton =
        !isEditingGallery && galleryPhotos.length < MAX_GALLERY_IMAGES && !galleryLoading;

    const emptySlots =
        MAX_GALLERY_IMAGES -
        galleryPhotos.length -
        (showAddButton ? 1 : 0) -
        (uploadingGallery ? 1 : 0);

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
                        {t("title")}
                    </Text>

                    {userLoading ? (
                        <PersonalDetailsSkeleton />
                    ) : (
                        <>
                            {/* ── Avatar ── */}
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
                                    {fullName}
                                </Text>
                                <Text
                                    style={[
                                        styles.emailTop,
                                        { color: theme.text + "80" },
                                    ]}
                                >
                                    {email}
                                </Text>
                            </View>

                            {/* ── Form fields ── */}
                            <View style={styles.form}>
                                <LabeledInput
                                    label={t("fullName")}
                                    placeholder={t("fullNamePlaceholder")}
                                    value={fullName}
                                    onChangeText={setFullName}
                                />
                                <LabeledInput
                                    label={t("emailAddress")}
                                    placeholder={t("emailPlaceholder")}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoComplete="email"
                                />
                                <LabeledInput
                                    label={t("phoneNumber")}
                                    placeholder={t("phonePlaceholder")}
                                    value={phone}
                                    onChangeText={setPhone}
                                    keyboardType="phone-pad"
                                    autoComplete="tel"
                                />
                                <LabeledInput
                                    label="Job title"
                                    placeholder="Software Engineer"
                                    value={jobTitle}
                                    onChangeText={setJobTitle}
                                />
                                <Pressable
                                    onPress={() =>
                                        router.push({
                                            pathname: "/datePickerModal",
                                            params: { birthday },
                                        })
                                    }
                                >
                                    <LabeledInput
                                        label={t("dateOfBirth")}
                                        placeholder="dd.mm.yyyy"
                                        value={birthday}
                                        editable={false}
                                    />
                                </Pressable>
                                <LabeledInput
                                    label={t("country")}
                                    placeholder={t("country")}
                                    value={country}
                                    onChangeText={setCountry}
                                />

                                {/* ── Bio ── */}
                                <View style={styles.bioWrap}>
                                    <View style={styles.bioHeader}>
                                        <Text style={styles.label}>{t("bio")}</Text>
                                        <Text style={styles.counter}>
                                            {bioCharactersLeft}
                                        </Text>
                                    </View>
                                    <TextInput
                                        style={[
                                            styles.bioInput,
                                            {
                                                color: theme.text,
                                                backgroundColor: theme.card,
                                            },
                                        ]}
                                        placeholder={t("bioPlaceholder")}
                                        placeholderTextColor={theme.text + "70"}
                                        value={bio}
                                        onChangeText={setBio}
                                        maxLength={MAX_BIO_LENGTH}
                                        multiline
                                        textAlignVertical="top"
                                    />
                                </View>

                                {/* ── Gallery ── */}
                                <View style={styles.galleryHeader}>
                                    <View
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            gap: 8,
                                        }}
                                    >
                                        <Text style={styles.sectionTitle}>
                                            {t("gallery")}
                                        </Text>
                                        <Text style={styles.galleryCount}>
                                            {galleryPhotos.length}/{MAX_GALLERY_IMAGES}
                                        </Text>
                                    </View>
                                    {galleryPhotos.length > 0 && !galleryLoading && (
                                        <Pressable
                                            onPress={() => setIsEditingGallery((v) => !v)}
                                        >
                                            <Text style={styles.editText}>
                                                {isEditingGallery ? t("done") : t("edit")}
                                            </Text>
                                        </Pressable>
                                    )}
                                </View>

                                <View style={styles.galleryGrid}>
                                    {/* Existing photos */}
                                    {galleryPhotos.map((photo) => (
                                        <Pressable
                                            key={photo.id}
                                            style={styles.galleryItem}
                                            onPress={() =>
                                                !isEditingGallery &&
                                                setSelectedPhoto(photo.url)
                                            }
                                        >
                                            <Image
                                                source={{ uri: photo.url }}
                                                style={styles.galleryImage}
                                            />
                                            {/* Delete overlay */}
                                            {isEditingGallery && (
                                                <Pressable
                                                    style={styles.deleteIcon}
                                                    onPress={() =>
                                                        deleteGalleryImage(photo.id)
                                                    }
                                                    disabled={!!deletingId}
                                                >
                                                    {deletingId === photo.id ? (
                                                        <ActivityIndicator
                                                            size="small"
                                                            color="#fff"
                                                        />
                                                    ) : (
                                                        <Ionicons
                                                            name="trash"
                                                            size={18}
                                                            color="#fff"
                                                        />
                                                    )}
                                                </Pressable>
                                            )}
                                        </Pressable>
                                    ))}

                                    {/* Upload-in-progress tile */}
                                    {uploadingGallery && (
                                        <View
                                            style={[
                                                styles.galleryItem,
                                                {
                                                    backgroundColor: theme.card,
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                },
                                            ]}
                                        >
                                            <ActivityIndicator color={theme.primary} />
                                        </View>
                                    )}

                                    {/* Add button */}
                                    {showAddButton && (
                                        <Pressable
                                            style={styles.addImageBox}
                                            onPress={addGalleryImage}
                                            disabled={uploadingGallery}
                                        >
                                            <Ionicons
                                                name="add"
                                                size={28}
                                                color={theme.primary}
                                            />
                                            <Text style={styles.addImageText}>
                                                {t("add")}
                                            </Text>
                                        </Pressable>
                                    )}

                                    {/* Gallery loading skeletons */}
                                    {galleryLoading &&
                                        Array.from({ length: MAX_GALLERY_IMAGES }).map(
                                            (_, i) => (
                                                <SkeletonBox
                                                    key={`skel-${i}`}
                                                    width="31%"
                                                    height={110}
                                                    borderRadius={16}
                                                    style={{ aspectRatio: 1 }}
                                                />
                                            ),
                                        )}

                                    {/* Empty filler slots */}
                                    {!galleryLoading &&
                                        Array.from({
                                            length: Math.max(0, emptySlots),
                                        }).map((_, i) => (
                                            <View
                                                key={`empty-${i}`}
                                                style={styles.emptyImageBox}
                                            />
                                        ))}
                                </View>
                            </View>

                            <Button
                                style={{ marginTop: 20 }}
                                onPress={handleSaveAndExit}
                                disabled={saving || uploadingGallery || !!deletingId}
                            >
                                {saving ? (
                                    <Loader />
                                ) : (
                                    <BtnText>{t("saveAndExit")}</BtnText>
                                )}
                            </Button>
                        </>
                    )}
                </KeyboardAwareScrollView>
            </BackWrapper>

            {/* ── Full-screen photo viewer ── */}
            <Modal
                visible={selectedPhoto !== null}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={() => setSelectedPhoto(null)}
            >
                <StatusBar backgroundColor="#000" barStyle="light-content" />
                <Pressable
                    style={styles.lightboxBackdrop}
                    onPress={() => setSelectedPhoto(null)}
                >
                    {/* Prevent tap on the image itself from closing */}
                    <Pressable onPress={(e) => e.stopPropagation()}>
                        <Image
                            source={{ uri: selectedPhoto ?? "" }}
                            style={styles.lightboxImage}
                            resizeMode="contain"
                        />
                    </Pressable>
                </Pressable>

                <Pressable
                    style={styles.lightboxClose}
                    onPress={() => setSelectedPhoto(null)}
                    hitSlop={16}
                >
                    <Ionicons name="close" size={26} color="#fff" />
                </Pressable>
            </Modal>
        </>
    );
}

const makeStyles = (theme: Theme) =>
    StyleSheet.create({
        page: { width: "100%", paddingTop: 2, paddingBottom: 24 },
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
        },

        // GALLERY
        galleryHeader: {
            marginTop: 18,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
        },
        sectionTitle: { fontSize: 18, fontWeight: "800", color: theme.text },
        galleryCount: {
            fontSize: 13,
            fontWeight: "600",
            color: theme.text + "60",
            marginTop: 2,
        },
        editText: { fontSize: 15, fontWeight: "700", color: theme.primary },
        galleryGrid: { marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 10 },
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

        // LIGHTBOX
        lightboxBackdrop: {
            flex: 1,
            backgroundColor: "#000000E6",
            alignItems: "center",
            justifyContent: "center",
        },
        lightboxImage: {
            width: 360,
            height: 360,
            borderRadius: 12,
        },
        lightboxClose: {
            position: "absolute",
            top: 52,
            right: 20,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "#00000066",
            alignItems: "center",
            justifyContent: "center",
        },
    });
