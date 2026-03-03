import { Tabs } from "expo-router";
import { Heart, HomeIcon, MessageCircle, PieChart, Settings } from "lucide-react-native";
import { Platform } from "react-native";
import { useTheme } from "../theme/context";

export default function TabLayout() {
    const { theme } = useTheme();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: theme.primary,
                tabBarInactiveTintColor: theme.text,
                tabBarShowLabel: false,
                tabBarStyle: {
                    backgroundColor: theme.background,
                    borderTopWidth: 0,
                    height: Platform.OS === "ios" ? 88 : 65,
                    paddingBottom: Platform.OS === "ios" ? 34 : 12,
                    paddingTop: 12,
                    elevation: 0,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: -1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                },
                tabBarItemStyle: {
                    paddingVertical: 8,
                },
            }}
        >
            <Tabs.Screen
                name="favorites"
                options={{
                    title: "Favorites",
                    headerShown: false,
                    tabBarIcon: ({ color, focused }) => (
                        <Heart size={26} color={color} strokeWidth={focused ? 2 : 1.5} />
                    ),
                }}
            />
            <Tabs.Screen
                name="stats"
                options={{
                    title: "Stats",
                    headerShown: false,
                    tabBarIcon: ({ color, focused }) => (
                        <PieChart
                            size={26}
                            color={color}
                            strokeWidth={focused ? 2 : 1.5}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    headerShown: false,
                    tabBarIcon: ({ color, focused }) => (
                        <HomeIcon
                            size={26}
                            color={color}
                            strokeWidth={focused ? 2 : 1.5}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="chat"
                options={{
                    title: "Chat",
                    headerShown: false,
                    tabBarIcon: ({ color, focused }) => (
                        <MessageCircle
                            size={26}
                            color={color}
                            strokeWidth={focused ? 2 : 1.5}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: "Settings",
                    headerShown: false,
                    tabBarIcon: ({ color, focused }) => (
                        <Settings
                            size={26}
                            color={color}
                            strokeWidth={focused ? 2 : 1.5}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}
