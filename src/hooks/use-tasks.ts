import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';

import { readTasks, writeTasks, type Task } from '@/storage/tasks';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false);
  const ready = useRef(false);
  const reload = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    setLoading(true);
    try {
      const parsed = await readTasks(AsyncStorage);
      setTasks(parsed);
      setError(null);
      ready.current = true;
      setLoaded(true);
    } catch {
      setError(
        'Could not load your tasks. Please try again. Your saved data has been kept.',
      );
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    // Loading starts synchronously; task data is only published after storage resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload();
  }, [reload]);
  async function update(next: Task[]) {
    if (!ready.current || busy.current) return false;
    busy.current = true;
    setSaving(true);
    setError(null);
    try {
      await writeTasks(AsyncStorage, next);
      setTasks(next);
      return true;
    } catch {
      setError('Could not save this change. Please try again.');
      return false;
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }
  return { tasks, loading, loaded, saving, error, reload, update };
}
