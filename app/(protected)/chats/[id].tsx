import { useTheme } from "@/lib/theme/context";
import { Chat } from "@/types/chats";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowUp, ChevronLeft } from "lucide-react-native";
import { useRef, useState } from "react";
import {
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

const messages = [
    {
        id: "1",
        text: "Hey, how are you?",
        createdAt: "2024-06-01T12:00:00Z",
        senderId: "1",
    },
    {
        id: "2",
        text: "I'm good, thanks! How about you?",
        createdAt: "2024-06-01T12:01:00Z",
        senderId: "2",
    },
    {
        id: "3",
        text: "Doing well! Just working on a project.",
        createdAt: "2024-06-01T12:02:00Z",
        senderId: "1",
    },
];

export default function ChatsScreen() {
    const { _id, user: userRaw } = useLocalSearchParams<{ _id: string; user: string }>();
    const user = JSON.parse(userRaw) as Chat;
    const [message, setMessage] = useState("");
    const scrollRef = useRef<ScrollView>(null);

    const { theme } = useTheme();
    const insets = useSafeAreaInsets();

    const sendMessage = () => {
        alert("Message sent: " + message);
        setMessage("");
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: theme.background }}
            behavior="padding"
            keyboardVerticalOffset={Platform.OS === "ios" ? insets.bottom : 25}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                            source={{ uri: user.image }}
                            placeholder={
                                "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj["
                            }
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
                    <View
                        style={{
                            flex: 1,
                            paddingTop: 12,
                        }}
                    >
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
                                <Message
                                    key={msg.id}
                                    text={msg.text}
                                    isOwn={msg.senderId === "1"}
                                />
                            ))}
                        </ScrollView>
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
                            placeholder="Type a message..."
                            placeholderTextColor={theme.base + "66"}
                            multiline
                            value={message}
                            onChangeText={(text) => {
                                setMessage(text);
                            }}
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
                                backgroundColor: theme.primary,
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                            onPress={() => {
                                sendMessage();
                            }}
                        >
                            <ArrowUp color={theme.white} size={18} />
                        </Pressable>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

interface IMessageProps {
    text: string;
    isOwn?: boolean;
}

function Message({ text, isOwn }: IMessageProps) {
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
