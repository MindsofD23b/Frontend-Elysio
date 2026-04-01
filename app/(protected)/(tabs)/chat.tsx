import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from "react-native";
// TODO: switch back to FlashList after development build
// import { FlashList } from "@shopify/flash-list";
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "@/lib/theme/context";
import { router } from "expo-router";
import { Chat } from "@/types/chats";
import ChatComponent from "@/components/ChatComponent";
import Input from "@/components/input";
import { Theme } from "@/lib/theme/theme";
import { useFetch } from "@/hooks/useFetch";
import { decryptMessage } from "@/services/chat-crypto.client";

export default function Index() {
    const { theme } = useTheme();
    const [refreshing, setRefreshing] = useState(false);
    const [chats, setChats] = useState<Chat[]>([]);

    const onRefresh = async () => {
        setRefreshing(true);
        setRefreshing(false);
    };

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
            cyphertext: string;
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

    const fetchOptions = useMemo(
        () => ({ method: "GET", headers: { "Content-Type": "application/json" } }),
        [],
    );

    const [data, loading, _error, run] = useFetch<ChatResponse[]>(
        "/chat/rooms",
        fetchOptions,
        { useCache: true },
    );

    useEffect(() => {
        run();
    }, [run]);

    useEffect(() => {
        if (!data) return;
        Promise.all(
            data.map(async (chat) => ({
                id: chat.room.id,
                name: chat.otherUser.fullName,
                lastMessage:
                    chat.lastMessage?.type === "text"
                        ? chat.lastMessage.cyphertext
                        : ((await decryptMessage({
                              ciphertext: chat.lastMessage?.cyphertext ?? "",
                              iv: chat.lastMessage?.iv ?? "",
                              authTag: chat.lastMessage?.authTag ?? "",
                              encryptedKey: chat.lastMessage?.mediaUrl ?? "",
                          })) ?? "[Unable to decrypt message]"),
                createdAt: chat.room.createdAt,
                updatedAt: chat.room.updatedAt,
                image: chat.otherUser.avatar ?? "",
            })),
        ).then((mapped) => {
            setChats(orderChatsByUpdatedAt(mapped));
        });
    }, [data]);

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
        <View>
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
            {/*TODO: switch back to FlashList after development build
                <FlashList
                    data={chats}
                    renderItem={({ item }) => (
                        <ChatComponent chat={item} href={`/chats/${item.id}` as Href} />
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
            */}

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

            <FlatList
                data={filteredChats}
                style={{
                    height: "86%",
                    backgroundColor: theme.background,
                }}
                renderItem={({ item }) => (
                    <ChatComponent
                        chat={item}
                        onPress={() => {
                            router.push({
                                pathname: `/chats/[id]`,
                                params: {
                                    id: item.id,
                                    user: JSON.stringify(item),
                                },
                            });
                        }}
                    />
                )}
                keyExtractor={(item) => item.id}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.text}
                    />
                }
            />
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
            <Input
                placeholder="Search chats..."
                onChangeText={setSearchText}
                value={searchText}
            />
        </View>
    );
}

const makeStyles = (theme: Theme) =>
    StyleSheet.create({
        container: {
            padding: 16,
            backgroundColor: theme.background,
        },
    });
