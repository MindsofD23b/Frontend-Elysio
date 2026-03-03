import BackWrapper from '@/components/backwrapper';
import { BtnText, Button } from '@/components/button';
import { useTheme } from '@/app/theme/context';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  Camera,
  ChefHat,
  Coffee,
  Dumbbell,
  Film,
  Music,
  Pencil,
  BookOpen,
  Mountain,
  Snowflake,
  Waves,
  ChessKnight,
} from 'lucide-react-native';
import { Theme } from '@/app/theme/theme';

type InterestItem = {
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
};

const MIN = 6;
const MAX = 12;

const INTERESTS: InterestItem[] = [
  { label: 'Movie', icon: Film },
  { label: 'Swimming', icon: Waves },
  { label: 'Ski', icon: Snowflake },
  { label: 'Gym', icon: Dumbbell },
  { label: 'Reading', icon: BookOpen },
  { label: 'Cooking', icon: ChefHat },
  { label: 'Photography', icon: Camera },
  { label: 'Hiking', icon: Mountain },
  { label: 'Coffee', icon: Coffee },
  { label: 'Art', icon: Pencil },
  { label: 'Music', icon: Music },
  { label: 'Chess', icon: ChessKnight },
];

export default function Interests() {
  const { theme, gs } = useTheme();
  const styles = makeStyles(theme);

  const PINK = theme.primary;
  const BORDER = theme.accent + '4D';

  const [selected, setSelected] = useState<string[]>([]);
  const [customText, setCustomText] = useState('');
  const [customInterests, setCustomInterests] = useState<string[]>([]);
  const [errorOpen, setErrorOpen] = useState(false);

  const canContinue = selected.length >= MIN && selected.length <= MAX;

  const toggleInterest = (label: string) => {
    setSelected((prev) => {
      const exists = prev.includes(label);
      if (exists) return prev.filter((x) => x !== label);
      if (prev.length >= MAX) {
        setErrorOpen(true);
        return prev;
      }
      return [...prev, label];
    });
  };

  const removeCustom = (label: string) => {
    setSelected((prev) => prev.filter((x) => x !== label));
    setCustomInterests((prev) => prev.filter((x) => x !== label));
  };

  const addCustom = () => {
    const raw = customText.trim();
    if (!raw) return;
    if (!/^[A-Za-z]{1,16}$/.test(raw)) return;

    const label = raw[0].toUpperCase() + raw.slice(1).toLowerCase();

    const existsAnywhere =
      INTERESTS.some((i) => i.label.toLowerCase() === label.toLowerCase()) ||
      customInterests.some((x) => x.toLowerCase() === label.toLowerCase());

    if (!existsAnywhere) setCustomInterests((prev) => [label, ...prev]);

    setCustomText('');
    Keyboard.dismiss();
    toggleInterest(label);
  };

  const gridItems = useMemo(() => {
    return [
      ...INTERESTS.map((i) => ({
        kind: 'default' as const,
        label: i.label,
        icon: i.icon,
      })),
      ...customInterests.map((label) => ({ kind: 'custom' as const, label })),
    ];
  }, [customInterests]);

  const onContinue = () => {
    if (!canContinue) {
      setErrorOpen(true);
      return;
    }
    router.push('/auth/register/password');
  };

  return (
    <BackWrapper>
      <View style={styles.page}>
        <Text style={[gs.h1, { marginTop: 10, color: theme.text }]}>
          Select your Interest
        </Text>

        <Text
          style={[gs.bodyText, { marginTop: 10, color: theme.text + '54' }]}
        >
          Pick 6 interests to match with users who have similar things in common
        </Text>

        <View style={styles.grid}>
          <View
            style={[
              styles.chip,
              styles.addChip,
              { borderColor: BORDER, backgroundColor: theme.background },
            ]}
          >
            <TextInput
              value={customText}
              onChangeText={(t) =>
                setCustomText(t.replace(/[^A-Za-z]/g, '').slice(0, 16))
              }
              placeholder="Add"
              placeholderTextColor={theme.text + '66'}
              style={[styles.addInput, { color: theme.text }]}
              maxLength={16}
              returnKeyType="done"
              onSubmitEditing={addCustom}
            />
            <Pressable
              onPress={addCustom}
              style={[styles.addBtn, { borderColor: BORDER }]}
            >
              <Text style={{ color: theme.text, fontWeight: '800' }}>+</Text>
            </Pressable>
          </View>

          {gridItems.map((item) => {
            const active = selected.includes(item.label);

            if (item.kind === 'default') {
              const Icon = item.icon;
              return (
                <Pressable
                  key={item.label}
                  onPress={() => toggleInterest(item.label)}
                  style={[
                    styles.chip,
                    {
                      borderColor: active ? PINK : BORDER,
                      backgroundColor: active ? PINK : theme.background,
                    },
                  ]}
                >
                  <Icon size={16} color={active ? '#fff' : theme.text} />
                  <Text
                    style={[
                      styles.chipText,
                      { color: active ? '#fff' : theme.text },
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            }

            return (
              <Pressable
                key={`custom-${item.label}`}
                onPress={() => removeCustom(item.label)}
                style={[
                  styles.chip,
                  { borderColor: PINK, backgroundColor: PINK },
                ]}
              >
                <Text style={[styles.chipText, { color: '#fff' }]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Button
          style={{ marginTop: 'auto', marginBottom: 30 }}
          disabled={!canContinue}
          onPress={onContinue}
        >
          <BtnText>Continue</BtnText>
        </Button>

        {errorOpen ? (
          <Pressable
            style={styles.errorWrap}
            onPress={() => setErrorOpen(false)}
          >
            <View
              style={[styles.errorCard, { backgroundColor: theme.background }]}
            >
              <Text style={[styles.errorTitle, { color: theme.text }]}>
                Selection limit
              </Text>
              <Text style={[styles.errorText, { color: theme.text + 'B3' }]}>
                Please choose minimum {MIN} and maximum {MAX} interests.
              </Text>
              <Pressable
                style={[styles.errorOk, { backgroundColor: PINK }]}
                onPress={() => setErrorOpen(false)}
              >
                <Text style={styles.errorOkText}>OK</Text>
              </Pressable>
            </View>
          </Pressable>
        ) : null}
      </View>
    </BackWrapper>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    page: {
      flex: 1,
      width: '100%',
      height: '100%',
      paddingHorizontal: 24,
    },

    grid: {
      marginTop: 22,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },

    chip: {
      borderWidth: 1.5,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 8,
      minWidth: 78,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      justifyContent: 'center',
    },

    chipText: {
      fontSize: 14,
      fontWeight: '600',
    },

    addChip: {
      minWidth: 150,
      justifyContent: 'space-between',
      gap: 10,
    },

    addInput: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
    },

    addBtn: {
      width: 28,
      height: 28,
      borderRadius: 10,
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
    },

    errorWrap: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.35)',
      justifyContent: 'center',
      paddingHorizontal: 24,
    },

    errorCard: { borderRadius: 16, padding: 18 },
    errorTitle: { fontSize: 18, fontWeight: '800' },
    errorText: { marginTop: 8, fontSize: 14, lineHeight: 20 },
    errorOk: {
      marginTop: 14,
      alignSelf: 'flex-end',
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 10,
    },
    errorOkText: { color: '#fff', fontWeight: '800' },
  });
