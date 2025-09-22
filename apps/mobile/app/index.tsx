import { Button, ButtonText } from "@/components/ui/button";
import { View } from "react-native";

export default function Index() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button size="md" variant={"solid"} action="secondary">
        <ButtonText>Click Me</ButtonText>
      </Button>
    </View>
  );
}
