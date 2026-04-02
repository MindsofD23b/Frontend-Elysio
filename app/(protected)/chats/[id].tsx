import { useFetch } from "@/hooks/useFetch";
import { useStore } from "@/hooks/useStore";
import { useTheme } from "@/lib/theme/context";
import { Chat } from "@/types/chats";
import { decryptMessage, encryptMessage } from "@/services/chat-crypto.client";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowUp, ChevronLeft } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Message {
    id: string;
    senderId: string;
    text: string;
    createdAt: string;
}

interface RoomMessagesResponse {
    messages: {
        id: string;
        roomId: string;
        senderId: string;
        type: string;
        ciphertext: string;
        iv: string;
        authTag: string;
        mediaUrl: string | null;
        mediaDurationSec: number | null;
        isDeleted: boolean;
        createdAt: string;
        encryptedKey: string | null;
    }[];
    hasMore: boolean;
    nextCursor: string | null;
}

type RoomKeysResponse = {
    userId: string;
    publicKey: string;
}[];

export default function ChatsScreen() {
    const { id, user: userRaw } = useLocalSearchParams<{ id: string; user: string }>();
    const user = JSON.parse(userRaw) as Chat;
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<ScrollView>(null);
    const [currentUserId] = useStore<string | null>("userId", null);
    const [token] = useStore<string | null>("token", null);

    const { theme } = useTheme();
    const insets = useSafeAreaInsets();

    const base = process.env.EXPO_PUBLIC_BACKEND_URL || "https://elysio.jamiepoeffel.ch";

    // ─── Nachrichten laden ───────────────────────────────────────────────────
    const fetchOptions = useMemo(
        () => ({ method: "GET", headers: { "Content-Type": "application/json" } }),
        [],
    );

    const [data, loading] = useFetch<RoomMessagesResponse>(
        `/chat/rooms/${id}/messages`,
        fetchOptions,
        { useCache: false },
    );

    // Nachrichten entschlüsseln sobald sie geladen sind
    useEffect(() => {
        if (!data) return;

        Promise.all(
            data.messages.map(async (msg) => {
                let text = "[Encrypted message]";

                if (msg.encryptedKey) {
                    try {
                        text = await decryptMessage({
                            ciphertext: msg.ciphertext,
                            iv: msg.iv,
                            authTag: msg.authTag,
                            encryptedKey: msg.encryptedKey,
                        });
                    } catch {
                        text = "[Unable to decrypt]";
                    }
                }

                return {
                    id: msg.id,
                    senderId: msg.senderId,
                    text,
                    createdAt: msg.createdAt,
                };
            }),
        ).then((decrypted) => {
            // Server gibt DESC zurück → umkehren für chronologische Anzeige
            setMessages(decrypted.reverse());
        });
    }, [data]);

    // ─── Nachricht senden ────────────────────────────────────────────────────
    const sendMessage = async () => {
        const text = message.trim();
        if (!text || sending) return;

        setSending(true);
        setMessage("");

        try {
            const keysRes = await fetch(`${base}/chat/rooms/${id}/keys`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const recipients: RoomKeysResponse = await keysRes.json();
            const validRecipients = recipients.filter((r) => r.publicKey);

            const payload = await encryptMessage(text, validRecipients);
            console.log("Payload:", JSON.stringify(payload)); // ← neu

            const res = await fetch(`${base}/chat/rooms/${id}/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const resText = await res.text(); // ← neu
            console.log("Server:", res.status, resText); // ← neu

            if (!res.ok) throw new Error("Send failed");
            const sent = JSON.parse(resText); // ← statt res.json()

            setMessages((prev) => [
                ...prev,
                {
                    id: sent.id,
                    senderId: sent.senderId,
                    text,
                    createdAt: sent.createdAt,
                },
            ]);
        } catch (e) {
            console.error("Send error:", e);
            setMessage(text);
        } finally {
            setSending(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: theme.background }}
            behavior="padding"
            keyboardVerticalOffset={Platform.OS === "ios" ? insets.bottom : 25}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={{ flex: 1 }}>
                    {/* Header */}
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            width: "100%",
                            paddingTop: 16,
                            backgroundColor: theme.background,
                            borderBottomWidth: 1,
                            borderBottomColor: theme.base + "1A",
                        }}
                    >
                        <Pressable
                            onPress={() => router.back()}
                            style={{ padding: 12, borderRadius: 8 }}
                        >
                            <ChevronLeft color={theme.base} />
                        </Pressable>
                        <View style={{ width: 8 }} />
                        <Image
                            source={{ uri: user.image || undefined }}
                            placeholder="|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj["
                            contentFit="cover"
                            transition={500}
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 18,
                                backgroundColor: theme.base + "33",
                            }}
                        />
                        <Text
                            pointerEvents="none"
                            style={{
                                marginLeft: 12,
                                color: theme.text,
                                fontSize: 18,
                                fontWeight: "bold",
                            }}
                        >
                            {user.name}
                        </Text>
                    </View>

                    {/* Nachrichten */}
                    <View style={{ flex: 1, paddingTop: 12 }}>
                        {loading ? (
                            <ActivityIndicator
                                style={{ marginTop: 32 }}
                                color={theme.primary}
                            />
                        ) : (
                            <ScrollView
                                ref={scrollRef}
                                style={{ flex: 1 }}
                                onContentSizeChange={() =>
                                    scrollRef.current?.scrollToEnd({ animated: true })
                                }
                                contentContainerStyle={{
                                    flexDirection: "column",
                                    paddingHorizontal: 12,
                                    gap: 8,
                                    paddingBottom: 8,
                                }}
                            >
                                {messages.map((msg) => (
                                    <MessageBubble
                                        key={msg.id}
                                        text={msg.text}
                                        isOwn={msg.senderId === currentUserId}
                                    />
                                ))}
                            </ScrollView>
                        )}
                    </View>

                    {/* Input */}
                    <View
                        style={{
                            borderTopWidth: 1,
                            borderTopColor: theme.base + "1A",
                            flexDirection: "row",
                            alignItems: "flex-end",
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            marginBottom: Platform.OS === "ios" ? 20 : 0,
                        }}
                    >
                        <TextInput
                            placeholder="Type a message..."
                            placeholderTextColor={theme.base + "66"}
                            multiline
                            value={message}
                            onChangeText={setMessage}
                            style={{
                                flex: 1,
                                maxHeight: 120,
                                paddingHorizontal: 8,
                                paddingVertical: 6,
                                color: theme.text,
                                fontSize: 16,
                            }}
                        />
                        <Pressable
                            style={{
                                width: 32,
                                height: 32,
                                marginLeft: 8,
                                borderRadius: 999,
                                backgroundColor: sending
                                    ? theme.base + "66"
                                    : theme.primary,
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                            onPress={sendMessage}
                            disabled={sending}
                        >
                            {sending ? (
                                <ActivityIndicator size={14} color={theme.white} />
                            ) : (
                                <ArrowUp color={theme.white} size={18} />
                            )}
                        </Pressable>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

function MessageBubble({ text, isOwn }: { text: string; isOwn?: boolean }) {
    const { theme } = useTheme();

    return (
        <View
            style={{
                padding: 12,
                backgroundColor: isOwn ? theme.primary : theme.card,
                borderRadius: 20,
                maxWidth: "80%",
                alignSelf: isOwn ? "flex-end" : "flex-start",
            }}
        >
            <Text style={{ color: isOwn ? theme.white : theme.text }}>{text}</Text>
        </View>
    );
}
