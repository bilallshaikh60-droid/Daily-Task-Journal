// components/ui/HeatmapCalendar.tsx
import { BorderRadius, FontSize, Spacing } from '@/constants/theme';
import { DayData, Weekday } from '@/constants/types';
import { useTheme } from '@/context/ThemeContext';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

interface Props {
  data: DayData[];
  daysToShow?: number;
  totalActiveDays: number;
  totalTasks: number;
  workingDays: Weekday[];
}


const LIGHT_LEVELS = ['#F0EDE8', '#DDD6FE', '#C4B5FD', '#A78BFA', '#7C6FBF'];
const DARK_LEVELS = ['#222222', '#3B2E66', '#523E99', '#6D52CC', '#8B6EF2'];

function getIntensity(count: number, max: number, isDark: boolean): string {
  const currentLevels = isDark ? DARK_LEVELS : LIGHT_LEVELS;
  if (count === 0) return currentLevels[0];

  const ratio = count / max;
  if (ratio <= 0.25) return currentLevels[1];
  if (ratio <= 0.5) return currentLevels[2];
  if (ratio <= 0.75) return currentLevels[3];
  return currentLevels[4];
}

const DAY_SIZE = 24;


export default function HeatmapCalendar({ data, daysToShow = 70, totalActiveDays, totalTasks, workingDays }: Props) {
  const { colors, isDark } = useTheme();
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const days = data.slice(0, daysToShow).reverse();

  const weeks: DayData[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.titleRow}>

          {/* <Text style={[styles.title, { color: colors.text }]}>Activity</Text> */}

          {/* Stats badges */}
          <View style={styles.stats}>
            <View style={[styles.statBadge, { backgroundColor: colors.cardLight }]}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>{totalActiveDays}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedText }]}>active days</Text>
            </View>
            <View style={[styles.statBadge, { backgroundColor: colors.cardLight }]}>
              <Text style={[styles.statNumber, { color: colors.secondary }]}>{totalTasks}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedText }]}>total tasks</Text>
            </View>
          </View>

          <View style={styles.legend}>
            {(isDark ? DARK_LEVELS : LIGHT_LEVELS).map((colorValue, i) => (
              <View key={i} style={styles.legendItem}>
                <View style={[styles.legendBox, { backgroundColor: colorValue }]} />
              </View>
            ))}
          </View>
        </View>
        <View style={styles.grid}>
          {weeks.map((week, wi) => (
            <View key={wi} style={styles.weekRow}>
              {week.map((day, di) => {
                const isWorking = workingDays.includes(
                  new Date(day.date + 'T00:00:00').getDay() as Weekday
                );
                return (
                  < View key={di} style={styles.dayCell} >
                    <View
                      style={[
                        styles.dayBox,
                        {
                          backgroundColor: !isWorking
                            ? (isDark ? '#1a1a1a' : '#F5F5F3')           // greyed out
                            : getIntensity(day.count, maxCount, isDark),  // normal
                          opacity: !isWorking ? 0.4 : 1,
                          borderWidth: !isWorking ? 1 : 0,
                          borderColor: isDark ? '#333' : '#E0DDD8',
                        }
                      ]}
                    />
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
 
const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    marginHorizontal: Spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  legend: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  legendItem: {
    alignItems: 'center',
  },
  legendBox: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  grid: {
    flexDirection: 'row',
    gap: 4,
  },
  weekRow: {
    flexDirection: 'column',
    gap: 4,
  },
  dayCell: {
    alignItems: 'center',
  },
  dayBox: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    borderRadius: BorderRadius.sm,
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  statNumber: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
});