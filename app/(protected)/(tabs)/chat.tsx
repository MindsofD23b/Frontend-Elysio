import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTheme } from "@/lib/theme/context";
import { router } from "expo-router";
import { Chat } from "@/types/chats";
import ChatComponent from "@/components/ChatComponent";
import { Theme } from "@/lib/theme/theme";
import { decryptMessage } from "@/services/chat-crypto.client";
import { Heart, MessageCircleMore, Search } from "lucide-react-native";
import { useAuthFetch } from "@/hooks/useAuthFetch";

// Design made with Pinterest and ChatGPT
interface ChatResponse {
    room: {
        id: string;
        userAId: string;
        userBId: string;
        createdAt: string;
        updatedAt: string;
    };
    lastMessage: {
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
    } | null;
    otherUser: {
        id: string;
        fullName: string;
        avatar: string | null;
    };
}

function orderChatsByUpdatedAt(chats: Chat[]): Chat[] {
    return [...chats].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
}

async function mapChatResponses(data: ChatResponse[]): Promise<Chat[]> {
    const mapped = await Promise.all(
        data.map(async (chat) => {
            let lastMessageText = "";

            if (!chat.lastMessage) {
                lastMessageText = "";
            } else if (chat.lastMessage.type !== "text") {
                lastMessageText = "🎤 Voice message";
            } else if (!chat.lastMessage.encryptedKey) {
                lastMessageText = "[Encrypted message]";
            } else {
                try {
                    lastMessageText = await decryptMessage({
                        ciphertext: chat.lastMessage.ciphertext,
                        iv: chat.lastMessage.iv,
                        authTag: chat.lastMessage.authTag,
                        encryptedKey: chat.lastMessage.encryptedKey,
                    });
                } catch {
                    lastMessageText = "[Unable to decrypt]";
                }
            }

            return {
                id: chat.room.id,
                otherUser: {
                    id: chat.otherUser.id,
                    fullName: chat.otherUser.fullName,
                    avatar: chat.otherUser.avatar,
                },
                name: chat.otherUser.fullName,
                lastMessage: lastMessageText,
                createdAt: chat.room.createdAt,
                updatedAt: chat.room.updatedAt,
                image: chat.otherUser.avatar ?? "",
            };
        }),
    );

    return orderChatsByUpdatedAt(mapped);
}

export default function Index() {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    const [refreshing, setRefreshing] = useState(false);
    const [chats, setChats] = useState<Chat[]>([]);
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(true);

    const [rawData, , , run] = useAuthFetch<ChatResponse[]>(
        "/chat/rooms",
        { method: "GET" },
        { cacheKey: "chat:rooms" },
    );

    useEffect(() => {
        if (!rawData) return;
        mapChatResponses(rawData)
            .then(setChats)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [rawData]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            const data = await run();
            if (data) setChats(await mapChatResponses(data));
        } catch {}
        setRefreshing(false);
    }, [run]);

    const filteredChats = useMemo(() => {
        const value = searchText.trim().toLowerCase();
        if (!value) return chats;
        return chats.filter((chat) => chat.name.toLowerCase().includes(value));
    }, [chats, searchText]);

    const isSearching = searchText.trim().length > 0;

    return (
        <View style={styles.screen}>
            <View style={styles.searchWrapper}>
                <SearchBarComponent value={searchText} onChangeText={setSearchText} />
            </View>

            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size={42} color={theme.base} />
                </View>
            ) : (
                <FlashList
                    data={filteredChats}
                    renderItem={({ item }) => (
                        <ChatComponent
                            chat={item}
                            onPress={() => {
                                router.push({
                                    pathname: "/chats/[id]",
                                    params: {
                                        id: item.id,
                                        user: JSON.stringify(item),
                                    },
                                });
                            }}
                        />
                    )}
                    keyExtractor={(item) => item.id}
                    estimatedItemSize={88}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={
                        filteredChats.length === 0
                            ? { ...styles.listContent, ...styles.emptyListContent }
                            : styles.listContent
                    }
                    ListEmptyComponent={
                        <EmptyChatsState
                            isSearching={isSearching}
                            onPrimaryPress={() => {
                                if (isSearching) {
                                    setSearchText("");
                                    return;
                                }
                                router.push("/videocall");
                            }}
                        />
                    }
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={theme.text}
                        />
                    }
                />
            )}
        </View>
    );
}

interface ISearchBarComponent {
    value: string;
    onChangeText: (text: string) => void;
}

function SearchBarComponent({ value, onChangeText }: ISearchBarComponent) {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    return (
        <View style={styles.searchContainer}>
            <View style={styles.inputContainer}>
                <Search size={18} color={theme.grayscale} style={{ marginBottom: -1 }} />
                <TextInput
                    placeholder="Search"
                    value={value}
                    onChangeText={onChangeText}
                    style={styles.input}
                    placeholderTextColor={theme.grayscale}
                />
            </View>
        </View>
    );
}

interface EmptyChatsStateProps {
    isSearching: boolean;
    onPrimaryPress: () => void;
}

function EmptyChatsState({ isSearching, onPrimaryPress }: EmptyChatsStateProps) {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    return (
        <View style={styles.emptyStateWrapper}>
            <View style={styles.illustrationArea}>
                <View
                    style={[
                        styles.floatingDot,
                        styles.dotOne,
                        { backgroundColor: theme.base + "14" },
                    ]}
                />
                <View
                    style={[
                        styles.floatingDot,
                        styles.dotTwo,
                        { backgroundColor: theme.base + "10" },
                    ]}
                />
                <View
                    style={[
                        styles.floatingDot,
                        styles.dotThree,
                        { backgroundColor: theme.base + "12" },
                    ]}
                />

                <View
                    style={[
                        styles.backBubble,
                        {
                            backgroundColor: theme.background,
                            shadowColor: theme.primary,
                        },
                    ]}
                >
                    <MessageCircleMore size={30} color={theme.white} strokeWidth={2.2} />
                </View>

                <View
                    style={[
                        styles.frontBubble,
                        {
                            backgroundColor: theme.background,
                            borderColor: theme.primary,
                        },
                    ]}
                >
                    <Heart size={28} color={theme.primary} strokeWidth={2.4} />
                </View>

                <View
                    style={[styles.shadow, { backgroundColor: theme.primary + "12" }]}
                />
            </View>

            <Text style={styles.emptyTitle}>
                {isSearching ? "Keine Chats gefunden" : "Noch keine Chats"}
            </Text>

            <Text style={styles.emptySubtitle}>
                {isSearching
                    ? "Zu deiner Suche konnten wir keine Unterhaltung finden. Versuche es mit einem anderen Namen."
                    : "Hier erscheinen deine Matches und Nachrichten. Starte einen neuen Kontakt und bringe das erste Gespraech ins Rollen."}
            </Text>

            <Pressable style={styles.emptyButton} onPress={onPrimaryPress}>
                <Text style={styles.emptyButtonText}>
                    {isSearching ? "Suche zuruecksetzen" : "Neue Leute entdecken"}
                </Text>
            </Pressable>
        </View>
    );
}

const makeStyles = (theme: Theme) =>
    StyleSheet.create({
        screen: {
            flex: 1,
            backgroundColor: theme.background,
        },
        searchWrapper: {
            borderBottomColor: theme.base + "14",
            borderBottomWidth: 1,
        },
        searchContainer: {
            paddingHorizontal: 16,
            paddingVertical: 14,
            backgroundColor: theme.background,
        },
        inputContainer: {
            backgroundColor: theme.base + "10",
            borderRadius: 14,
            paddingHorizontal: 12,
            paddingVertical: 10,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
        },
        input: {
            flex: 1,
            color: theme.text,
            fontSize: 15,
            paddingVertical: 0,
        },
        loaderContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: theme.background,
        },
        listContent: {
            paddingBottom: 24,
            backgroundColor: theme.background,
        },
        emptyListContent: {
            flexGrow: 1,
        },
        emptyStateWrapper: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 28,
            paddingBottom: 48,
        },
        illustrationArea: {
            width: 210,
            height: 170,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 18,
        },
        backBubble: {
            position: "absolute",
            width: 94,
            height: 94,
            borderRadius: 999,
            right: 42,
            top: 34,
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 5,
            borderColor: theme.primary,
        },
        frontBubble: {
            position: "absolute",
            width: 108,
            height: 108,
            borderRadius: 999,
            left: 38,
            top: 18,
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 5,
        },
        shadow: {
            position: "absolute",
            width: 90,
            height: 12,
            borderRadius: 999,
            bottom: 6,
        },
        floatingDot: {
            position: "absolute",
            borderRadius: 999,
        },
        dotOne: {
            width: 10,
            height: 10,
            left: 22,
            top: 86,
        },
        dotTwo: {
            width: 16,
            height: 16,
            right: 40,
            top: 22,
        },
        dotThree: {
            width: 12,
            height: 12,
            right: 58,
            top: 118,
        },
        emptyTitle: {
            color: theme.text,
            fontSize: 28,
            fontWeight: "800",
            textAlign: "center",
            marginBottom: 12,
        },
        emptySubtitle: {
            color: theme.grayscale,
            fontSize: 15,
            lineHeight: 24,
            textAlign: "center",
            maxWidth: 320,
            marginBottom: 28,
        },
        emptyButton: {
            minWidth: 220,
            backgroundColor: theme.base,
            paddingVertical: 15,
            paddingHorizontal: 24,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
        },
        emptyButtonText: {
            color: theme.background,
            fontSize: 16,
            fontWeight: "700",
        },
    });
