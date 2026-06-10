import { TaskEntry } from '@/constants/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

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
  const idx = all.findIndex(e => e.date === entry.date);
  if (idx >= 0) all[idx] = entry;
  else all.push(entry);
  await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(all));
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

// ─── SQLite implementation (native) ──────────────────────────────────────────

let _sqliteStorage: typeof storage | null = null;

async function getSQLiteStorage() {
  if (_sqliteStorage) return _sqliteStorage;
  const { openDatabaseAsync } = await import('expo-sqlite');

  let db: Awaited<ReturnType<typeof openDatabaseAsync>> | null = null;
  let initPromise: Promise<Awaited<ReturnType<typeof openDatabaseAsync>>> | null = null;

  async function getDb() {
    if (initPromise) return initPromise;
    if (db) return db;
    initPromise = (async () => {
      db = await openDatabaseAsync('tasks.db');
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS task_entries (
          id TEXT PRIMARY KEY,
          date TEXT UNIQUE NOT NULL,
          tasks TEXT NOT NULL DEFAULT '[]',
          completed TEXT DEFAULT '[]'
        );
      `);
      return db;
    })();
    return initPromise;
  }

  function rowToEntry(row: { id: string; date: string; tasks: string; completed: string | null }): TaskEntry {
    return {
      id: row.id,
      date: row.date,
      tasks: JSON.parse(row.tasks || '[]'),
      completed: row.completed ? JSON.parse(row.completed) : [],
    };
  }

  _sqliteStorage = {
    async getAllEntries() {
      const database = await getDb();
      const rows = await database!.getAllAsync<any>('SELECT * FROM task_entries ORDER BY date DESC');
      return rows.map(rowToEntry);
    },
    async getEntryByDate(date: string) {
      if (!date) return null;
      const database = await getDb();
      const row = await database!.getFirstAsync<any>('SELECT * FROM task_entries WHERE date = ?', date);
      return row ? rowToEntry(row) : null;
    },
    async saveEntry(entry: TaskEntry) {
      if (!entry?.id || !entry?.date) return;
      const database = await getDb();
      await database!.runAsync(
        `INSERT INTO task_entries (id, date, tasks, completed) VALUES (?, ?, ?, ?)
         ON CONFLICT(date) DO UPDATE SET tasks = excluded.tasks, completed = excluded.completed`,
        entry.id, entry.date,
        JSON.stringify(entry.tasks ?? []),
        JSON.stringify(entry.completed ?? [])
      );
    },
    async deleteEntry(id: string) {
      const database = await getDb();
      await database!.runAsync('DELETE FROM task_entries WHERE id = ?', id);
      return this.getAllEntries();
    },
    async removeTaskFromEntry(entryId: string, taskIndex: number) {
      const database = await getDb();
      const row = await database!.getFirstAsync<any>('SELECT * FROM task_entries WHERE id = ?', entryId);
      if (!row) return null;
      const entry = rowToEntry(row);
      entry.tasks.splice(taskIndex, 1);
      entry.completed = (entry.completed ?? [])
        .filter(i => i !== taskIndex)
        .map(i => (i > taskIndex ? i - 1 : i));
      if (entry.tasks.length === 0) {
        await database!.runAsync('DELETE FROM task_entries WHERE id = ?', entryId);
        return null;
      }
      await database!.runAsync(
        'UPDATE task_entries SET tasks = ?, completed = ? WHERE id = ?',
        JSON.stringify(entry.tasks), JSON.stringify(entry.completed ?? []), entryId
      );
      return entry;
    },
    async toggleTaskCompletion(entryId: string, taskIndex: number) {
      const database = await getDb();
      const row = await database!.getFirstAsync<any>('SELECT * FROM task_entries WHERE id = ?', entryId);
      if (!row) return null;
      const entry = rowToEntry(row);
      const completed = entry.completed ?? [];
      const idx = completed.indexOf(taskIndex);
      if (idx >= 0) completed.splice(idx, 1);
      else completed.push(taskIndex);
      entry.completed = completed;
      await database!.runAsync(
        'UPDATE task_entries SET completed = ? WHERE id = ?',
        JSON.stringify(entry.completed), entryId
      );
      return entry;
    },
    async searchEntries(query: string) {
      const database = await getDb();
      const q = `%${(query || '').toLowerCase()}%`;
      const rows = await database!.getAllAsync<any>(
        'SELECT * FROM task_entries WHERE LOWER(date) LIKE ? OR LOWER(tasks) LIKE ? ORDER BY date DESC', q, q
      );
      return rows.map(rowToEntry);
    },
  };

  return _sqliteStorage;
}

// ─── Unified export ───────────────────────────────────────────────────────────

export const storage = {
  async getAllEntries(): Promise<TaskEntry[]> {
    if (Platform.OS === 'web') return asGetAll();
    return (await getSQLiteStorage()).getAllEntries();
  },
  async getEntryByDate(date: string): Promise<TaskEntry | null> {
    if (Platform.OS === 'web') return asGetByDate(date);
    return (await getSQLiteStorage()).getEntryByDate(date);
  },
  async saveEntry(entry: TaskEntry): Promise<void> {
    if (Platform.OS === 'web') return asSave(entry);
    return (await getSQLiteStorage()).saveEntry(entry);
  },
  async deleteEntry(id: string): Promise<TaskEntry[]> {
    if (Platform.OS === 'web') return asDelete(id);
    return (await getSQLiteStorage()).deleteEntry(id);
  },
  async removeTaskFromEntry(entryId: string, taskIndex: number): Promise<TaskEntry | null> {
    if (Platform.OS === 'web') return asRemoveTask(entryId, taskIndex);
    return (await getSQLiteStorage()).removeTaskFromEntry(entryId, taskIndex);
  },
  async toggleTaskCompletion(entryId: string, taskIndex: number): Promise<TaskEntry | null> {
    if (Platform.OS === 'web') return asToggle(entryId, taskIndex);
    return (await getSQLiteStorage()).toggleTaskCompletion(entryId, taskIndex);
  },
  async searchEntries(query: string): Promise<TaskEntry[]> {
    if (Platform.OS === 'web') return asSearch(query);
    return (await getSQLiteStorage()).searchEntries(query);
  },
};