import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
// TODO: switch back to FlashList after development build
// import { FlashList } from "@shopify/flash-list";
import { useEffect, useState } from "react";
import { useTheme } from "@/lib/theme/context";
import { router } from "expo-router";
import { Chat } from "@/types/chats";
import ChatComponent from "@/components/ChatComponent";
import Input from "@/components/input";
import { Theme } from "@/lib/theme/theme";

const chats: Chat[] = [
    {
        id: "1",
        name: "John Doe",
        lastMessage: "Hey, how are you?",
        createdAt: "2024-06-01T12:00:00Z",
        updatedAt: "2024-06-01T12:00:00Z",
        image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
    },
    {
        id: "2",
        name: "Jane Smith",
        lastMessage: "See you later!",
        createdAt: "2024-06-01T12:00:00Z",
        updatedAt: new Date().toISOString(),
        image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
    },
    {
        id: "3",
        name: "Jane Smith",
        lastMessage: "See you later!",
        createdAt: "2024-06-01T12:00:00Z",
        updatedAt: new Date().toISOString(),
        image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
    },
    {
        id: "4",
        name: "Jane Smith",
        lastMessage: "See you later!",
        createdAt: "2024-06-01T12:00:00Z",
        updatedAt: new Date().toISOString(),
        image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
    },
    {
        id: "5",
        name: "Jane Smith",
        lastMessage: "See you later!",
        createdAt: "2024-06-01T12:00:00Z",
        updatedAt: new Date().toISOString(),
        image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
    },
    {
        id: "6",
        name: "Jane Smith",
        lastMessage: "See you later!",
        createdAt: "2024-06-01T12:00:00Z",
        updatedAt: new Date().toISOString(),
        image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
    },
    {
        id: "7",
        name: "John Doe",
        lastMessage: "Hey, how are you?",
        createdAt: "2024-06-01T12:00:00Z",
        updatedAt: "2024-06-01T12:00:00Z",
        image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
    },
    {
        id: "8",
        name: "John Doe",
        lastMessage: "Hey, how are you?",
        createdAt: "2024-06-01T12:00:00Z",
        updatedAt: "2024-06-01T12:00:00Z",
        image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
    },
    {
        id: "9",
        name: "John Doe",
        lastMessage: "Hey, how are you?",
        createdAt: "2024-06-01T12:00:00Z",
        updatedAt: "2024-06-01T12:00:00Z",
        image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
    },
];

export default function Index() {
    const { theme } = useTheme();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        setRefreshing(false);
    };

    useEffect(() => {
        orderChatsByUpdatedAt(chats);
    }, [chats]);

    const [filteredChats, setFilteredChats] = useState<Chat[]>(chats);

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

function orderChatsByUpdatedAt(chats: Chat[]) {
    return chats.sort(
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
    }, [searchText]);

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
