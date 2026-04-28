import { Image } from "expo-image";
import { memo } from "react";
import { View, StyleSheet } from "react-native";
import { COL_W, H_SCALE } from "./homeConstants";

const PLACEHOLDER =
    "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

function TileImpl({ uri, h }: { uri: string; h: number }) {
    return (
        <View style={[styles.tile, { height: Math.round(h * H_SCALE), width: COL_W }]}>
            <Image
                source={{ uri }}
                style={styles.tileImg}
                placeholder={PLACEHOLDER}
                contentFit="cover"
                transition={0}
                cachePolicy="memory-disk"
                priority="high"
                recyclingKey={uri}
            />
        </View>
    );
}

export const Tile = memo(TileImpl);

const styles = StyleSheet.create({
    tile: {
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "#00000020",
    },
    tileImg: {
        width: "100%",
        height: "100%",
    },
});
