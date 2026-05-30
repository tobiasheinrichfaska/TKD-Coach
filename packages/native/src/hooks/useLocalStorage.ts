import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UseLocalStorageResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  save: (value: T) => Promise<void>;
  clear: () => Promise<void>;
}

/**
 * Hook to persist/load data from AsyncStorage.
 * Loads on mount, provides save/clear functions.
 */
export function useLocalStorage<T>(key: string, initialValue: T | null = null): UseLocalStorageResult<T> {
  const [data, setData] = useState<T | null>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load from storage on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          setData(JSON.parse(stored));
        }
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Unknown error loading from storage'));
      } finally {
        setLoading(false);
      }
    })();
  }, [key]);

  const save = async (value: T) => {
    try {
      setData(value);
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error saving to storage'));
    }
  };

  const clear = async () => {
    try {
      setData(null);
      await AsyncStorage.removeItem(key);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error clearing storage'));
    }
  };

  return { data, loading, error, save, clear };
}
