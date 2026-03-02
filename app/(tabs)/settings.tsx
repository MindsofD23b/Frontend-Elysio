import { Ionicons } from "@expo/vector-icons";
import { BtnText, Button } from "@/components/button";
import React, { useContext } from "react";
import { Image, Platform, SafeAreaView, StyleSheet, Text, View } from "react-native";

import { ThemeContext } from "../theme/context";

export default function SettingsScreen() {
  const { theme } = useContext(ThemeContext)!;

  const mutedText = withAlpha(theme.text, 0.55);
  const divider = withAlpha(theme.text, 0.15);
  const iconColor = withAlpha(theme.text, 0.9);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>

        {/* Profile */}
        <View style={styles.profileWrap}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
            }}
            style={styles.avatar}
          />
          <Text style={[styles.name, { color: theme.text }]}>Lara Gut</Text>
          <Text style={[styles.email, { color: mutedText }]}>Lara.gut@example.com</Text>
        </View>

        {/* Menu */}
        <View style={styles.list}>
          <MenuRow
            divider={divider}
            iconColor={iconColor}
            textColor={theme.text}
            icon="person-outline"
            label="Personal Details"
          />
          <MenuRow
            divider={divider}
            iconColor={iconColor}
            textColor={theme.text}
            icon="heart-outline"
            label="Interests"
          />
          <MenuRow
            divider={divider}
            iconColor={iconColor}
            textColor={theme.text}
            icon="globe-outline"
            label="Terms and Conditions"
          />
          <MenuRow
            divider={divider}
            iconColor={iconColor}
            textColor={theme.text}
            icon="notifications-outline"
            label="Privacy & Policy"
          />
          <MenuRow
            divider={divider}
            iconColor={iconColor}
            textColor={theme.text}
            icon="eye-outline"
            label="About us"
          />
        </View>

        {/* Mode Row */}
        <View style={styles.modeRow}>
          <View style={styles.modeItem}>
            <Ionicons name="sunny-outline" size={20} color={mutedText} />
            <Text style={[styles.modeMuted, { color: mutedText }]}>Lightmode</Text>
          </View>

          <View style={styles.modeItem}>
            <Ionicons name="moon-outline" size={20} color={theme.primary} />
            <Text style={[styles.modeActive, { color: theme.primary }]}>Darkmode</Text>
          </View>
        </View>

        {/* LogOut Button */}
        <Button style={{ marginTop: "auto", marginBottom: 30 }} onPress={() => {}}>
          <BtnText>Log Out</BtnText>
        </Button>
      </View>
    </SafeAreaView>
  );
}

function MenuRow({
  icon,
  label,
  divider,
  iconColor,
  textColor,
}: {
  icon: any;
  label: string;
  divider: string;
  iconColor: string;
  textColor: string;
}) {
  return (
    <View style={[styles.row, { borderBottomColor: divider }]}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={20} color={iconColor} />
        <Text style={[styles.rowLabel, { color: textColor }]}>{label}</Text>
      </View>
    </View>
  );
}

function withAlpha(hex: string, alpha: number) {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return `rgba(255,255,255,${alpha})`;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    justifyContent: "space-between",
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
  },

  profileWrap: {
    alignItems: "center",
    marginTop: 10,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 6,
  },
  email: {
    fontSize: 13,
    marginTop: 2,
  },

  list: {
    marginTop: 10,
  },

  row: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: "600",
  },

  modeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  modeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  modeMuted: {
    fontSize: 14,
    fontWeight: "600",
  },
  modeActive: {
    fontSize: 14,
    fontWeight: "700",
  },

  buttonWrapper: {
    marginBottom: Platform.OS === "ios" ? 10 : 18,
  },
});
