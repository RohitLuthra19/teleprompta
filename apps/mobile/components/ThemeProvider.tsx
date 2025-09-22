import React from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { GluestackUIProvider } from "./ui/gluestack-ui-provider";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SafeAreaProvider>
      <GluestackUIProvider>
        <SafeAreaView style={{ flex: 1 }}>{children}</SafeAreaView>
      </GluestackUIProvider>
    </SafeAreaProvider>
  );
};
