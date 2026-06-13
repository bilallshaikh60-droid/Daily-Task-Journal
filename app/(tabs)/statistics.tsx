import FloatingAddButton from '@/components/ui/FloatingAddButton';
import ScreenHeader from '@/components/ui/ScreenHeader';
import StatCard from '@/components/ui/StatCard';
import { statsStyles } from '@/constants/styles';
import { TaskEntry, calculateStreak, getCompletedCount } from '@/constants/types';
import { useTheme } from '@/context/ThemeContext';
import { useWorkingDays } from '@/context/WorkingDaysContext';
import { storage } from '@/services/storage';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function StatisticsScreen() {
  const { colors, isDark } = useTheme();
  const [entries, setEntries] = useState<TaskEntry[]>([]);
  const { workingDays } = useWorkingDays();
  const longestStreak = calculateStreak(entries, workingDays);

  useFocusEffect(
    useCallback(() => {
      async function loadStats() {
        const all = await storage.getAllEntries();
        setEntries(all);
      }
      loadStats();
    }, [])
  );

  const totalDaysTracked = entries.length;
  const totalTasks = entries.reduce((acc, curr) => acc + curr.tasks.length, 0);
  const totalCompleted = entries.reduce((acc, curr) => acc + getCompletedCount(curr), 0);

  const avgTasksPerDay = totalDaysTracked > 0 ? (totalTasks / totalDaysTracked).toFixed(1) : '0.0';
  const totalCompletionRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  const dayDistribution = [0, 0, 0, 0, 0, 0, 0];
  entries.forEach((entry) => {
    const dayIndex = new Date(entry.date + 'T00:00:00').getDay();
    dayDistribution[dayIndex] += getCompletedCount(entry);
  });

  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const sortedWorkingDays = [...workingDays].sort((a, b) => a - b);
  const workingDayEntries = sortedWorkingDays.map(i => ({
    index: i,
    name: weekdays[i],
    count: dayDistribution[i],
  }));
  const workingDayCounts = workingDayEntries.map(e => e.count);
  const maxDayCount = Math.max(...workingDayCounts, 1);

  let maxIndex = workingDayEntries[0]?.index ?? 0;
  let currentMax = 0;
  workingDayEntries.forEach(({ index, count }) => {
    if (count > currentMax) {
      currentMax = count;
      maxIndex = index;
    }
  });
  const mostProductiveDay = weekdays[maxIndex];

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[statsStyles.container, { backgroundColor: colors.background }]}>
       <View style={{ flex: 1 }}>
      <ScreenHeader title="Statistics" subtitle={`${totalDaysTracked} ${totalDaysTracked === 1 ? 'day' : 'days'} tracked`} />

      <ScrollView
        contentContainerStyle={[statsStyles.scrollContent]}
        showsVerticalScrollIndicator={false}
      >
        <View style={statsStyles.grid}>
          <View style={statsStyles.gridItem}><StatCard label="Total Tasks" value={totalTasks} color={colors.primary} /></View>
          <View style={statsStyles.gridItem}><StatCard label="Active Days" value={totalDaysTracked} color={colors.secondary} /></View>
          <View style={statsStyles.gridItem}><StatCard label="Longest Streak" value={`${longestStreak} ${longestStreak === 1 ? 'day' : 'days'}`} color={colors.secondary} /></View>
          <View style={statsStyles.gridItem}><StatCard label="Avg Tasks/Day" value={avgTasksPerDay} color="#FBBF24" /></View>
          <View style={statsStyles.gridItem}><StatCard label="Tasks Completed" value={totalCompleted} color={colors.success} /></View>
          <View style={statsStyles.gridItem}><StatCard label="Completion Rate" value={`${totalCompletionRate}%`} color={colors.success} /></View>
        </View>

        <Text style={[statsStyles.sectionTitle, { color: colors.text }]}>Day Analysis</Text>

        <View style={statsStyles.analysisBlock}>
          {workingDayEntries.map(({ index, name, count }) => {
            const progressPct = (count / maxDayCount) * 100;
            return (
              <View key={name} style={statsStyles.analysisRow}>
                <Text style={[statsStyles.dayLabel, { color: colors.text }]}>{name}</Text>
                <View style={[statsStyles.track, { backgroundColor: isDark ? '#262626' : '#F3F3F1' }]}>
                  {count > 0 && (
                    <View
                      style={[
                        statsStyles.fill,
                        {
                          width: `${progressPct}%`,
                          backgroundColor: index === maxIndex ? colors.primary : colors.secondary,
                        }
                      ]}
                    />
                  )}
                </View>
                <Text style={[statsStyles.countValue, { color: colors.mutedText }]}>{count}</Text>
              </View>
            );
          })}
        </View>

        <View
          style={[
            statsStyles.insightRibbon,
            {
              backgroundColor: isDark ? colors.card : '#F3F3F1',
              borderColor: colors.border,
            }
          ]}
        >
          <View style={statsStyles.trophyContainer}>
            <Ionicons name="trophy" size={20} color="#FBBF24" />
          </View>
          <Text style={[statsStyles.insightText, { color: colors.text }]}>
            Your most productive day is <Text style={statsStyles.highlightText}>{mostProductiveDay}</Text>
          </Text>
        </View>
      </ScrollView>
      <FloatingAddButton onPress={() => {router.push('/');}} />
      </View>
    </SafeAreaView>
  );
}
