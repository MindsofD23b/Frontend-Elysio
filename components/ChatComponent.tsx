import { useTheme } from "@/lib/theme/context";
import { Theme } from "@/lib/theme/theme";
import { Chat } from "@/types/chats";
import { formatTime } from "@/utils/formatTime";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface ChatComponentProps {
    chat: Chat;
    onPress: () => void;
}

export default function ChatComponent({ chat, onPress }: ChatComponentProps) {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    return (
        <Pressable
            style={({ pressed }) => [
                styles.container,
                pressed && {
                    backgroundColor: theme.base + "1A",
                },
            ]}
            onPress={onPress}
        >
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 12,
                }}
            >
                <View>
                    <Image
                        source={{ uri: chat.image }}
                        style={{ width: 50, height: 50, borderRadius: 25 }}
                        placeholder={
                            "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj["
                        }
                        contentFit="cover"
                        transition={1000}
                    />
                </View>
                <View style={{ flex: 4, flexDirection: "column" }}>
                    <View
                        style={{ flexDirection: "row", justifyContent: "space-between" }}
                    >
                        <Text style={styles.title}>{chat.name}</Text>
                        <Text style={styles.time}>{formatTime(chat.updatedAt)}</Text>
                    </View>
                    <Text style={styles.message}>{chat.lastMessage}</Text>
                </View>
            </View>
        </Pressable>
    );
}

export const makeStyles = (theme: Theme) =>
    StyleSheet.create({
        container: {
            width: "100%",
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.base + "1A",
        },
        title: {
            fontSize: 16,
            fontWeight: "700",
        },
        time: {
            fontSize: 12,
            color: theme.text + "AF",
        },
        message: {
            fontSize: 14,
            color: theme.text + "AF",
        },
    });
