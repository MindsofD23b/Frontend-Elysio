import { Dimensions } from "react-native";

export const { width, height } = Dimensions.get("window");
export const H_SCALE = height / 800;
export const GAP = 28;
export const PAD = 16;
export const COL_W = (width - PAD * 2 - GAP) / 2;
