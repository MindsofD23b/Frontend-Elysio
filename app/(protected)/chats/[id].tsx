import { useAuthFetch } from "@/hooks/useAuthFetch";
import { useTheme } from "@/lib/theme/context";
import { Chat } from "@/types/chats";
import { decryptMessage, encryptMessage } from "@/services/chat-crypto.client";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowUp, ChevronLeft, Heart, MessageCircleMore } from "lucide-react-native";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth/AuthProvider";
// Design made with Pinterest and ChatGPT
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
    const [sending, setSending] = useState(false);
    const [decryptedMessages, setDecryptedMessages] = useState<Message[]>([]);

    const scrollRef = useRef<ScrollView>(null);
    const { token } = useAuth();
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();

    const inputRef = useRef<TextInput>(null);

    const startConversation = useCallback(() => {
        const firstName = user.name?.split(" ")[0] ?? user.name ?? "";
        setMessage(`Hey ${firstName} 👋`);
        requestAnimationFrame(() => {
            inputRef.current?.focus();
        });
    }, [user.name]);

    const messagesRequest = useMemo<RequestInit>(
        () => ({
            method: "GET",
        }),
        [],
    );

    const messagesOptions = useMemo(
        () => ({
            manual: true,
            useCache: false,
        }),
        [],
    );
    const [, loading, _error, run] = useAuthFetch<RoomMessagesResponse>(
        `/chat/rooms/${id}/messages`,
        messagesRequest,
        messagesOptions,
    );

    const roomKeysRequest = useMemo<RequestInit>(
        () => ({
            method: "GET",
        }),
        [],
    );

    const roomKeysOptions = useMemo(
        () => ({
            manual: true,
            useCache: false,
        }),
        [],
    );

    const sendMessageRequest = useMemo<RequestInit>(
        () => ({
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        }),
        [],
    );

    const sendMessageOptions = useMemo(
        () => ({
            manual: true,
            useCache: false,
        }),
        [],
    );

    const [, , , runFetchRoomKeys] = useAuthFetch<RoomKeysResponse>(
        `/chat/rooms/${id}/keys`,
        roomKeysRequest,
        roomKeysOptions,
    );

    const [, , , runSendMessage] = useAuthFetch<{
        id: string;
        senderId: string;
        createdAt: string;
    }>(`/chat/rooms/${id}/messages`, sendMessageRequest, sendMessageOptions);

    const loadMessages = useCallback(async () => {
        try {
            const data = await run();

            const decrypted = await Promise.all(
                data.messages.map(async (msg) => {
                    let text = "[Encrypted message]";

                    if (msg.type !== "text") {
                        text = "Voice message";
                    } else if (msg.encryptedKey) {
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
            );

            setDecryptedMessages(
                decrypted.sort(
                    (a, b) =>
                        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
                ),
            );
        } catch (err) {
            console.error("loadMessages error", err);
        }
    }, [run]);

    useEffect(() => {
        if (!token) return;
        loadMessages();
    }, [token, loadMessages]);

    const sendMessage = async () => {
        const text = message.trim();
        if (!text || sending) return;

        setSending(true);
        setMessage("");

        try {
            const recipients = await runFetchRoomKeys();
            const validRecipients = recipients.filter((r) => r.publicKey);

            const payload = await encryptMessage(text, validRecipients);

            const sent = await runSendMessage({
                body: JSON.stringify(payload),
            });

            setDecryptedMessages((prev) => [
                ...prev,
                {
                    id: sent.id,
                    senderId: sent.senderId,
                    text,
                    createdAt: sent.createdAt,
                },
            ]);
        } catch (e: unknown) {
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
            <View style={{ flex: 1 }}>
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

                <View style={{ flex: 1, paddingTop: 12 }}>
                    {loading ? (
                        <ActivityIndicator
                            style={{ marginTop: 32 }}
                            color={theme.primary}
                        />
                    ) : decryptedMessages.length === 0 ? (
                        <EmptyMessagesState
                            name={user.name}
                            onPress={startConversation}
                        />
                    ) : (
                        <ScrollView
                            ref={scrollRef}
                            style={{ flex: 1 }}
                            keyboardShouldPersistTaps="handled"
                            onContentSizeChange={() =>
                                scrollRef.current?.scrollToEnd({ animated: true })
                            }
                            contentContainerStyle={{
                                flexDirection: "column",
                                paddingTop: 0,
                                paddingBottom: 12,
                            }}
                        >
                            {decryptedMessages.map((msg, i) => {
                                const next = decryptedMessages[i + 1];
                                const sameMinute =
                                    next &&
                                    next.senderId === msg.senderId &&
                                    new Date(next.createdAt).getFullYear() ===
                                        new Date(msg.createdAt).getFullYear() &&
                                    new Date(next.createdAt).getMonth() ===
                                        new Date(msg.createdAt).getMonth() &&
                                    new Date(next.createdAt).getDate() ===
                                        new Date(msg.createdAt).getDate() &&
                                    new Date(next.createdAt).getHours() ===
                                        new Date(msg.createdAt).getHours() &&
                                    new Date(next.createdAt).getMinutes() ===
                                        new Date(msg.createdAt).getMinutes();

                                return (
                                    <MessageBubble
                                        key={msg.id}
                                        text={msg.text}
                                        time={msg.createdAt}
                                        isOwn={msg.senderId !== user.otherUser.id}
                                        hideTime={!!sameMinute}
                                    />
                                );
                            })}
                        </ScrollView>
                    )}
                </View>

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
                        ref={inputRef}
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
                            backgroundColor: sending ? theme.base + "66" : theme.primary,
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
        </KeyboardAvoidingView>
    );
}
function EmptyMessagesState({ name, onPress }: { name: string; onPress: () => void }) {
    const { theme } = useTheme();
    const firstName = name?.split(" ")[0] ?? name;

    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: 28,
                paddingBottom: 48,
                backgroundColor: theme.background,
            }}
        >
            <View
                style={{
                    width: 230,
                    height: 180,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 24,
                    position: "relative",
                }}
            >
                <View
                    style={{
                        position: "absolute",
                        top: 22,
                        right: 40,
                        width: 16,
                        height: 16,
                        borderRadius: 999,
                        backgroundColor: theme.primary + "14",
                    }}
                />
                <View
                    style={{
                        position: "absolute",
                        top: 86,
                        left: 22,
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        backgroundColor: theme.primary + "10",
                    }}
                />
                <View
                    style={{
                        position: "absolute",
                        top: 118,
                        right: 58,
                        width: 12,
                        height: 12,
                        borderRadius: 999,
                        backgroundColor: theme.primary + "12",
                    }}
                />

                <View
                    style={{
                        position: "absolute",
                        width: 96,
                        height: 96,
                        borderRadius: 999,
                        backgroundColor: theme.primary,
                        right: 34,
                        top: 42,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <MessageCircleMore color={theme.white} size={30} strokeWidth={2.2} />
                </View>

                <View
                    style={{
                        position: "absolute",
                        width: 112,
                        height: 112,
                        borderRadius: 999,
                        backgroundColor: theme.background,
                        borderWidth: 6,
                        borderColor: theme.primary,
                        left: 34,
                        top: 18,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Heart color={theme.primary} size={28} strokeWidth={2.4} />
                </View>

                <View
                    style={{
                        position: "absolute",
                        bottom: 6,
                        width: 96,
                        height: 12,
                        borderRadius: 999,
                        backgroundColor: theme.primary + "12",
                    }}
                />
            </View>

            <Text
                style={{
                    color: theme.text,
                    fontSize: 28,
                    fontWeight: "800",
                    textAlign: "center",
                    marginBottom: 12,
                }}
            >
                No messages yet
            </Text>

            <Text
                style={{
                    color: theme.grayscale,
                    fontSize: 15,
                    lineHeight: 24,
                    textAlign: "center",
                    maxWidth: 320,
                    marginBottom: 28,
                }}
            >
                Start the conversation with {firstName}. A simple hello can turn into
                something special.
            </Text>

            <Pressable
                onPress={onPress}
                style={{
                    minWidth: 220,
                    backgroundColor: theme.primary,
                    paddingVertical: 15,
                    paddingHorizontal: 24,
                    borderRadius: 16,
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Text
                    style={{
                        color: theme.white,
                        fontSize: 16,
                        fontWeight: "700",
                    }}
                >
                    Say hi
                </Text>
            </Pressable>
        </View>
    );
}
function MessageBubble({
    text,
    time,
    isOwn,
    hideTime,
}: {
    text: string;
    time: string;
    isOwn?: boolean;
    hideTime?: boolean;
}) {
    const { theme } = useTheme();
    const timeString = new Date(time).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <View
            style={{
                alignSelf: isOwn ? "flex-end" : "flex-start",
                marginRight: isOwn ? 8 : 0,
                marginLeft: isOwn ? 0 : 8,
                marginBottom: hideTime ? 2 : 8,
                maxWidth: "80%",
            }}
        >
            <View
                style={{
                    paddingTop: 8,
                    paddingBottom: 6,
                    paddingHorizontal: 12,
                    backgroundColor: isOwn ? theme.primary : theme.card,
                    borderRadius: 18,
                    borderBottomRightRadius: !hideTime && isOwn ? 4 : 18,
                    borderBottomLeftRadius: !hideTime && !isOwn ? 4 : 18,
                }}
            >
                <Text
                    style={{
                        color: isOwn ? theme.white : theme.text,
                        fontSize: 16,
                    }}
                >
                    {text}
                </Text>
                {!hideTime && (
                    <Text
                        style={{
                            color: isOwn ? theme.white : theme.text,
                            fontSize: 11,
                            opacity: 0.6,
                            alignSelf: "flex-end",
                            marginTop: 4,
                        }}
                    >
                        {timeString}
                    </Text>
                )}
            </View>
        </View>
    );
}
