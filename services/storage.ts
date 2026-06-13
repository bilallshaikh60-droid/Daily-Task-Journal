import { TaskEntry } from '@/constants/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── AsyncStorage implementation (web) ───────────────────────────────────────

const ENTRIES_KEY = 'task_entries';

async function asGetAll(): Promise<TaskEntry[]> {
  const raw = await AsyncStorage.getItem(ENTRIES_KEY);
  if (!raw) return [];
  const parsed = JSON.parse(raw) as TaskEntry[];
  return parsed.sort((a, b) => b.date.localeCompare(a.date));
}

async function asGetByDate(date: string): Promise<TaskEntry | null> {
  const all = await asGetAll();
  return all.find(e => e.date === date) ?? null;
}

async function asSave(entry: TaskEntry): Promise<void> {
  const all = await asGetAll();
  const filtered = all.filter(e => e.id !== entry.id && e.date !== entry.date);
  filtered.push(entry);
  await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(filtered));
}

async function asDelete(id: string): Promise<TaskEntry[]> {
  const all = await asGetAll();
  const filtered = all.filter(e => e.id !== id);
  await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(filtered));
  return filtered;
}

async function asRemoveTask(entryId: string, taskIndex: number): Promise<TaskEntry | null> {
  const all = await asGetAll();
  const entry = all.find(e => e.id === entryId);
  if (!entry) return null;

  entry.tasks.splice(taskIndex, 1);
  entry.completed = (entry.completed ?? [])
    .filter(i => i !== taskIndex)
    .map(i => (i > taskIndex ? i - 1 : i));

  if (entry.tasks.length === 0) {
    await asDelete(entryId);
    return null;
  }

  await asSave(entry);
  return entry;
}

async function asToggle(entryId: string, taskIndex: number): Promise<TaskEntry | null> {
  const all = await asGetAll();
  const entry = all.find(e => e.id === entryId);
  if (!entry) return null;

  const completed = entry.completed ?? [];
  const idx = completed.indexOf(taskIndex);
  if (idx >= 0) completed.splice(idx, 1);
  else completed.push(taskIndex);
  entry.completed = completed;

  await asSave(entry);
  return entry;
}

async function asSearch(query: string): Promise<TaskEntry[]> {
  const all = await asGetAll();
  const q = query.toLowerCase();
  return all.filter(
    e => e.date.includes(q) || e.tasks.some(t => t.toLowerCase().includes(q))
  );
}
// ─── Unified export ───────────────────────────────────────────────────────────

export const storage = {
  async getAllEntries(): Promise<TaskEntry[]> {
    return asGetAll();
  },
  async getEntryByDate(date: string): Promise<TaskEntry | null> {
    return asGetByDate(date);
  },
  async saveEntry(entry: TaskEntry): Promise<void> {
    return asSave(entry);
  },
  async deleteEntry(id: string): Promise<TaskEntry[]> {
    return asDelete(id);
  },
  async removeTaskFromEntry(entryId: string, taskIndex: number): Promise<TaskEntry | null> {
    return asRemoveTask(entryId, taskIndex);
  },
  async toggleTaskCompletion(entryId: string, taskIndex: number): Promise<TaskEntry | null> {
    return asToggle(entryId, taskIndex);
  },
  async searchEntries(query: string): Promise<TaskEntry[]> {
    return asSearch(query);
  },
};