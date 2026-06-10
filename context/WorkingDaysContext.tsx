import { DEFAULT_WORKING_DAYS, Weekday } from '@/constants/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'working_days';

interface WorkingDaysContextType {
  workingDays: Weekday[];
  setWorkingDays: (days: Weekday[]) => Promise<void>;
  isWorkingDay: (date: string) => boolean;
  isLoaded: boolean;
}

const WorkingDaysContext = createContext<WorkingDaysContextType>({
  workingDays: DEFAULT_WORKING_DAYS,
  setWorkingDays: async () => {},
  isWorkingDay: () => true,
  isLoaded: false,
});

export function WorkingDaysProvider({ children }: { children: React.ReactNode }) {
  const [workingDays, setWorkingDaysState] = useState<Weekday[]>(DEFAULT_WORKING_DAYS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(raw => {
        if (raw) setWorkingDaysState(JSON.parse(raw) as Weekday[]);
      })
      .finally(() => setIsLoaded(true));
  }, []);

  const setWorkingDays = useCallback(async (days: Weekday[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(days));
    setWorkingDaysState(days);
  }, []);

  const isWorkingDay = useCallback((dateStr: string): boolean => {
    const day = new Date(dateStr + 'T00:00:00').getDay() as Weekday;
    return workingDays.includes(day);
  }, [workingDays]);

  return (
    <WorkingDaysContext.Provider value={{ workingDays, setWorkingDays, isWorkingDay, isLoaded }}>
      {children}
    </WorkingDaysContext.Provider>
  );
}

export function useWorkingDays() {
  return useContext(WorkingDaysContext);
}