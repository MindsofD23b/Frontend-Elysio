import {
    ActivityIndicator,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useCallback, useEffect, useState } from "react";
import { useTheme } from "@/lib/theme/context";
import { router } from "expo-router";
import { Chat } from "@/types/chats";
import ChatComponent from "@/components/ChatComponent";
import { Theme } from "@/lib/theme/theme";
import { decryptMessage } from "@/services/chat-crypto.client";
import { Search } from "lucide-react-native";
import { useAuth } from "@/lib/auth/AuthProvider";

const base = process.env.EXPO_PUBLIC_BACKEND_URL || "https://elysio.jamiepoeffel.ch";

export default function Index() {
    const { theme } = useTheme();
    const [refreshing, setRefreshing] = useState(false);
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();

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

    const loadChats = useCallback(async () => {
        if (!token) return;

        setLoading(true);
        try {
            const res = await fetch(`${base}/chat/rooms`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error("Failed to fetch chats");
            const data: ChatResponse[] = await res.json();

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

            setChats(orderChatsByUpdatedAt(mapped));
        } finally {
            setLoading(false);
        }
    }, [token]);
    const onRefresh = async () => {
        setRefreshing(true);
        await loadChats();
        setRefreshing(false);
    };

    useEffect(() => {
        loadChats();
    }, [loadChats]);

    const [filteredChats, setFilteredChats] = useState<Chat[]>([]);

    useEffect(() => {
        setFilteredChats(chats);
    }, [chats]);

    const onSearch = (text: string) => {
        const filtered = chats.filter((chat) =>
            chat.name.toLowerCase().includes(text.toLowerCase()),
        );
        setFilteredChats(filtered);
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={{ borderBottomColor: theme.base + "1A", borderBottomWidth: 1 }}>
                <SearchBarComponent onSearch={onSearch} />
            </View>
            {loading && (
                <ActivityIndicator
                    size={50}
                    style={{ backgroundColor: theme.background }}
                    color={theme.text}
                />
            )}

            {!loading && filteredChats.length === 0 && (
                <View
                    style={{
                        paddingTop: 32,
                        alignItems: "center",
                        backgroundColor: theme.background,
                    }}
                >
                    <Text>
                        No chats found. Start a new conversation by Joining a Call
                    </Text>
                </View>
            )}

            <View style={{ flex: 1, width: "100%", backgroundColor: theme.background }}>
                <FlashList
                    data={filteredChats}
                    contentContainerStyle={{ backgroundColor: theme.background }}
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
                    estimatedItemSize={80}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={theme.text}
                        />
                    }
                />
            </View>
        </View>
    );
}

function orderChatsByUpdatedAt(chats: Chat[]): Chat[] {
    return [...chats].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
}

interface ISearchBarComponent {
    onSearch: (text: string) => void;
}

function SearchBarComponent({ onSearch }: ISearchBarComponent) {
    const { theme } = useTheme();
    const styles = makeStyles(theme);
    const [searchText, setSearchText] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(searchText);
        }, 400);

        return () => clearTimeout(timer);
    }, [searchText, onSearch]);

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <Search size={20} color={theme.grayscale} style={{ marginBottom: -2 }} />
                <TextInput
                    placeholder="Search"
                    value={searchText}
                    onChangeText={setSearchText}
                    style={styles.input}
                    placeholderTextColor={theme.grayscale}
                />
            </View>
        </View>
    );
}

const makeStyles = (theme: Theme) =>
    StyleSheet.create({
        container: {
            padding: 16,
            backgroundColor: theme.background,
        },
        inputContainer: {
            backgroundColor: theme.base + "1A",
            color: theme.text,
            padding: 8,
            borderRadius: 8,
            flexDirection: "row",
            gap: 8,
        },
        input: {},
    });
