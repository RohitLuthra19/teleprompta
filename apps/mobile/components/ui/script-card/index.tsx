import React from "react";
import { View, Text, Pressable } from "react-native";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";

interface ScriptCardProps {
  title: string;
  content: string;
  onPress: () => void;
}

export function ScriptCard({ title, content, onPress }: ScriptCardProps) {
  return (
    <Pressable onPress={onPress}>
      <Card
        size="lg"
        variant="elevated"
        className="p-5 rounded-lg max-w-full m-3"
      >
        <View className="w-full">
          <Heading className="text-lg font-bold mb-2">{title}</Heading>
          <Text className="text-sm text-typography-600" numberOfLines={2}>
            {content}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}
