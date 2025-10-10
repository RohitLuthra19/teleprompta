import { ThemeProvider } from "@/components/ThemeProvider";
import "@/global.css";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

export default function RootLayout() {
  const [AnalyticsComponent, setAnalyticsComponent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    // Only load Vercel Analytics on web platform
    if (Platform.OS === 'web') {
      import('@vercel/analytics/react')
        .then(({ Analytics }) => {
          setAnalyticsComponent(() => Analytics);
        })
        .catch((err) => {
          console.log('Vercel Analytics failed to load', err);
        });
    }
  }, []);

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="index"
          options={{
            title: "Teleprompta",
          }}
        />
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="[script]"
          options={{
            title: "Teleprompter",
          }}
        />
      </Stack>
      {AnalyticsComponent && <AnalyticsComponent />}
    </ThemeProvider>
  );
}
