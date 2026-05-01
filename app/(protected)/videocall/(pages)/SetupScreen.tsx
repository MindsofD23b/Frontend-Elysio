import { useState, useMemo, useRef, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,
    Modal,
    TouchableWithoutFeedback,
} from "react-native";
import {
    Check,
    ArrowRight,
    Video,
    Mic,
    Sparkles,
    ChevronDown,
} from "lucide-react-native";
import { mediaDevices } from "react-native-webrtc";
import { createT } from "@/i18n";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme/context";
import { Theme } from "@/lib/theme/theme";
import BackWrapper from "@/components/backwrapper";
import { BtnText, Button } from "@/components/button";

type Option = { id: string; label: string; sub?: string };

function deviceLabel(d: MediaDeviceInfo, index: number, kind: "video" | "audio"): Option {
    const facing = (d as any).facing as string | undefined;
    const fallback =
        kind === "video"
            ? facing === "front"
                ? "Front camera"
                : facing === "environment"
                  ? "Back camera"
                  : `Camera ${index + 1}`
            : `Microphone ${index + 1}`;
    return {
        id: d.deviceId,
        label: d.label || fallback,
        sub:
            facing === "front"
                ? "Front-facing"
                : facing === "environment"
                  ? "Rear-facing"
                  : undefined,
    };
}

function useMediaDevices() {
    const [cameras, setCameras] = useState<Option[]>([]);
    const [microphones, setMicrophones] = useState<Option[]>([]);

    useEffect(() => {
        mediaDevices.enumerateDevices().then((devices) => {
            const all = devices as MediaDeviceInfo[];
            const cams = all
                .filter((d) => d.kind === "videoinput")
                .filter((d) => !/ultra|wide|0\.5/i.test(d.label))
                .map((d, i) => deviceLabel(d, i, "video"));
            const mics = all
                .filter((d) => d.kind === "audioinput")
                .map((d, i) => deviceLabel(d, i, "audio"));
            if (cams.length) setCameras(cams);
            if (mics.length) setMicrophones(mics);
        });
    }, []);

    return { cameras, microphones };
}

const t = createT("videocall.setup");

const INTERESTS = [
    "Music",
    "Travel",
    "Gaming",
    "Fitness",
    "Art",
    "Photography",
    "Movies",
    "Cooking",
    "Tech",
    "Books",
    "Hiking",
    "Fashion",
    "Sports",
    "Design",
    "Languages",
];

interface Props {
    onConnect: (camera: string, mic: string, interests: string[]) => void;
    onTestStreak?: () => void;
}

export function SetupScreen({ onConnect, onTestStreak }: Props) {
    const { cameras, microphones } = useMediaDevices();
    const [selectedCamera, setSelectedCamera] = useState("");
    const [selectedMic, setSelectedMic] = useState("");
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const { theme } = useTheme();
    const s = useMemo(() => makeStyles(theme), [theme]);

    // Default to first available device once loaded
    useEffect(() => {
        if (cameras.length && !selectedCamera) setSelectedCamera(cameras[0].id);
    }, [cameras]);
    useEffect(() => {
        if (microphones.length && !selectedMic) setSelectedMic(microphones[0].id);
    }, [microphones]);

    function toggleInterest(interest: string) {
        setSelectedInterests((prev) =>
            prev.includes(interest)
                ? prev.filter((i) => i !== interest)
                : [...prev, interest],
        );
    }

    return (
        <BackWrapper m>
            <ScrollView
                contentContainerStyle={s.scroll}
                showsVerticalScrollIndicator={false}
            >
                <View style={s.header}>
                    <Text style={s.title}>{t("title")}</Text>
                    <Text style={s.subtitle}>{t("subtitle")}</Text>
                </View>

                {/* Camera */}
                <Field
                    icon={<Video size={14} color="#9A9A9A" strokeWidth={1.75} />}
                    label="Camera"
                    theme={theme}
                >
                    <Dropdown
                        label="Camera"
                        value={selectedCamera}
                        options={cameras}
                        onChange={setSelectedCamera}
                        theme={theme}
                    />
                </Field>

                {/* Microphone */}
                <Field
                    icon={<Mic size={14} color="#9A9A9A" strokeWidth={1.75} />}
                    label="Microphone"
                    theme={theme}
                >
                    <Dropdown
                        label="Microphone"
                        value={selectedMic}
                        options={microphones}
                        onChange={setSelectedMic}
                        theme={theme}
                    />
                </Field>

                {/* Interests */}
                <Field
                    icon={<Sparkles size={14} color="#9A9A9A" strokeWidth={1.75} />}
                    label="Interests"
                    sub={
                        selectedInterests.length === 0
                            ? "match with people like you"
                            : `${selectedInterests.length} selected`
                    }
                    theme={theme}
                >
                    <View style={s.interestGrid}>
                        {INTERESTS.map((interest) => {
                            const active = selectedInterests.includes(interest);
                            return (
                                <Pressable
                                    key={interest}
                                    style={[s.interestTag, active && s.interestTagActive]}
                                    onPress={() => toggleInterest(interest)}
                                >
                                    {active && (
                                        <Check
                                            size={14}
                                            color="#fff"
                                            strokeWidth={2.4}
                                            style={{ marginRight: 4 }}
                                        />
                                    )}
                                    <Text
                                        style={[
                                            s.interestText,
                                            active && s.interestTextActive,
                                        ]}
                                    >
                                        {interest}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </Field>

                <Button
                    onPress={() =>
                        onConnect(selectedCamera, selectedMic, selectedInterests)
                    }
                >
                    <BtnText>{t("findMatch")}</BtnText>
                    <ArrowRight size={18} color="#fff" strokeWidth={2.2} />
                </Button>

                {onTestStreak && (
                    <Pressable
                        onPress={onTestStreak}
                        style={{
                            marginTop: 10,
                            alignItems: "center",
                            paddingVertical: 10,
                        }}
                    >
                        <Text style={{ color: theme.text + "55", fontSize: 12 }}>
                            {t("devTestStreak")}
                        </Text>
                    </Pressable>
                )}
            </ScrollView>
        </BackWrapper>
    );
}

/* ───────────────────── Field ───────────────────── */
function Field({
    icon,
    label,
    sub,
    children,
    theme,
}: {
    icon: React.ReactNode;
    label: string;
    sub?: string;
    children: React.ReactNode;
    theme: Theme;
}) {
    const s = makeStyles(theme);
    return (
        <View style={s.field}>
            <View style={s.fieldLabel}>
                {icon}
                <Text style={s.fieldLabelText}>{label}</Text>
                {sub && <Text style={s.fieldLabelSub}> · {sub}</Text>}
            </View>
            {children}
        </View>
    );
}

/* ───────────────────── Dropdown ───────────────────── */
function Dropdown({
    label,
    value,
    options,
    onChange,
    theme,
}: {
    label: string;
    value: string;
    options: Option[];
    onChange: (id: string) => void;
    theme: Theme;
}) {
    const [open, setOpen] = useState(false);
    const btnRef = useRef<View>(null);
    const [anchor, setAnchor] = useState({ x: 0, y: 0, w: 0 });
    const s = makeStyles(theme);
    const current = options.find((o) => o.id === value);

    const openMenu = () => {
        btnRef.current?.measureInWindow((x, y, w, h) =>
            setAnchor({ x, y: y + h + 6, w }),
        );
        setOpen(true);
    };

    return (
        <>
            <Pressable
                ref={btnRef as any}
                onPress={openMenu}
                style={[s.dropdown, open && s.dropdownOpen]}
            >
                <View style={{ flex: 1 }}>
                    <Text style={s.dropdownLabel} numberOfLines={1}>
                        {current?.label}
                    </Text>
                    {current?.sub && (
                        <Text style={s.dropdownSub} numberOfLines={1}>
                            {current.sub}
                        </Text>
                    )}
                </View>
                <ChevronDown
                    size={18}
                    color="#9A9A9A"
                    strokeWidth={1.75}
                    style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}
                />
            </Pressable>

            <Modal
                visible={open}
                transparent
                animationType="fade"
                onRequestClose={() => setOpen(false)}
            >
                <TouchableWithoutFeedback onPress={() => setOpen(false)}>
                    <View style={StyleSheet.absoluteFill}>
                        <View
                            style={[
                                s.menu,
                                { left: anchor.x, top: anchor.y, width: anchor.w },
                            ]}
                        >
                            {options.map((o) => {
                                const selected = o.id === value;
                                return (
                                    <Pressable
                                        key={o.id}
                                        onPress={() => {
                                            onChange(o.id);
                                            setOpen(false);
                                        }}
                                        style={({ pressed }) => [
                                            s.menuItem,
                                            pressed && s.menuItemPressed,
                                        ]}
                                    >
                                        <View style={{ flex: 1 }}>
                                            <Text style={s.menuLabel}>{o.label}</Text>
                                            {o.sub && (
                                                <Text style={s.menuSub}>{o.sub}</Text>
                                            )}
                                        </View>
                                        {selected && (
                                            <Check
                                                size={16}
                                                color={theme.primary}
                                                strokeWidth={2.2}
                                            />
                                        )}
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </>
    );
}

/* ───────────────────── Styles ───────────────────── */
const makeStyles = (theme: Theme) =>
    StyleSheet.create({
        scroll: { paddingBottom: 48 },
        header: { marginBottom: 32 },
        title: {
            color: theme.text,
            fontSize: 28,
            fontWeight: "700",
            letterSpacing: -0.6,
            lineHeight: 32,
        },
        subtitle: {
            color: "#9A9A9A",
            fontSize: 15,
            marginTop: 8,
            lineHeight: 21,
        },

        field: { marginBottom: 22 },
        fieldLabel: {
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginBottom: 10,
        },
        fieldLabelText: {
            color: "#9A9A9A",
            fontSize: 12,
            fontWeight: "600",
            letterSpacing: 0.6,
            textTransform: "uppercase",
        },
        fieldLabelSub: {
            color: "#6E6E6E",
            fontSize: 12,
            fontWeight: "400",
        },

        dropdown: {
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            paddingVertical: 14,
            paddingHorizontal: 14,
            backgroundColor: theme.cardBgDeep,
            borderWidth: 1,
            zIndex: 1,
            borderColor: theme.primary,
            borderRadius: 12,
        },
        dropdownOpen: { borderColor: "#3A3A3A" },
        dropdownLabel: { color: theme.text, fontSize: 15, fontWeight: "500" },
        dropdownSub: { color: "#6E6E6E", fontSize: 12, marginTop: 2 },

        menu: {
            position: "absolute",
            backgroundColor: theme.cardBg,
            borderWidth: 1,
            borderColor: "#3A3A3A",
            borderRadius: 12,
            padding: 6,
            shadowColor: "#000",
            shadowOpacity: 0.5,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 14 },
            elevation: 8,
        },
        menuItem: {
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            paddingVertical: 10,
            paddingHorizontal: 10,
            borderRadius: 8,
        },
        menuItemPressed: { backgroundColor: theme.primary + "1A" },
        menuLabel: { color: theme.text, fontSize: 14, fontWeight: "500" },
        menuSub: { color: "#6E6E6E", fontSize: 12, marginTop: 2 },

        interestGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
        interestTag: {
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 14,
            paddingVertical: 9,
            borderRadius: 999,
            backgroundColor: "transparent",
            borderWidth: 1,
            borderColor: theme.primary,
        },
        interestTagActive: {
            backgroundColor: theme.primary,
            borderColor: theme.primary,
        },
        interestText: { color: theme.text, fontSize: 14, fontWeight: "500" },
        interestTextActive: { color: "#FFFFFF" },
    });
