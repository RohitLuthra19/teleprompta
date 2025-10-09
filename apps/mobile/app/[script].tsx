// apps/mobile/app/teleprompter/[script].tsx
import { apiFetch } from "@/components/api";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useAuthGate } from "@/components/useAuthGate";
import Slider from "@react-native-community/slider";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Platform, ScrollView, View } from "react-native";

type Script = {
  id: string;
  title: string;
  description: string;
  category?: string[];
  createdAt: string;
};

export default function TeleprompterScreen() {
  const router = useRouter();
  const { isReady } = useAuthGate();

  // Read id from route params (named "script" for back-compat)
  const { script } = useLocalSearchParams<{ script: string }>();

  const [loading, setLoading] = useState(false); // reserved for future loader UI
  const [data, setData] = useState<Script | null>(null);
  const content = data?.description || "";

  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // pixels per frame
  const [fontSize, setFontSize] = useState(48);

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

  // Load selected script from backend
  useEffect(() => {
    if (!isReady || !script) return;
    (async () => {
      try {
        setLoading(true);
        const result = await apiFetch(`/api/v1/scripts/${script}`, { auth: true });
        setData(result as Script);
      } catch (e) {
        console.error(e);
        // Authentication errors are now handled automatically in apiFetch
      } finally {
        setLoading(false);
      }
    })();
  }, [isReady, script]);

  if (!isReady) return null;
  if (loading || !data) {
    return (
      <View className="flex-1 bg-background-100">
        <Box className="p-4">
          <Text>Loading...</Text>
        </Box>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-100">
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-4"
        scrollEnabled={false}
        contentContainerStyle={{ paddingVertical: 40 }}
      >
        <Text
          style={{
            fontSize: fontSize,
            //lineHeight: fontSize * 1.5,
            lineHeight: Platform.select({
              web: 1.2,
              default: fontSize * 1.5,
            }),
            letterSpacing: 0.5,
            textAlign: "left",
            color: "#000000",
            paddingHorizontal: 16,
          }}
        >
          {content}
        </Text>
      </ScrollView>
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
              maximumValue={192}
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
            <ButtonText>{isPlaying ? "Stop" : "Start"}</ButtonText>
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
