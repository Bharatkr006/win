import useSWR from 'swr';
import { supabase } from '../lib/supabase';
import { useSession } from './useSession';

// Fallbacks for date boundaries (we constrain queries to the Winter Arc).
const ARC_START_STR = '2026-10-01';
const ARC_END_STR = '2026-12-31';

/**
 * ────────────────────────────────────────────────────────────
 * HABITS (The global definitions)
 * ────────────────────────────────────────────────────────────
 */
export function useHabits() {
  const { session } = useSession();
  const userId = session?.user?.id;

  const key = userId ? ['habits', userId] : null;

  const { data, error, mutate } = useSWR(key, async () => {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .order('position', { ascending: true });
    if (error) throw error;
    return data || [];
  });

  const addHabit = async (title) => {
    if (!userId) return;

    // Optimistically update
    const tempId = crypto.randomUUID();
    const newHabit = {
      id: tempId,
      user_id: userId,
      title,
      position: data?.length || 0,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    mutate([...(data || []), newHabit], false); // update cache instantly

    const { data: inserted, error } = await supabase
      .from('habits')
      .insert({ user_id: userId, title, position: data?.length || 0 })
      .select()
      .single();

    if (!error && inserted) {
      // Revalidate to get the real ID from Postgres
      mutate();
    }
  };

  const updateHabit = async (id, updates) => {
    mutate(
      data?.map((h) => (h.id === id ? { ...h, ...updates } : h)),
      false
    );
    await supabase.from('habits').update(updates).eq('id', id);
    mutate();
  };

  const deleteHabit = async (id) => {
    mutate(
      data?.filter((h) => h.id !== id),
      false
    );
    await supabase.from('habits').delete().eq('id', id);
    mutate();
  };

  const reorderHabits = async (reorderedHabits) => {
    // Optimistically update positions locally
    mutate(reorderedHabits, false);

    // Execute multiple updates (Supabase RPC would be better here, but doing sequentially is fine for < 20 items)
    for (let i = 0; i < reorderedHabits.length; i++) {
      await supabase.from('habits').update({ position: i }).eq('id', reorderedHabits[i].id);
    }

    mutate();
  };

  const seedHabits = async () => {
    if (!userId) return;
    const defaults = ['Workout', 'Read 30 min', 'No junk food', 'Journal', 'Drink 2L water'];
    const newItems = defaults.map((title, i) => ({
      user_id: userId,
      title,
      position: i,
      is_active: true,
    }));
    await supabase.from('habits').insert(newItems);
    mutate();
  };

  return { habits: data ?? [], isLoading: !data && !error, addHabit, updateHabit, deleteHabit, reorderHabits, seedHabits };
}

/**
 * ────────────────────────────────────────────────────────────
 * HABIT LOGS (Check-ins per date)
 * ────────────────────────────────────────────────────────────
 */
export function useHabitLogs() {
  const { session } = useSession();
  const userId = session?.user?.id;

  const key = userId ? ['habit_logs', userId] : null;

  const { data, error, mutate } = useSWR(key, async () => {
    const { data, error } = await supabase
      .from('habit_logs')
      .select('*')
      .gte('date', ARC_START_STR)
      .lte('date', ARC_END_STR);
    if (error) throw error;
    return data || [];
  });

  // Toggle true/false for a habit on a specific date (YYYY-MM-DD)
  const toggleLog = async (habitId, dateStr, isCurrentlyDone) => {
    if (!userId) return;

    if (isCurrentlyDone) {
      // Optimistically remove
      mutate(data?.filter((log) => !(log.habit_id === habitId && log.date === dateStr)), false);
      // Execute delete
      await supabase.from('habit_logs').delete().match({ habit_id: habitId, date: dateStr });
    } else {
      // Optimistically add
      const tempId = crypto.randomUUID();
      const newLog = { id: tempId, user_id: userId, habit_id: habitId, date: dateStr };
      mutate([...(data || []), newLog], false);
      // Execute insert
      await supabase.from('habit_logs').insert({ user_id: userId, habit_id: habitId, date: dateStr });
    }

    mutate(); // Revalidate
  };

  return { logs: data ?? [], isLoading: !data && !error, toggleLog };
}

/**
 * ────────────────────────────────────────────────────────────
 * TASKS (One-off items per date)
 * ────────────────────────────────────────────────────────────
 */
export function useTasks() {
  const { session } = useSession();
  const userId = session?.user?.id;

  const key = userId ? ['tasks', userId] : null;

  const { data, error, mutate } = useSWR(key, async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .gte('date', ARC_START_STR)
      .lte('date', ARC_END_STR)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  });

  const addTask = async (title, dateStr) => {
    if (!userId) return;

    const newRow = {
      id: crypto.randomUUID(),
      user_id: userId,
      title,
      date: dateStr,
      is_done: false,
      created_at: new Date().toISOString(),
    };

    mutate([...(data || []), newRow], false);

    await supabase.from('tasks').insert({ user_id: userId, title, date: dateStr });
    mutate();
  };

  const toggleTask = async (id, isCurrentlyDone) => {
    mutate(
      data?.map((t) => (t.id === id ? { ...t, is_done: !isCurrentlyDone } : t)),
      false
    );
    await supabase.from('tasks').update({ is_done: !isCurrentlyDone }).eq('id', id);
    mutate();
  };

  const deleteTask = async (id) => {
    mutate(data?.filter((t) => t.id !== id), false);
    await supabase.from('tasks').delete().eq('id', id);
    mutate();
  };

  return { tasks: data ?? [], isLoading: !data && !error, addTask, toggleTask, deleteTask };
}

/**
 * ────────────────────────────────────────────────────────────
 * JOURNAL (One note per date)
 * ────────────────────────────────────────────────────────────
 */
export function useJournal() {
  const { session } = useSession();
  const userId = session?.user?.id;

  const key = userId ? ['journal', userId] : null;

  const { data, error, mutate } = useSWR(key, async () => {
    const { data, error } = await supabase
      .from('journal')
      .select('*')
      .gte('date', ARC_START_STR)
      .lte('date', ARC_END_STR);
    if (error) throw error;
    return data || [];
  });

  const upsertNote = async (dateStr, note) => {
    if (!userId) return;

    const existing = data?.find((j) => j.date === dateStr);

    if (existing) {
      mutate(data.map((j) => (j.date === dateStr ? { ...j, note } : j)), false);
    } else {
      const newRow = { id: crypto.randomUUID(), user_id: userId, date: dateStr, note };
      mutate([...(data || []), newRow], false);
    }

    await supabase
      .from('journal')
      .upsert({ user_id: userId, date: dateStr, note }, { onConflict: 'user_id,date' });

    mutate();
  };

  return { journal: data ?? [], isLoading: !data && !error, upsertNote };
}

/**
 * ────────────────────────────────────────────────────────────
 * DAILY COUNTS (Derived: Habit Logs + Completed Tasks per date)
 * ────────────────────────────────────────────────────────────
 */
export function useDailyCounts() {
  const { logs, isLoading: logsLoading } = useHabitLogs();
  const { tasks, isLoading: tasksLoading } = useTasks();

  const countsByDate = {}; // { "2026-10-01": 4 }

  if (!logsLoading && !tasksLoading) {
    // 1. Tally habit logs
    for (const log of logs) {
      countsByDate[log.date] = (countsByDate[log.date] || 0) + 1;
    }

    // 2. Tally completed tasks
    for (const task of tasks) {
      if (task.is_done) {
        countsByDate[task.date] = (countsByDate[task.date] || 0) + 1;
      }
    }
  }

  return {
    counts: countsByDate,
    isLoading: logsLoading || tasksLoading,
  };
}
