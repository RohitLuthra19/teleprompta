// apps/mobile/app/teleprompter/[script].tsx
import React, { useState, useRef, useEffect } from "react";
import { ScrollView, View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Button, ButtonText } from "@/components/ui/button";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import Slider from "@react-native-community/slider";
import { dummyScripts } from "./scripts";

export default function TeleprompterScreen() {
  const router = useRouter();

  // Get dynamic param from the route
  const { script } = useLocalSearchParams<{ script: string }>();
  const scriptId = parseInt(script, 10);
  const scriptContent =
    dummyScripts.find((s) => s.id === scriptId)?.content || "";

  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // pixels per frame
  const [fontSize, setFontSize] = useState(24);

  // Refs
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollY = useRef(0);
  const scrollInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start scrolling
  const startScrolling = () => {
    if (!scrollViewRef.current) return;
    setIsPlaying(true);

    scrollInterval.current = setInterval(() => {
      scrollY.current += speed;
      scrollViewRef.current?.scrollTo({
        y: scrollY.current,
        animated: false,
      });
    }, 16); // ~60fps
  };

  // Stop scrolling
  const stopScrolling = () => {
    setIsPlaying(false);
    if (scrollInterval.current) {
      clearInterval(scrollInterval.current);
      scrollInterval.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scrollInterval.current) clearInterval(scrollInterval.current);
    };
  }, []);

  return (
    <View className="flex-1 bg-background-100">
      {/* Script content */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-4"
        scrollEnabled={false}
        contentContainerStyle={{ paddingVertical: 40 }}
      >
        <Text
          style={{
            fontSize: fontSize,
            lineHeight: fontSize * 1.5,
            letterSpacing: 0.5,
            textAlign: "left",
            color: "#000000",
            paddingHorizontal: 16,
          }}
        >
          {scriptContent}
        </Text>
      </ScrollView>

      {/* Controls */}
      <Box className="p-4 bg-background-0 border-t border-outline-200">
        {/* Sliders */}
        <Box className="flex-row items-center justify-between mb-4">
          <Box className="flex-1 mr-4">
            <Text>Speed</Text>
            <Slider
              value={speed}
              onValueChange={setSpeed}
              minimumValue={0.5}
              maximumValue={5}
              step={0.5}
            />
          </Box>
          <Box className="flex-1">
            <Text>Font Size</Text>
            <Slider
              value={fontSize}
              onValueChange={setFontSize}
              minimumValue={16}
              maximumValue={48}
              step={2}
            />
          </Box>
        </Box>

        {/* Start/Stop + Back buttons */}
        <Box className="flex-row justify-between items-center">
          <Button
            size="lg"
            variant="solid"
            action={isPlaying ? "negative" : "positive"}
            onPress={isPlaying ? stopScrolling : startScrolling}
          >
            <ButtonText>{isPlaying ? "Stop" : "Start"} Teleprompter</ButtonText>
          </Button>

          <Button
            size="lg"
            variant="outline"
            action="primary"
            onPress={() => router.back()}
          >
            <ButtonText>Back</ButtonText>
          </Button>
        </Box>
      </Box>
    </View>
  );
}
