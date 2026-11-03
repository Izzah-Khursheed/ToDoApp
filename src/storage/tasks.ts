export type Task = { id: string; title: string; done: boolean };

export const TASKS_STORAGE_KEY = 'little-list.tasks.v1';
export const MAX_TASK_TITLE_LENGTH = 200;

export function isTasks(value: unknown): value is Task[] {
  return (
    Array.isArray(value) &&
    value.every(
      (task) =>
        task !== null &&
        typeof task === 'object' &&
        typeof task.id === 'string' &&
        task.id.trim().length > 0 &&
        typeof task.title === 'string' &&
        task.title.trim().length > 0 &&
        task.title.length <= MAX_TASK_TITLE_LENGTH &&
        typeof task.done === 'boolean',
    ) &&
    new Set(value.map((task) => task.id)).size === value.length
  );
}

export async function readTasks(storage: {
  getItem: (key: string) => Promise<string | null>;
}): Promise<Task[]> {
  const stored = await storage.getItem(TASKS_STORAGE_KEY);
  const parsed: unknown = stored === null ? [] : JSON.parse(stored);
  if (!isTasks(parsed)) throw new Error('Invalid task data');
  return parsed;
}

export async function writeTasks(
  storage: { setItem: (key: string, value: string) => Promise<unknown> },
  tasks: Task[],
) {
  if (!isTasks(tasks)) throw new Error('Invalid task data');
  await storage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
}
