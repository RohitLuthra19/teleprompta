
import { apiFetch } from '@/components/api';
import { clearToken } from '@/components/auth';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { ScriptCard } from '@/components/ui/script-card';
import { Text } from '@/components/ui/text';
import { useAuthGate } from '@/components/useAuthGate';
import { useRouter } from 'expo-router';
import React from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';

type Script = {
  id: string;
  title: string;
  description: string;
  category?: string[];
  createdAt: string;
};

export default function Index() {
  const router = useRouter();
  const { isReady } = useAuthGate();
  const [loading, setLoading] = React.useState(false);
  const [scripts, setScripts] = React.useState<Script[]>([]);

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/api/v1/scripts', { auth: true });
      setScripts(data as Script[]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (isReady) load();
  }, [isReady, load]);

  if (!isReady) return null;

  return (
    <View className="flex-1 bg-background-100">
      <ScrollView
        className="flex-1 p-4"
        contentContainerStyle={{ gap: 12 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      >
        {scripts.map((s) => (
          <ScriptCard
            key={s.id}
            title={s.title}
            content={s.description}
            onPress={() =>
              router.push({
                pathname: "/[script]",
                params: { script: s.id },
              })
            }
          />
        ))}
        {scripts.length === 0 && !loading && (
          <Text className="text-center text-foreground-500">No scripts yet</Text>
        )}
      </ScrollView>

      <Box className="p-4 bg-background-0 border-t border-outline-200">
        <Button size="lg" variant="solid" action="primary" onPress={() => router.push('/add-script')}>
          <ButtonText>Add New Script</ButtonText>
        </Button>
        <View className="h-3" />
        <Button
          size="lg"
          variant="outline"
          action="secondary"
          onPress={async () => {
            await clearToken();
            router.replace('/(auth)/login');
          }}
        >
          <ButtonText>Logout</ButtonText>
        </Button>
      </Box>
    </View>
  );
}


