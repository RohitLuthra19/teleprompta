import { ThemeProvider } from "@/components/ThemeProvider";
import "@/global.css";
import { Stack } from "expo-router";

export default function RootLayout() {
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
    </ThemeProvider>
  );
}
