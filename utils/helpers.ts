import { DayData, getCompletedCount, TaskEntry, toLocalDateString } from '@/constants/types';

let idCounter = 0;
export function generateId(): string {
  idCounter += 1;
  return Date.now().toString(36) + idCounter.toString(36) + Math.random().toString(36).substring(2, 9);
}

export function getTodayString(): string {
  return toLocalDateString(new Date());
}

export function formatDisplayDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTimelineDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function generateInsights(entries: TaskEntry[]): string[] {
  if (entries.length === 0) return [];
  const insights: string[] = [];

  const totalCompleted = entries.reduce((sum, e) => sum + getCompletedCount(e), 0);
  if (totalCompleted > 0) {
    insights.push(`You completed ${totalCompleted} tasks across all entries.`);
  }

  const dayDistribution = [0, 0, 0, 0, 0, 0, 0];
  entries.forEach(e => {
    const dayIndex = new Date(e.date + 'T00:00:00').getDay();
    dayDistribution[dayIndex] += getCompletedCount(e);
  });

  let maxCount = 0;
  let maxDay = '';
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  dayDistribution.forEach((val, idx) => {
    if (val > maxCount) {
      maxCount = val;
      maxDay = weekdays[idx];
    }
  });
  if (maxCount > 0 && maxDay) {
    insights.push(`Your most productive day was ${maxDay} with ${maxCount} tasks.`);
  }

  const todayStr = getTodayString();
  const todayEntry = entries.find(e => e.date === todayStr);
  if (todayEntry) {
    const todayDone = getCompletedCount(todayEntry);
    if (todayDone > 0) {
      insights.push(`You've completed ${todayDone} tasks today. Keep going!`);
    }
  }

  return insights;
}

export function getDayData(entries: TaskEntry[]): DayData[] {
  const today = new Date();
  const data: DayData[] = [];
  for (let i = 69; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = toLocalDateString(d);
    const entry = entries.find(e => e.date === dateStr);
    data.push({ date: dateStr, count: entry ? entry.tasks.length : 0 });
  }
  return data;
}
