import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppData } from '../types';
import { appReducer, EMPTY_STATE, Action, EMPTY_APP_DATA } from './reducer';
import { BUILTIN_GAMES } from '../constants/games';
import { migrate } from '../domain/migration';

const STORAGE_KEY = 'tkd_coach_app_data';
const DEBOUNCE_MS = 300;

interface DataContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  isLoaded: boolean;
  saveAll: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, EMPTY_STATE);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize: load from storage on first render
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored) as AppData;
          // Migration (pure, unit-tested in domain/migration): refresh built-in Übungen
          // from the seed, preserving user-created games.
          dispatch({ type: 'LOAD_ALL', payload: migrate(data) });
        } else {
          // First run: seed with built-in games
          const initialData: AppData = {
            ...EMPTY_APP_DATA,
            games: BUILTIN_GAMES,
          };
          dispatch({ type: 'LOAD_ALL', payload: initialData });
        }
      } catch (e) {
        console.error('Error loading app data:', e);
        // Fallback: seed with built-in games
        const initialData: AppData = {
          ...EMPTY_APP_DATA,
          games: BUILTIN_GAMES,
        };
        dispatch({ type: 'LOAD_ALL', payload: initialData });
      }
    })();
  }, []);

  // Persist to storage whenever state changes (debounced)
  useEffect(() => {
    if (!state.isLoaded) return;

    // Clear any pending timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Schedule save
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const dataToSave: AppData = {
          version: state.version,
          games: state.games,
          athletes: state.athletes,
          groups: state.groups,
          sessionPlans: state.sessionPlans,
          sessionLogs: state.sessionLogs,
          assessments: state.assessments,
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      } catch (e) {
        console.error('Error saving app data:', e);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state]);

  const saveAll = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    try {
      const dataToSave: AppData = {
        version: state.version,
        games: state.games,
        athletes: state.athletes,
        groups: state.groups,
        sessionPlans: state.sessionPlans,
        sessionLogs: state.sessionLogs,
        assessments: state.assessments,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.error('Error force-saving app data:', e);
    }
  }, [state]);

  return (
    <DataContext.Provider value={{ state, dispatch, isLoaded: state.isLoaded, saveAll }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextType {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
