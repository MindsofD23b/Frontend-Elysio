import BackWrapper from '@/components/backwrapper';
import { useTheme } from '@/app/theme/context';
import { BtnText, Button } from '@/components/button';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Mars, Venus } from 'lucide-react-native';

export default function Gender() {
  const { gs, theme } = useTheme();
  const [selected, setSelected] = useState<'male' | 'female' | null>(null);

  const PINK = '#EC136A';
  const PINK_LIGHT = 'rgba(236,19,106,0.05)';
  const GREY_DARK = 'rgba(0,0,0,0.5)';
  const GREY_LIGHT = 'rgba(0,0,0,0.05)';

  const cardStyle = (type: 'male' | 'female') => {
    const active = selected === type;
    return {
      borderColor: active ? PINK : GREY_DARK,
      backgroundColor: active ? PINK_LIGHT : GREY_LIGHT,
    };
  };

  const labelColor = (type: 'male' | 'female') =>
    selected === type ? PINK : GREY_DARK;

  return (
    <BackWrapper>
      <View style={styles.page}>
        {/* Title */}
        <Text style={[gs.h1, { marginTop: 10, color: theme.text }]}>
          Select your Gender
        </Text>

        {/* Subtitle */}
        <Text
          style={[gs.bodyText, { marginTop: 10, color: theme.text + '54' }]}
        >
          Please select <Text style={{ fontWeight: 'bold' }}>your Gender</Text>
        </Text>

        {/* Cards */}
        <View style={styles.cardsArea}>
          <Pressable
            style={[styles.card, cardStyle('male')]}
            onPress={() => setSelected('male')}
          >
            <Mars size={36} color={labelColor('male')} />
            <Text style={[styles.cardText, { color: labelColor('male') }]}>
              Male
            </Text>
          </Pressable>

          <Pressable
            style={[styles.card, cardStyle('female')]}
            onPress={() => setSelected('female')}
          >
            <Venus size={36} color={labelColor('female')} />
            <Text style={[styles.cardText, { color: labelColor('female') }]}>
              Female
            </Text>
          </Pressable>
        </View>

        {/* Button */}
        <Button
          style={{ marginTop: 'auto', marginBottom: 30 }}
          onPress={() => router.push('/auth/register/interests')}
        >
          <BtnText>Continue</BtnText>
        </Button>
      </View>
    </BackWrapper>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    paddingHorizontal: 24,
  },

  cardsArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    width: 200,
    height: 180,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },

  cardText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
