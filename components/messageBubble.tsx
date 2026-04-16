import { useTheme } from "@/lib/theme/context";
import { memo } from "react";
import { Text, View } from "react-native";

export const MessageBubble = memo(function MessageBubble({
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
});
