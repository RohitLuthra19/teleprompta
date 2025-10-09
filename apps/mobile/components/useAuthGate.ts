import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { getToken } from './auth';

export function useAuthGate() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (!token) {
        console.log('No token found, redirecting to login...');
        router.replace('/(auth)/login');
      } else {
        setIsReady(true);
      }
    })();
  }, [router]);

  return { isReady };
}


