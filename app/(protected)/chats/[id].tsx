import { useAuthFetch } from "@/hooks/useAuthFetch";
import { useTheme } from "@/lib/theme/context";
import { Chat } from "@/types/chats";
import {
    decryptBatch,
    decryptMessage,
    encryptMessage,
} from "@/services/chat-crypto.client";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import {
    ArrowUp,
    ChevronDown,
    ChevronLeft,
    Heart,
    MessageCircleMore,
} from "lucide-react-native";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
    ActivityIndicator,
    Animated,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth/AuthProvider";
import { FlashList } from "@shopify/flash-list";
import {
    Message,
    RoomMessagesResponse,
    RoomKeysResponse,
    MessageWithMeta,
} from "@/types/messages";
import { MessageBubble } from "@/components/messageBubble";
import { useRoomSocket } from "@/hooks/useRoomSocket";
// Design made with Pinterest and ChatGPT

// Wie viele Pixel vom unteren Ende entfernt gilt noch als "unten"
const BOTTOM_THRESHOLD = 80;

export default function ChatsScreen() {
    const { id, user: userRaw } = useLocalSearchParams<{ id: string; user: string }>();
    const user = JSON.parse(userRaw) as Chat;

    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [decryptedMessages, setDecryptedMessages] = useState<MessageWithMeta[]>([]);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    // Scroll-to-bottom Button State
    const [showScrollButton, setShowScrollButton] = useState(false);
    const scrollButtonOpacity = useRef(new Animated.Value(0)).current;
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const scrollRef = useRef<FlashList<MessageWithMeta>>(null);
    const { token } = useAuth();
    const currentUserId: string | null = token
        ? JSON.parse(atob(token.split(".")[1])).sub
        : null;
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

    const inputRef = useRef<TextInput>(null);

    // Button ein-/ausblenden animieren
    const showButton = useCallback(() => {
        setShowScrollButton(true);
        Animated.spring(scrollButtonOpacity, {
            toValue: 1,
            useNativeDriver: true,
            tension: 80,
            friction: 10,
        }).start();
    }, [scrollButtonOpacity]);

    const hideButton = useCallback(() => {
        Animated.spring(scrollButtonOpacity, {
            toValue: 0,
            useNativeDriver: true,
            tension: 80,
            friction: 10,
        }).start(() => setShowScrollButton(false));
    }, [scrollButtonOpacity]);

    // Debounced onScroll Handler — wird maximal alle 150ms ausgewertet
    // Bei invertierter Liste: offset 0 = ganz unten, grosser offset = weit oben
    const handleScroll = useCallback(
        (event: { nativeEvent: { contentOffset: { y: number } } }) => {
            const offsetY = event.nativeEvent.contentOffset.y;

            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }

            debounceTimer.current = setTimeout(() => {
                if (offsetY > BOTTOM_THRESHOLD) {
                    showButton();
                } else {
                    hideButton();
                }
            }, 50);
        },
        [showButton, hideButton],
    );

    // Cleanup beim Unmount
    useEffect(() => {
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, []);

    const scrollToBottom = useCallback(() => {
        scrollRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, []);

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
    const [, , _error, run] = useAuthFetch<RoomMessagesResponse>(
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
    }>(`/chat/rooms/${id}/messages?limit=30`, sendMessageRequest, sendMessageOptions);

    const loadMessages = useCallback(async () => {
        try {
            const data = await run(undefined, `/chat/rooms/${id}/messages?limit=30`);
            const decrypted = await decryptBatch(data.messages);

            setDecryptedMessages(attachSameMinute([...decrypted]));
            setNextCursor(data.nextCursor);
            setHasMore(data.hasMore);
        } catch (err) {
            console.error("loadMessages error", err);
        } finally {
            setHasLoadedOnce(true);
        }
    }, [run, id]);

    const loadOlderMessages = useCallback(async () => {
        if (!hasMore || loadingMore || !nextCursor) return;
        setLoadingMore(true);

        try {
            const data = await run(
                undefined,
                `/chat/rooms/${id}/messages?limit=30&before=${nextCursor}`,
            );
            const decrypted = await decryptBatch(data.messages);

            setDecryptedMessages((prev) => attachSameMinute([...prev, ...decrypted]));
            setNextCursor(data.nextCursor);
            setHasMore(data.hasMore);
        } catch (err) {
            console.error("loadOlderMessages error", err);
        } finally {
            setLoadingMore(false);
        }
    }, [hasMore, loadingMore, nextCursor, run, id]);

    useEffect(() => {
        if (!token) return;

        setHasLoadedOnce(false);
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
                {
                    id: sent.id,
                    senderId: sent.senderId,
                    text,
                    createdAt: sent.createdAt,
                    hideTime: false,
                },
                ...prev,
            ]);
        } catch (e: unknown) {
            console.error("Send error:", e);
            setMessage(text);
        } finally {
            setSending(false);
        }
    };
    useRoomSocket(id, async (incoming) => {
        if (incoming.senderId === currentUserId) return;

        let text = "[Encrypted message]";

        if (incoming.type !== "text") {
            text = "Voice message";
        } else {
            const myKey = incoming.encryptedKeys.find((k) => k.userId === currentUserId);
            if (myKey) {
                try {
                    text = await decryptMessage({
                        ciphertext: incoming.ciphertext,
                        iv: incoming.iv,
                        authTag: incoming.authTag,
                        encryptedKey: myKey.encryptedKey,
                    });
                } catch {
                    text = "[Unable to decrypt]";
                }
            }
        }

        setDecryptedMessages((prev) => [
            ...prev,
            {
                id: incoming.id,
                senderId: incoming.senderId,
                text,
                createdAt: incoming.createdAt,
                hideTime: false,
            },
        ]);
    });

    function attachSameMinute(messages: Message[]): MessageWithMeta[] {
        return messages.map((msg, i) => {
            const next = messages[i - 1]; // inverted so previous index
            const sameMinute =
                !!next &&
                next.senderId === msg.senderId &&
                new Date(next.createdAt).getMinutes() ===
                    new Date(msg.createdAt).getMinutes() &&
                new Date(next.createdAt).getHours() ===
                    new Date(msg.createdAt).getHours() &&
                new Date(next.createdAt).getDate() === new Date(msg.createdAt).getDate();
            return { ...msg, hideTime: sameMinute } as MessageWithMeta;
        });
    }

    const otherUserId = useMemo(() => user.otherUser.id, [user.otherUser.id]);

    const renderMessage = useCallback(
        ({ item }: { item: Message & { hideTime: boolean } }) => (
            <MessageBubble
                text={item.text}
                time={item.createdAt}
                isOwn={item.senderId !== otherUserId}
                hideTime={item.hideTime}
            />
        ),
        [otherUserId],
    );

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

                {/* Nachrichten-Liste + Scroll-Button als relativer Container */}
                <View style={{ flex: 1 }}>
                    {!hasLoadedOnce ? (
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
                        <>
                            <FlashList
                                ref={scrollRef}
                                data={decryptedMessages}
                                renderItem={renderMessage}
                                overrideItemLayout={(layout, item) => {
                                    layout.size = item.hideTime ? 44 : 68;
                                }}
                                estimatedItemSize={72}
                                keyExtractor={(item) => item.id}
                                onEndReached={loadOlderMessages}
                                onEndReachedThreshold={0.6}
                                onScroll={handleScroll}
                                scrollEventThrottle={16}
                                inverted
                                drawDistance={5000}
                                ListHeaderComponent={
                                    loadingMore ? (
                                        <ActivityIndicator
                                            color={theme.primary}
                                            style={{ padding: 12 }}
                                        />
                                    ) : null
                                }
                                contentContainerStyle={{ paddingBottom: 12 }}
                            />

                            {/* Scroll-to-bottom Button */}
                            {showScrollButton && (
                                <Animated.View
                                    style={{
                                        position: "absolute",
                                        bottom: 16,
                                        alignSelf: "center",
                                        opacity: scrollButtonOpacity,
                                        transform: [
                                            {
                                                translateY:
                                                    scrollButtonOpacity.interpolate({
                                                        inputRange: [0, 1],
                                                        outputRange: [12, 0],
                                                    }),
                                            },
                                        ],
                                    }}
                                >
                                    <Pressable
                                        onPress={scrollToBottom}
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 999,
                                            backgroundColor: theme.primary,
                                            alignItems: "center",
                                            justifyContent: "center",
                                            shadowColor: "#000",
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.2,
                                            shadowRadius: 4,
                                            elevation: 4,
                                        }}
                                    >
                                        <ChevronDown
                                            color={theme.white}
                                            size={20}
                                            strokeWidth={2.5}
                                        />
                                    </Pressable>
                                </Animated.View>
                            )}
                        </>
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
