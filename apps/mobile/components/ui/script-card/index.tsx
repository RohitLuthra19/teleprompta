import React from "react";
import { View } from "react-native";
import { Button, ButtonText } from "@/components/ui/button";

interface ScriptCardProps {
  title: string;
  content: string;
  onPress: () => void;
}

export function ScriptCard({ title, content, onPress }: ScriptCardProps) {
  return (
    <Button
      variant="outline"
      action="primary"
      onPress={onPress}
      className="w-full p-4 mb-4"
    >
      <View className="w-full">
        <ButtonText className="text-lg font-bold mb-2">{title}</ButtonText>
        <ButtonText className="text-sm text-typography-600" numberOfLines={2}>
          {content}
        </ButtonText>
      </View>
    </Button>
  );
}
