import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const STORAGE_KEY = 'fab3d_credits';
const ANON_DAILY_LIMIT = 5;
const FREE_DAILY_LIMIT = 10;

interface CreditData {
  used: number;
  date: string;
  plan: 'free' | 'pro' | 'team';
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function loadAnonCredits(): { used: number; date: string } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      if (data.date === getTodayKey()) return data;
    }
  } catch { /* ignore */ }
  return { used: 0, date: getTodayKey() };
}

function saveAnonCredits(data: { used: number; date: string }): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
}

export function useCredits(userId?: string | null) {
  const [credits, setCredits] = useState<CreditData>({ used: 0, date: getTodayKey(), plan: 'free' });
  const [loading, setLoading] = useState(!!userId);

  // Load credits
  useEffect(() => {
    if (!userId) {
      const anon = loadAnonCredits();
      setCredits({ ...anon, plan: 'free' });
      setLoading(false);
      return;
    }

    const load = async () => {
      const today = getTodayKey();
      let { data } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!data) {
        // Create credit row for new user
        const { data: created } = await supabase
          .from('user_credits')
          .insert({ user_id: userId, plan: 'free', daily_used: 0, last_reset: today })
          .select()
          .single();
        data = created;
      }

      if (data) {
        // Reset daily counter if new day
        if (data.last_reset !== today) {
          await supabase
            .from('user_credits')
            .update({ daily_used: 0, last_reset: today, updated_at: new Date().toISOString() })
            .eq('id', data.id);
          data.daily_used = 0;
        }

        setCredits({
          used: data.daily_used,
          date: today,
          plan: data.plan,
        });
      }
      setLoading(false);
    };

    load();
  }, [userId]);

  const dailyLimit = userId
    ? (credits.plan === 'pro' || credits.plan === 'team' ? Infinity : FREE_DAILY_LIMIT)
    : ANON_DAILY_LIMIT;

  const remaining = dailyLimit === Infinity ? Infinity : dailyLimit - credits.used;
  const hasCredits = remaining > 0;

  const useCredit = useCallback(async (prompt?: string): Promise<boolean> => {
    if (!hasCredits) return false;

    if (!userId) {
      // Anonymous — localStorage
      const current = loadAnonCredits();
      if (current.used >= ANON_DAILY_LIMIT) return false;
      const updated = { used: current.used + 1, date: getTodayKey() };
      saveAnonCredits(updated);
      setCredits(prev => ({ ...prev, used: updated.used }));
      return true;
    }

    // Authenticated — Supabase
    const { data: row } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!row || row.daily_used >= (credits.plan === 'free' ? FREE_DAILY_LIMIT : Infinity)) {
      return false;
    }

    await supabase
      .from('user_credits')
      .update({
        daily_used: row.daily_used + 1,
        total_generations: row.total_generations + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', row.id);

    // Log generation
    if (prompt) {
      await supabase
        .from('generations')
        .insert({ user_id: userId, prompt, status: 'completed' });
    }

    setCredits(prev => ({ ...prev, used: prev.used + 1 }));
    return true;
  }, [userId, hasCredits, credits.plan]);

  return {
    remaining,
    total: dailyLimit === Infinity ? 'Unlimited' : dailyLimit,
    used: credits.used,
    hasCredits,
    plan: credits.plan,
    useCredit,
    loading,
  };
}
