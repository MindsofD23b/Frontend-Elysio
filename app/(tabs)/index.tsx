import {
    Dimensions,
    Image,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from "react-native";

const { width } = Dimensions.get("window");
const GAP = 12;
const PAD = 16;
const COL_W = (width - PAD * 2 - GAP) / 2;

const images = [
    // left column
    {
        col: "left",
        uri: "https://images.unsplash.com/photo-1520975958225-0f0b47b19904?auto=format&fit=crop&w=800&q=80",
        h: 150,
    },
    {
        col: "left",
        uri: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
        h: 220,
    },
    {
        col: "left",
        uri: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
        h: 160,
    },
    {
        col: "left",
        uri: "https://images.unsplash.com/photo-1520975682030-1fcb57c9a8b5?auto=format&fit=crop&w=800&q=80",
        h: 210,
    },

    // right column
    {
        col: "right",
        uri: "https://images.unsplash.com/photo-1520975682030-1fcb57c9a8b5?auto=format&fit=crop&w=800&q=80",
        h: 180,
    },
    {
        col: "right",
        uri: "https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?auto=format&fit=crop&w=800&q=80",
        h: 140,
    },
    {
        col: "right",
        uri: "https://images.unsplash.com/photo-1496307653780-42ee777d4833?auto=format&fit=crop&w=800&q=80",
        h: 240,
    },
    {
        col: "right",
        uri: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
        h: 120,
    },
];
function Tile({ uri, h }: { uri: string; h: number }) {
    return (
        <View style={[styles.tile, { height: h, width: COL_W }]}>
            <Image source={{ uri }} style={styles.tileImg} />
            <View />
        </View>
    );
}
export default function Index() {
    const left = images.filter((i) => i.col === "left");
    const right = images.filter((i) => i.col === "right");

    const onStart = () => {
        console.log("START pressed");
    };

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                {/* Grid */}
                <View style={styles.grid}>
                    <View style={styles.col}>
                        {left.map((img, idx) => (
                            <Tile key={`l-${idx}`} uri={img.uri} h={img.h} />
                        ))}
                    </View>

                    <View style={styles.col}>
                        {right.map((img, idx) => (
                            <Tile key={`r-${idx}`} uri={img.uri} h={img.h} />
                        ))}
                    </View>
                </View>

                <View style={styles.centerWrap} pointerEvents="box-none">
                    {/* Rings */}
                    <View style={[styles.ring, styles.ring1]} />
                    <View style={[styles.ring, styles.ring2]} />
                    <View style={[styles.ring, styles.ring3]} />

                    {/* Button */}
                    <Pressable onPress={onStart} style={styles.startBtn}>
                        <Text style={styles.startText}>START</Text>
                    </Pressable>
                </View>

                {/* Optional bottom “center indicator line” like in your screenshot */}
                <View style={styles.bottomIndicator} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#0b0f14" },
    container: { flex: 1, backgroundColor: "#0b0f14" },

    grid: {
        flexDirection: "row",
        paddingHorizontal: PAD,
        paddingTop: 14,
        gap: GAP,
    },
    col: {
        flex: 1,
        gap: GAP,
    },

    tile: {
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "#121a24",
    },
    tileImg: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    centerWrap: {
        position: "absolute",
        left: 0,
        right: 0,
        top: "42%",
        alignItems: "center",
        justifyContent: "center",
    },

    startBtn: {
        width: 150,
        height: 150,
        borderRadius: 999,
        backgroundColor: "#ff1f8f",
        alignItems: "center",
        justifyContent: "center",
        elevation: 6,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
    },
    startText: {
        fontSize: 26,
        fontWeight: "800",
        letterSpacing: 1,
        color: "#111",
    },

    ring: {
        position: "absolute",
        borderColor: "#ff1f8f",
        borderRadius: 999,
    },
    ring1: { width: 210, height: 210, borderWidth: 10, opacity: 1 },
    ring2: { width: 260, height: 260, borderWidth: 6, opacity: 0.9 },
    ring3: { width: 320, height: 320, borderWidth: 4, opacity: 0.75 },

    bottomIndicator: {
        position: "absolute",
        bottom: 8,
        left: "48%",
        width: 6,
        height: 18,
        borderRadius: 99,
        backgroundColor: "#ff1f8f",
        opacity: 0.9,
    },
});
