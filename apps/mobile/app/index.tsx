import { Button, ButtonText } from "@/components/ui/button";
import { useRouter } from "expo-router";
import { View } from "react-native";

export default function Index() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button
        size="md"
        variant={"solid"}
        action="secondary"
        onPress={() => router.push("/profile")}
      >
        <ButtonText>Go to Profile</ButtonText>
      </Button>
    </View>
  );
}
