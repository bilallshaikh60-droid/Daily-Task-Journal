export interface TaskEntry {
  id: string;
  date: string;
  tasks: string[];
  completed?: number[];
}

export function getCompletedCount(entry: TaskEntry): number {
  return entry.completed?.length ?? 0;
}

export function getCompletionRate(entry: TaskEntry): number {
  if (entry.tasks.length === 0) return 0;
  return (entry.completed?.length ?? 0) / entry.tasks.length;
}

export interface DayData {
  date: string;
  count: number;
}

export interface Statistics {
  totalTasks: number;
  totalActiveDays: number;
  longestStreak: number;
  averageTasksPerDay: number;
}
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday

export interface WorkingDaysConfig {
  workingDays: Weekday[];
}

export const DEFAULT_WORKING_DAYS: Weekday[] = [1, 2, 3, 4, 5]; // Mon–Fri

export function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Streak utility — skips non-working days
export function calculateStreak(entries: TaskEntry[], workingDays: Weekday[]): number {
  if (entries.length === 0 || workingDays.length === 0) return 0;

  const entryDates = new Set(entries.map(e => e.date));
  let streak = 0;
  const today = new Date();

  // Walk backwards from today
  const cursor = new Date(today);
  cursor.setHours(0, 0, 0, 0);

  while (true) {
    const dayOfWeek = cursor.getDay() as Weekday;
    const dateStr = toLocalDateString(cursor);

    if (workingDays.includes(dayOfWeek)) {
      // This is a working day — must have an entry
      if (entryDates.has(dateStr)) {
        streak++;
      } else {
        // Allow missing today if it's still early (no entry yet)
        const isToday = dateStr === toLocalDateString(today);
        if (isToday && streak === 0) {
          // Haven't logged today yet — don't break, just skip today
          cursor.setDate(cursor.getDate() - 1);
          continue;
        }
        break; // Missed a working day — streak ends
      }
    }
    // Non-working day — skip silently

    cursor.setDate(cursor.getDate() - 1);

    // Safety: don't look back more than 2 years
    const twoYearsAgo = new Date(today);
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    if (cursor < twoYearsAgo) break;
  }

  return streak;
}