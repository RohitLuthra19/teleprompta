import { Stack } from "expo-router";
import { ThemeProvider } from "@/components/ThemeProvider";
import "@/global.css";

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
          name="[script]"
          options={{
            title: "Teleprompter",
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
