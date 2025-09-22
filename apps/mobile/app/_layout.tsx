import { Stack } from "expo-router";
import { ThemeProvider } from "@/components/ThemeProvider";
import "@/global.css";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
