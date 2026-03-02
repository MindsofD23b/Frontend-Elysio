import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/app/theme/context';
import { StatusBar, useColorScheme } from 'react-native';

export default function SafeAreaWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useTheme();

  const barStyle =
    useColorScheme() === 'dark' ? 'light-content' : 'dark-content';

  return (
    <>
      <StatusBar barStyle={barStyle} />
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        {children}
      </SafeAreaView>
    </>
  );
}
