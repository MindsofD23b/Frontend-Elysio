import { createT } from "@/i18n";
import { useTheme } from "@/lib/theme/context";
import { router, Stack } from "expo-router";
import {
    Armchair,
    Bike,
    BookOpen,
    ChefHat,
    ChevronLeft,
    Clapperboard,
    Compass,
    Dumbbell,
    Gamepad2,
    Globe,
    Heart,
    LucideIcon,
    Moon,
    Music,
    Plane,
    ShoppingBag,
    Sparkles,
    Sun,
    Trophy,
    Utensils,
    Waves,
} from "lucide-react-native";
import { useState } from "react";
import {
    Dimensions,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import {
    CategoryGridCard,
    DateIdea,
    DateIdeaList,
} from "@/components/favorites/CategoryCard";

const t = createT("favorites");

const { width } = Dimensions.get("window");
const H_PAD = 16;
const COL_GAP = 10;
const CARD_SIZE = (width - H_PAD * 2 - COL_GAP * 2) / 3;

type Category = {
    label: string;
    icon: LucideIcon;
    ideas: DateIdea[];
};

// took ideas from Claude.ai and ChatGPT
const CATEGORIES: Category[] = [
    {
        label: "Travel",
        icon: Plane,
        ideas: [
            {
                title: "Weekend in Bern",
                desc: "Old town stroll and fondue dinner.",
                price: "CHF 180",
                duration: "2 days",
            },
            {
                title: "Lake Geneva Escape",
                desc: "Boat rides and lakeside dining.",
                price: "CHF 250",
                duration: "3 days",
            },
            {
                title: "Lucerne Day Trip",
                desc: "Chapel Bridge and mountain views.",
                price: "CHF 80",
                duration: "1 day",
            },
            {
                title: "Zermatt & Matterhorn",
                desc: "Cable car up to glacier paradise.",
                price: "CHF 400",
                duration: "2 days",
            },
            {
                title: "Ticino Villages",
                desc: "Italian-Swiss charm and wine.",
                price: "CHF 200",
                duration: "2 days",
            },
        ],
    },
    {
        label: "Active",
        icon: Dumbbell,
        ideas: [
            {
                title: "Rock Climbing Gym",
                desc: "Challenge each other on the walls.",
                price: "CHF 30",
                duration: "2 hrs",
            },
            {
                title: "Morning Hike",
                desc: "Sunrise hike with a packed breakfast.",
                price: "Free",
                duration: "3 hrs",
            },
            {
                title: "Kayaking Trip",
                desc: "Paddle through scenic Swiss waterways.",
                price: "CHF 55",
                duration: "2.5 hrs",
            },
            {
                title: "Tennis Match",
                desc: "A fun competitive court session.",
                price: "CHF 20",
                duration: "1.5 hrs",
            },
            {
                title: "Outdoor Yoga",
                desc: "Guided yoga session in the park.",
                price: "CHF 15",
                duration: "1.5 hrs",
            },
        ],
    },
    {
        label: "Chill",
        icon: Armchair,
        ideas: [
            {
                title: "Board Game Café",
                desc: "Pick from 200+ games over coffee.",
                price: "CHF 25",
                duration: "3 hrs",
            },
            {
                title: "Bookshop Date",
                desc: "Pick a book for each other.",
                price: "CHF 30",
                duration: "2 hrs",
            },
            {
                title: "Hammock Afternoon",
                desc: "Lazy park afternoon with snacks.",
                price: "Free",
                duration: "2 hrs",
            },
            {
                title: "Home Spa Day",
                desc: "Face masks, bath bombs, relaxation.",
                price: "CHF 20",
                duration: "3 hrs",
            },
            {
                title: "Puzzle Night",
                desc: "1000-piece puzzle and hot cocoa.",
                price: "CHF 15",
                duration: "2 hrs",
            },
        ],
    },
    {
        label: "Romantic",
        icon: Heart,
        ideas: [
            {
                title: "Candlelit Dinner",
                desc: "Fine dining at a rooftop restaurant.",
                price: "CHF 120",
                duration: "2 hrs",
            },
            {
                title: "Sunset Picnic",
                desc: "Blanket, wine, cheese, and a view.",
                price: "CHF 35",
                duration: "2 hrs",
            },
            {
                title: "Stargazing Night",
                desc: "Drive out of the city and watch stars.",
                price: "Free",
                duration: "2 hrs",
            },
            {
                title: "Couples Massage",
                desc: "Relax together at a spa.",
                price: "CHF 140",
                duration: "1.5 hrs",
            },
            {
                title: "Love Letter Scavenger",
                desc: "Leave clues around your city.",
                price: "Free",
                duration: "Half day",
            },
        ],
    },
    {
        label: "Foodie",
        icon: Utensils,
        ideas: [
            {
                title: "Street Food Tour",
                desc: "Hit the best food stands in town.",
                price: "CHF 45",
                duration: "2.5 hrs",
            },
            {
                title: "Sushi Making Class",
                desc: "Roll your own sushi together.",
                price: "CHF 75",
                duration: "2 hrs",
            },
            {
                title: "Farmers Market Brunch",
                desc: "Fresh produce and outdoor eating.",
                price: "CHF 30",
                duration: "2 hrs",
            },
            {
                title: "Wine Tasting",
                desc: "4-course pairing at a local vineyard.",
                price: "CHF 70",
                duration: "2 hrs",
            },
            {
                title: "Dessert Crawl",
                desc: "Hit 4 dessert spots in one evening.",
                price: "CHF 40",
                duration: "2 hrs",
            },
        ],
    },
    {
        label: "Outdoor",
        icon: Globe,
        ideas: [
            {
                title: "Forest Picnic",
                desc: "Deep in the woods with a fire.",
                price: "CHF 20",
                duration: "3 hrs",
            },
            {
                title: "Wildflower Walk",
                desc: "Spring walk through blooming fields.",
                price: "Free",
                duration: "2 hrs",
            },
            {
                title: "Camping Weekend",
                desc: "Tent, campfire, and the night sky.",
                price: "CHF 60",
                duration: "2 days",
            },
            {
                title: "Botanical Garden",
                desc: "Wander through rare plant collections.",
                price: "CHF 15",
                duration: "2 hrs",
            },
            {
                title: "River Fishing",
                desc: "Catch and release on a calm river.",
                price: "CHF 30",
                duration: "3 hrs",
            },
        ],
    },
    {
        label: "Arts",
        icon: Sparkles,
        ideas: [
            {
                title: "Paint & Sip",
                desc: "Guided painting session with wine.",
                price: "CHF 50",
                duration: "2 hrs",
            },
            {
                title: "Museum After Dark",
                desc: "Evening exhibit with cocktails.",
                price: "CHF 35",
                duration: "2 hrs",
            },
            {
                title: "Pottery Class",
                desc: "Throw clay together.",
                price: "CHF 60",
                duration: "2 hrs",
            },
            {
                title: "Street Art Walk",
                desc: "Guided mural tour downtown.",
                price: "Free",
                duration: "2 hrs",
            },
            {
                title: "Life Drawing Class",
                desc: "Sketch together at an art studio.",
                price: "CHF 25",
                duration: "2 hrs",
            },
        ],
    },
    {
        label: "Music",
        icon: Music,
        ideas: [
            {
                title: "Jazz Bar Night",
                desc: "Live jazz and craft cocktails.",
                price: "CHF 45",
                duration: "2.5 hrs",
            },
            {
                title: "Open Mic Evening",
                desc: "Support local artists together.",
                price: "CHF 15",
                duration: "2 hrs",
            },
            {
                title: "Vinyl Record Shopping",
                desc: "Dig through crates at a record store.",
                price: "CHF 35",
                duration: "1.5 hrs",
            },
            {
                title: "Karaoke Night",
                desc: "Private karaoke booth for two.",
                price: "CHF 40",
                duration: "2 hrs",
            },
            {
                title: "Open-Air Concert",
                desc: "Classical music in the park.",
                price: "CHF 20",
                duration: "2.5 hrs",
            },
        ],
    },
    {
        label: "Cinema",
        icon: Clapperboard,
        ideas: [
            {
                title: "Drive-In Movie",
                desc: "Classic films from your car.",
                price: "CHF 30",
                duration: "2.5 hrs",
            },
            {
                title: "Indie Film Night",
                desc: "Arthouse cinema with discussion after.",
                price: "CHF 22",
                duration: "2.5 hrs",
            },
            {
                title: "Home Cinema Setup",
                desc: "Projector, popcorn, and blankets.",
                price: "CHF 15",
                duration: "2 hrs",
            },
            {
                title: "Film Festival",
                desc: "Local short film festival evening.",
                price: "CHF 12",
                duration: "3 hrs",
            },
            {
                title: "Silent Film + Piano",
                desc: "Live pianist accompanies old films.",
                price: "CHF 35",
                duration: "2 hrs",
            },
        ],
    },
    {
        label: "Gaming",
        icon: Gamepad2,
        ideas: [
            {
                title: "Arcade Bar",
                desc: "Retro machines and local craft beer.",
                price: "CHF 35",
                duration: "2 hrs",
            },
            {
                title: "VR Experience",
                desc: "Immersive VR adventures for two.",
                price: "CHF 55",
                duration: "1.5 hrs",
            },
            {
                title: "Escape Room",
                desc: "60 min to solve the mystery together.",
                price: "CHF 50",
                duration: "1 hr",
            },
            {
                title: "Tabletop RPG Night",
                desc: "Build a story together.",
                price: "CHF 20",
                duration: "3 hrs",
            },
            {
                title: "Gaming Café",
                desc: "Console and PC gaming lounge.",
                price: "CHF 25",
                duration: "2 hrs",
            },
        ],
    },
    {
        label: "Night Out",
        icon: Moon,
        ideas: [
            {
                title: "Rooftop Bar Crawl",
                desc: "3 rooftop bars across the city.",
                price: "CHF 70",
                duration: "3 hrs",
            },
            {
                title: "Salsa Dancing",
                desc: "Beginner class then club dancing.",
                price: "CHF 35",
                duration: "3 hrs",
            },
            {
                title: "Cocktail Masterclass",
                desc: "Learn to mix 5 signature cocktails.",
                price: "CHF 60",
                duration: "2 hrs",
            },
            {
                title: "Casino Night",
                desc: "Roulette, poker, and dressed up.",
                price: "CHF 60",
                duration: "3 hrs",
            },
            {
                title: "Night Market",
                desc: "Street food and live music outside.",
                price: "CHF 25",
                duration: "2 hrs",
            },
        ],
    },
    {
        label: "Wellness",
        icon: Waves,
        ideas: [
            {
                title: "Sound Bath Session",
                desc: "Healing vibrations and meditation.",
                price: "CHF 40",
                duration: "1 hr",
            },
            {
                title: "Infrared Sauna",
                desc: "Detox session for two.",
                price: "CHF 55",
                duration: "1 hr",
            },
            {
                title: "Meditation Walk",
                desc: "Guided walk through nature.",
                price: "Free",
                duration: "1.5 hrs",
            },
            {
                title: "Couple Acupressure",
                desc: "Learn pressure point massage.",
                price: "CHF 45",
                duration: "1.5 hrs",
            },
            {
                title: "Cold Plunge + Sauna",
                desc: "Nordic wellness contrast therapy.",
                price: "CHF 65",
                duration: "2 hrs",
            },
        ],
    },
    {
        label: "Adventure",
        icon: Compass,
        ideas: [
            {
                title: "Paragliding",
                desc: "Tandem flight over the valley.",
                price: "CHF 140",
                duration: "1 hr",
            },
            {
                title: "Bungee Jumping",
                desc: "Take the leap together.",
                price: "CHF 100",
                duration: "1 hr",
            },
            {
                title: "Quad Biking",
                desc: "Off-road trail through the mountains.",
                price: "CHF 80",
                duration: "2 hrs",
            },
            {
                title: "Zip-lining",
                desc: "Forest canopy adventure.",
                price: "CHF 60",
                duration: "1.5 hrs",
            },
            {
                title: "White Water Rafting",
                desc: "Grade 3 rapids with a guide.",
                price: "CHF 90",
                duration: "2.5 hrs",
            },
        ],
    },
    {
        label: "Beach",
        icon: Sun,
        ideas: [
            {
                title: "Sunrise Swim",
                desc: "Early dip and beach breakfast.",
                price: "Free",
                duration: "2 hrs",
            },
            {
                title: "Paddleboard Yoga",
                desc: "Balance yoga on the water.",
                price: "CHF 50",
                duration: "1.5 hrs",
            },
            {
                title: "Snorkelling Trip",
                desc: "Explore reefs with a guide.",
                price: "CHF 65",
                duration: "2.5 hrs",
            },
            {
                title: "Beach Volleyball",
                desc: "Casual game and swim after.",
                price: "Free",
                duration: "2 hrs",
            },
            {
                title: "Cliff Jumping",
                desc: "Safe cliff spots with a guide.",
                price: "CHF 20",
                duration: "2 hrs",
            },
        ],
    },
    {
        label: "Culture",
        icon: BookOpen,
        ideas: [
            {
                title: "Historical Walking Tour",
                desc: "Guided tour of the old town.",
                price: "CHF 22",
                duration: "2 hrs",
            },
            {
                title: "Local Theatre Show",
                desc: "Evening play at a city theatre.",
                price: "CHF 45",
                duration: "2.5 hrs",
            },
            {
                title: "Opera Night",
                desc: "Classical opera in a grand hall.",
                price: "CHF 80",
                duration: "2.5 hrs",
            },
            {
                title: "Cultural Food Night",
                desc: "Cook dishes from another culture.",
                price: "CHF 35",
                duration: "2 hrs",
            },
            {
                title: "Museum Scavenger Hunt",
                desc: "Custom clues through the exhibits.",
                price: "CHF 18",
                duration: "2 hrs",
            },
        ],
    },
    {
        label: "Sports",
        icon: Trophy,
        ideas: [
            {
                title: "Live Football Match",
                desc: "Cheer on the local team.",
                price: "CHF 45",
                duration: "2.5 hrs",
            },
            {
                title: "Ice Skating",
                desc: "Rink session with hot chocolate.",
                price: "CHF 25",
                duration: "1.5 hrs",
            },
            {
                title: "Mini Golf",
                desc: "18 holes of competitive fun.",
                price: "CHF 20",
                duration: "1.5 hrs",
            },
            {
                title: "Bowling Night",
                desc: "Classic lanes and nachos.",
                price: "CHF 35",
                duration: "2 hrs",
            },
            {
                title: "Go-Karting",
                desc: "Race each other on a pro track.",
                price: "CHF 60",
                duration: "1 hr",
            },
        ],
    },
    {
        label: "Shopping",
        icon: ShoppingBag,
        ideas: [
            {
                title: "Vintage Market",
                desc: "Hunt for hidden gems together.",
                price: "CHF 30",
                duration: "2 hrs",
            },
            {
                title: "Design District Walk",
                desc: "Browse independent boutiques.",
                price: "Free",
                duration: "2 hrs",
            },
            {
                title: "Antique Fair",
                desc: "Find something old and beautiful.",
                price: "CHF 20",
                duration: "2 hrs",
            },
            {
                title: "Thrift Store Challenge",
                desc: "CHF 10 each, best outfit wins.",
                price: "CHF 10",
                duration: "1.5 hrs",
            },
            {
                title: "Art Print Shopping",
                desc: "Pick a print for your home together.",
                price: "CHF 45",
                duration: "1.5 hrs",
            },
        ],
    },
    {
        label: "Cooking",
        icon: ChefHat,
        ideas: [
            {
                title: "Ramen from Scratch",
                desc: "Full ramen broth and noodle day.",
                price: "CHF 35",
                duration: "3 hrs",
            },
            {
                title: "Sushi Rolling Night",
                desc: "Rice, fish, and chopstick skills.",
                price: "CHF 45",
                duration: "2 hrs",
            },
            {
                title: "Pastry Baking Class",
                desc: "Croissants, macarons, and éclairs.",
                price: "CHF 65",
                duration: "2.5 hrs",
            },
            {
                title: "BBQ Masterclass",
                desc: "Fire up the grill and go all out.",
                price: "CHF 55",
                duration: "3 hrs",
            },
            {
                title: "Taco Night",
                desc: "Homemade tortillas and all toppings.",
                price: "CHF 25",
                duration: "1.5 hrs",
            },
        ],
    },
    {
        label: "Cycling",
        icon: Bike,
        ideas: [
            {
                title: "River Trail Ride",
                desc: "Cycle along the Rhine or Aare.",
                price: "CHF 20",
                duration: "2.5 hrs",
            },
            {
                title: "E-Bike Tour",
                desc: "Guided e-bike through the hills.",
                price: "CHF 75",
                duration: "3 hrs",
            },
            {
                title: "Vineyard Cycling",
                desc: "Ride between wineries in Lavaux.",
                price: "CHF 30",
                duration: "3 hrs",
            },
            {
                title: "Mountain Bike Trail",
                desc: "Technical singletrack for two.",
                price: "CHF 25",
                duration: "2 hrs",
            },
            {
                title: "City Bike Brunch",
                desc: "Cycle to a hidden brunch spot.",
                price: "CHF 35",
                duration: "2 hrs",
            },
        ],
    },
];

export default function AllCategories() {
    const { theme } = useTheme();
    const s = makeStyles(theme);
    const [selected, setSelected] = useState<Category | null>(null);

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={s.root}>
                <View style={s.header}>
                    <Pressable onPress={() => router.back()} style={s.backBtn}>
                        <ChevronLeft size={28} color={theme.text} strokeWidth={2.5} />
                    </Pressable>
                    <Text style={[s.headerTitle, { color: theme.text }]}>
                        {t("categories")}
                    </Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView
                    contentContainerStyle={s.grid}
                    showsVerticalScrollIndicator={false}
                >
                    {CATEGORIES.map((cat) => (
                        <View key={cat.label} style={{ width: CARD_SIZE }}>
                            <CategoryGridCard
                                label={cat.label}
                                icon={cat.icon}
                                ideas={cat.ideas}
                                onPress={() => setSelected(cat)}
                            />
                        </View>
                    ))}
                </ScrollView>

                <Modal
                    visible={!!selected}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setSelected(null)}
                >
                    <View style={s.overlay}>
                        <Pressable style={s.backdrop} onPress={() => setSelected(null)} />
                        <View style={[s.sheet, { backgroundColor: theme.background }]}>
                            <View
                                style={[s.handle, { backgroundColor: theme.text + "30" }]}
                            />

                            <View style={s.sheetHeader}>
                                {selected && (
                                    <selected.icon
                                        size={22}
                                        color={theme.primary}
                                        strokeWidth={2.5}
                                    />
                                )}
                                <Text style={[s.sheetTitle, { color: theme.text }]}>
                                    {selected?.label} Ideas
                                </Text>
                                <Pressable
                                    onPress={() => setSelected(null)}
                                    style={[
                                        s.closeBtn,
                                        { backgroundColor: theme.text + "12" },
                                    ]}
                                >
                                    <Text style={[s.closeX, { color: theme.text }]}>
                                        ✕
                                    </Text>
                                </Pressable>
                            </View>

                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ paddingBottom: 30 }}
                            >
                                {selected && <DateIdeaList ideas={selected.ideas} />}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
            </View>
        </>
    );
}

const makeStyles = (theme: any) =>
    StyleSheet.create({
        root: {
            flex: 1,
            backgroundColor: theme.rootBg ?? theme.background,
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: H_PAD,
            paddingTop: 56,
            paddingBottom: 14,
        },
        backBtn: { width: 44 },
        headerTitle: { fontSize: 22, fontWeight: "900", letterSpacing: -0.5 },
        grid: {
            flexDirection: "row",
            flexWrap: "wrap",
            paddingHorizontal: H_PAD,
            gap: COL_GAP,
            paddingBottom: 30,
        },
        overlay: { flex: 1, justifyContent: "flex-end" },
        backdrop: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "rgba(0,0,0,0.45)",
        },
        sheet: {
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            padding: 20,
            paddingTop: 12,
            maxHeight: "85%",
        },
        handle: {
            width: 40,
            height: 4,
            borderRadius: 2,
            alignSelf: "center",
            marginBottom: 14,
        },
        sheetHeader: {
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
        },
        sheetTitle: { fontSize: 20, fontWeight: "800", flex: 1 },
        closeBtn: {
            width: 32,
            height: 32,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
        },
        closeX: { fontSize: 14, fontWeight: "700" },
    });
