import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppData } from '../types';
import { appReducer, EMPTY_STATE, Action, EMPTY_APP_DATA } from './reducer';
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
        // migrate() (pure, unit-tested in domain/migration) refreshes built-in Übungen +
        // templates and backfills missing collections. On a fresh install it seeds them
        // from EMPTY_APP_DATA, so both branches go through the same path.
        const data = stored ? (JSON.parse(stored) as AppData) : EMPTY_APP_DATA;
        dispatch({ type: 'LOAD_ALL', payload: migrate(data) });
      } catch (e) {
        console.error('Error loading app data:', e);
        dispatch({ type: 'LOAD_ALL', payload: migrate(EMPTY_APP_DATA) });
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
          persons: state.persons,
          groups: state.groups,
          sessionPlans: state.sessionPlans,
          sessionLogs: state.sessionLogs,
          assessments: state.assessments,
          sessionTemplates: state.sessionTemplates,
          contactLinks: state.contactLinks,
          bodyParts: state.bodyParts,
          techniques: state.techniques,
          metricSchemas: state.metricSchemas,
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
        persons: state.persons,
        groups: state.groups,
        sessionPlans: state.sessionPlans,
        sessionLogs: state.sessionLogs,
        assessments: state.assessments,
        sessionTemplates: state.sessionTemplates,
        contactLinks: state.contactLinks,
        bodyParts: state.bodyParts,
        techniques: state.techniques,
        metricSchemas: state.metricSchemas,
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
