import React from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import { useTheme } from "@/app/theme/context";
import { Theme } from "@/app/theme/theme";
import { Ionicons } from "@expo/vector-icons";

type ChatItem = {
    id: string;
    user: string;
    text: string;
    createdDate: string;
    avatar: string;
};

export default function ChatScreen() {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    const chats: ChatItem[] = [
        {
            id: "1",
            user: "Ethan Clark",
            text: "Hey, are you free tonight?",
            createdDate: "2025-09-03T19:45:00",
            avatar: "https://i.pravatar.cc/200?img=12",
        },
        {
            id: "2",
            user: "Turner Colin",
            text: "yo bro what you doing",
            createdDate: "2025-09-03T21:10:00",
            avatar: "https://i.pravatar.cc/200?img=15",
        },
        {
            id: "3",
            user: "Peter Parker",
            text: "Sleep well 😴",
            createdDate: "2025-09-02T23:30:00",
            avatar: "https://i.pravatar.cc/200?img=18",
        },
    ];

    const sortedChats = [...chats].sort(
        (a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime(),
    );

    const formatChatDate = (dateString: string) => {
        const date = new Date(dateString);

        return date.toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.container}>
                <Text style={styles.title}>Chat</Text>

                <FlatList
                    data={sortedChats}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    ItemSeparatorComponent={() => <View style={styles.divider} />}
                    renderItem={({ item }) => (
                        <Pressable style={styles.row}>
                            <Image source={{ uri: item.avatar }} style={styles.avatar} />

                            <View style={styles.info}>
                                <Text style={styles.userName}>{item.user}</Text>

                                <Text
                                    style={[
                                        styles.messageText,
                                        { color: theme.primary }, // pink message
                                    ]}
                                    numberOfLines={1}
                                >
                                    {item.text}
                                </Text>

                                <Text style={styles.dateText}>
                                    {formatChatDate(item.createdDate)}
                                </Text>
                            </View>

                            <Ionicons
                                name="chatbubble-ellipses-outline"
                                size={22}
                                color={theme.text}
                            />
                        </Pressable>
                    )}
                />
            </View>
        </>
    );
}

const makeStyles = (theme: Theme) =>
    StyleSheet.create({
        container: {
            flex: 1,
            paddingTop: 24,
            backgroundColor: theme.background,
            paddingHorizontal: 16,
        },

        title: {
            fontSize: 28,
            fontWeight: "800",
            color: theme.text,
            marginTop: 15,
            marginBottom: 20,
            textAlign: "center",
        },

        listContent: {
            paddingBottom: 30,
        },

        row: {
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 12,
            gap: 10,
        },

        avatar: {
            width: 50,
            height: 50,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: theme.base + "20",
        },

        info: {
            flex: 1,
        },

        userName: {
            fontSize: 18,
            fontWeight: "800",
            color: theme.text,
        },

        messageText: {
            fontSize: 14,
            fontWeight: "600",
            marginTop: 2,
        },

        dateText: {
            fontSize: 11,
            marginTop: 4,
            color: theme.text + "80",
        },

        divider: {
            height: 1,
            backgroundColor: theme.base + "15",
        },
    });
