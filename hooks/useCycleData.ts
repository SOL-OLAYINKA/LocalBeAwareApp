import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { format, addDays, parseISO } from 'date-fns';

export interface CycleEntry {
  id: string;
  start_date: string;
  end_date: string;
  type: 'period' | 'ovulation';
  flow_intensity?: 'light' | 'medium' | 'heavy' | null;
  created_at?: string;
  updated_at?: string;
}

export interface CyclePreferences {
  average_cycle_length: number;
  notify_period_reminder: boolean;
  notify_ovulation_reminder: boolean;
  notify_log_reminder: boolean;
  notification_sound_period: string;
  notification_sound_ovulation: string;
  notification_sound_log: string;
  notification_time: string;
}

const DEFAULT_PREFERENCES: CyclePreferences = {
  average_cycle_length: 28,
  notify_period_reminder: true,
  notify_ovulation_reminder: true,
  notify_log_reminder: true,
  notification_sound_period: 'GentleBell.mp3',
  notification_sound_ovulation: 'ChimeBreeze.mp3',
  notification_sound_log: 'GentleBell.mp3',
  notification_time: '09:00:00',
};

export function useCycleData() {
  const [entries, setEntries] = useState<CycleEntry[]>([]);
  const [preferences, setPreferences] = useState<CyclePreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settingUpPreferences, setSettingUpPreferences] = useState(false); // 👈 NEW!

  useEffect(() => {
    loadCycleData();
  }, []);

  const loadCycleData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User not authenticated');

      // Load entries and preferences in parallel
      const [entriesResult, prefsResult] = await Promise.all([
        supabase
          .from('cycle_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('start_date', { ascending: false }),
        supabase
          .from('cycle_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()
      ]);

      if (entriesResult.error) throw entriesResult.error;
      if (prefsResult.error && prefsResult.error.code !== 'PGRST116') {
        throw prefsResult.error;
      }

      setEntries(entriesResult.data || []);

      if (prefsResult.data) {
        setPreferences(prefsResult.data);
      } else {
        // New user — setting up default preferences
        setSettingUpPreferences(true); // 👈 Show setting up message
        const { error: insertError } = await supabase
          .from('cycle_preferences')
          // previously had incorrect method call here
        insert([{ ...DEFAULT_PREFERENCES, user_id: user.id }]);
        setSettingUpPreferences(false);

        if (insertError) throw insertError;

        setPreferences(DEFAULT_PREFERENCES);
        setSettingUpPreferences(false); // 👈 Done setting up
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cycle data');
      console.error('Error loading cycle data:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveCycleEntry = async (entry: Omit<CycleEntry, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('cycle_entries')
        .insert([{ ...entry, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      setEntries(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error saving cycle entry:', err);
      throw err;
    }
  };

  const updatePreferences = async (newPrefs: Partial<CyclePreferences>) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('cycle_preferences')
        .upsert([{
          user_id: user.id,
          ...preferences,
          ...newPrefs,
        }])
        .select()
        .single();

      if (error) throw error;

      setPreferences(data);
      return data;
    } catch (err) {
      console.error('Error updating preferences:', err);
      throw err;
    }
  };

  const calculateNextPeriod = () => {
    if (!entries.length) return null;

    const lastPeriod = entries.find(e => e.type === 'period');
    if (!lastPeriod) return null;

    return format(
      addDays(parseISO(lastPeriod.start_date), preferences.average_cycle_length),
      'yyyy-MM-dd'
    );
  };

  const calculateOvulation = () => {
    const nextPeriod = calculateNextPeriod();
    if (!nextPeriod) return null;

    return format(
      addDays(parseISO(nextPeriod), -14),
      'yyyy-MM-dd'
    );
  };

  return {
    entries,
    preferences,
    loading,
    settingUpPreferences, // 👈 Return this state too!
    error,
    saveCycleEntry,
    updatePreferences,
    calculateNextPeriod,
    calculateOvulation,
    refresh: loadCycleData,
  };
}
