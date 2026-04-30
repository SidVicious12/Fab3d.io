import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'fab3d_credits';
const MAX_DAILY_CREDITS = 5;

interface CreditData {
  used: number;
  date: string;
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function loadCredits(): CreditData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data: CreditData = JSON.parse(stored);
      if (data.date === getTodayKey()) {
        return data;
      }
    }
  } catch {
    // ignore parse errors
  }
  return { used: 0, date: getTodayKey() };
}

function saveCredits(data: CreditData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
}

export function useCredits() {
  const [credits, setCredits] = useState<CreditData>(loadCredits);

  useEffect(() => {
    // Re-check on mount in case day changed
    const data = loadCredits();
    setCredits(data);
  }, []);

  const remaining = MAX_DAILY_CREDITS - credits.used;
  const hasCredits = remaining > 0;

  const useCredit = useCallback((): boolean => {
    const current = loadCredits();
    if (current.used >= MAX_DAILY_CREDITS) return false;

    const updated = { ...current, used: current.used + 1 };
    saveCredits(updated);
    setCredits(updated);
    return true;
  }, []);

  return {
    remaining,
    total: MAX_DAILY_CREDITS,
    used: credits.used,
    hasCredits,
    useCredit,
  };
}
