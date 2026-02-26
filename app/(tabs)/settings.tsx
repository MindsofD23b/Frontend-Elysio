// app/(tabs)/settings.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>

        {/* Profile */}
        <View style={styles.profileWrap}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
            }}
            style={styles.avatar}
          />
          <Text style={styles.name}>Lara Gut</Text>
          <Text style={styles.email}>Lara.gut@example.com</Text>
        </View>

        {/* Menu */}
        <View style={styles.list}>
          <MenuRow icon="person-outline" label="Personal Details" />
          <MenuRow icon="heart-outline" label="Interests" />
          <MenuRow icon="globe-outline" label="Terms and Conditions" />
          <MenuRow icon="notifications-outline" label="Privacy & Policy" />
          <MenuRow icon="eye-outline" label="About us" />
        </View>

        {/* Mode Row */}
        <View style={styles.modeRow}>
          <View style={styles.modeItem}>
            <Ionicons
              name="sunny-outline"
              size={20}
              color="rgba(255,255,255,0.45)"
            />
            <Text style={styles.modeMuted}>Lightmode</Text>
          </View>

          <LinearGradient
            colors={['#FF63A1', '#EC136A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.modeItem}
          >
            <Ionicons name="moon-outline" size={20} color="#fff" />
            <Text style={styles.modeActive}>Darkmode</Text>
          </LinearGradient>
        </View>

        {/* Login Button */}
        <LinearGradient
          colors={['#FF63A1', '#EC136A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.loginBtn}
        >
          <Text style={styles.loginText}>Log In</Text>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}

function MenuRow({ icon, label }: { icon: any; label: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={20} color="rgba(255,255,255,0.9)" />
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    justifyContent: 'space-between',
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
  },

  profileWrap: {
    alignItems: 'center',
    marginTop: 10,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginTop: 6,
  },
  email: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },

  list: {
    marginTop: 10,
  },

  row: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowLabel: {
    fontSize: 16,
    color: '#fff',
  },

  modeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  modeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  modeMuted: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 14,
  },
  modeActive: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  loginBtn: {
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Platform.OS === 'ios' ? 10 : 20,
  },
  loginText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
});
