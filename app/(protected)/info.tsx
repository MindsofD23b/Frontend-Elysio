import {
    AlertBanner,
    DetailCard,
    ACCENT,
    RecheckPill,
    SectionHeader,
    SheetHeader,
    StatusCard,
    type DetailItem,
    type StatusItem,
} from "@/components/ServerStatusSheet";
import {
    BarChart3,
    BookMarked,
    CloudOff,
    Eye,
    Pencil,
    RefreshCw,
    Shield,
    X,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useTheme } from "@/lib/theme/context";

const RECHECK_SECONDS = 20;

const DETAILS: DetailItem[] = [
    {
        icon: <Shield size={18} color="#22c55e" fill="#22c55e" />,
        title: "Your data is safe",
        description: "All your messages are stored locally on this device.",
    },
    {
        icon: <RefreshCw size={18} color="#3b82f6" />,
        title: "Automatic sync",
        description: "Any changes you make will sync automatically when servers return.",
    },
];

const WORKS: StatusItem[] = [
    {
        icon: <Pencil size={16} color="#22c55e" />,
        label: "Viewing messages",
        works: true,
    },
    { icon: <Eye size={16} color="#22c55e" />, label: "Reading old chats", works: true },
    {
        icon: <BarChart3 size={16} color="#22c55e" />,
        label: "Tracking activity",
        works: true,
    },
    {
        icon: <BookMarked size={16} color="#22c55e" />,
        label: "Saved content",
        works: true,
    },
];

const LIMITED: StatusItem[] = [
    {
        icon: <CloudOff size={16} color={ACCENT} />,
        label: "Cross-device sync",
        works: false,
    },
    {
        icon: <RefreshCw size={16} color={ACCENT} />,
        label: "Sending messages",
        works: false,
    },
];

export default function InfoScreen() {
    const [seconds, setSeconds] = useState(RECHECK_SECONDS);
    const { theme } = useTheme();

    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds((s) => (s <= 1 ? RECHECK_SECONDS : s - 1));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <ScrollView
            style={[styles.scroll, { backgroundColor: theme.gray }]}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            <SheetHeader
                icon={<CloudOff size={20} color={ACCENT} />}
                title="Server Status"
                right={
                    <Pressable onPress={() => router.back()} style={styles.closeButton}>
                        <X size={20} color="#1a1a1a" />
                    </Pressable>
                }
            />

            <RecheckPill seconds={seconds} />

            <AlertBanner
                title="App is experiencing issues"
                subtitle="Unable to connect to our servers"
            />

            <SectionHeader title="Details" />
            <DetailCard items={DETAILS} />

            <SectionHeader title="What still works" />
            <StatusCard items={WORKS} />

            <SectionHeader title="Temporarily limited" />
            <StatusCard items={LIMITED} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scroll: {
        flex: 1,
    },
    content: {
        padding: 16,
        paddingBottom: 48,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 999,
        backgroundColor: "rgba(0,0,0,0.08)",
        alignItems: "center",
        justifyContent: "center",
    },
});
