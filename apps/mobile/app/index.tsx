// apps/mobile/app/teleprompter/index.tsx
import React from "react";
import { View, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ScriptCard } from "@/components/ui/script-card";
import { Button, ButtonText } from "@/components/ui/button";
import { Box } from "@/components/ui/box";
import { dummyScripts } from "./scripts";

export default function Index() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-background-100">
      {/* Script list */}
      <ScrollView className="flex-1 p-4" contentContainerStyle={{ gap: 12 }}>
        {dummyScripts.map((script) => (
          <ScriptCard
            key={script.id}
            title={script.title}
            content={script.content}
            onPress={() =>
              router.push({
                pathname: "/[script]",
                params: { script: script.id }, // required
              })
            }
          />
        ))}
      </ScrollView>

      {/* Add new script button */}
      <Box className="p-4 bg-background-0 border-t border-outline-200">
        <Button
          size="lg"
          variant="solid"
          action="primary"
          onPress={() => router.push("/teleprompter/new")}
        >
          <ButtonText>Add New Script</ButtonText>
        </Button>
      </Box>
    </View>
  );
}
