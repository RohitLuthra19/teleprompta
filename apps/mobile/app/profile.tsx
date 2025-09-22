import React from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { Button, ButtonText } from "@/components/ui/button";

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Welcome to my Expo app!</Text>
      <Button onPress={() => router.push("/")}>
        <ButtonText>Go to Home</ButtonText>
      </Button>
    </View>
  );
}
