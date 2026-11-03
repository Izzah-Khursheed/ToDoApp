import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { palette } from '@/constants/palette';

export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: palette.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Little List' }} />
      </Stack>
    </ThemeProvider>
  );
}
