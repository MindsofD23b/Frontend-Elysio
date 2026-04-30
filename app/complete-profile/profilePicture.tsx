import { useTheme } from "@/lib/theme/context";
import BackWrapper from "@/components/backwrapper";
import { Pressable, Text } from "react-native";
import { Image } from "expo-image";
import { BtnText, Button } from "@/components/button";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useCompleteProfileStore } from "@/utils/completeProfileStore";

export default function CompleteProfilePicture() {
    const { gs, theme } = useTheme();
    const { data, setProfilePictureUri } = useCompleteProfileStore();

    const pickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            alert("Permission to access photos is required.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setProfilePictureUri(result.assets[0].uri);
        }
    };

    return (
        <BackWrapper>
            <Text style={[gs.h1, { marginTop: 35 }]}>Profile picture</Text>
            <Text style={[gs.bodyText, { marginTop: 10, color: theme.base + "54" }]}>
                A photo makes your profile{" "}
                <Text style={{ fontWeight: "bold" }}>3× more attractive</Text>.
            </Text>

            <Pressable
                onPress={pickImage}
                style={{ alignSelf: "center", marginVertical: 32 }}
            >
                <Image
                    source={
                        data.profilePictureUri
                            ? { uri: data.profilePictureUri }
                            : require("@/assets/blank-profile.png")
                    }
                    placeholder="|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj["
                    transition={1000}
                    style={{ width: 200, height: 200, borderRadius: 16 }}
                />
            </Pressable>

            <Button
                onPress={() => router.push("/complete-profile/terms")}
                style={{ marginTop: "auto" }}
            >
                <BtnText>{data.profilePictureUri ? "Continue" : "Skip for now"}</BtnText>
            </Button>
        </BackWrapper>
    );
}
