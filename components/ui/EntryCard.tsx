import { BorderRadius, FontSize, Spacing } from '@/constants/theme';
import { TaskEntry, getCompletedCount, getCompletionRate } from '@/constants/types';
import { useTheme } from '@/context/ThemeContext';
import { formatDisplayDate } from '@/utils/helpers';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

interface Props {
  entry: TaskEntry;
  onEdit: (entry: TaskEntry) => void;
  onDelete: (id: string) => void;
  onRemoveTask?: (index: number) => void;
  onToggleTask?: (index: number) => void; // ← add this
}

export default function EntryCard({ entry, onEdit, onDelete, onRemoveTask, onToggleTask }: Props) {
  const { colors, isDark } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const { date, tasks, completed = [] } = entry;
  const doneCount = getCompletedCount(entry);
  const rate = getCompletionRate(entry);

  const renderRightActions = (index: number) => (
    <TouchableOpacity
      style={[styles.deleteAction, { backgroundColor: colors.danger }]}
      onPress={() => onRemoveTask?.(index)}
    >
      <Ionicons name="trash-outline" size={24} color="#fff" />
    </TouchableOpacity>
  );

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          boxShadow: isDark ? '0px 4px 16px rgba(0, 0, 0, 0.4)' : '0px 4px 12px rgba(0, 0, 0, 0.08)'
        }
      ]}
    >
      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <View style={[styles.progressFill, { width: `${rate * 100}%`, backgroundColor: colors.success }]} />
      </View>

      <View style={styles.header}>
        <View style={styles.dateBadge}>
          <Text style={[styles.dayName, { color: colors.mutedText }]}>{getDayName(date)}</Text>
          <Text style={[styles.dayNumber, { color: colors.text }]}>{getDayNumber(date)}</Text>
          <Text style={[styles.month, { color: colors.mutedText }]}>{getMonth(date)}</Text>
        </View>

        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]}>{formatDisplayDate(date)}</Text>
          <Text style={[styles.taskMeta, { color: colors.mutedText }]}>
            {doneCount}/{tasks.length} completed
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={() => onEdit(entry)} style={styles.iconBtn} activeOpacity={0.7}>
            <Ionicons name="pencil" size={20} color={colors.secondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(entry.id)} style={styles.iconBtn} activeOpacity={0.7}>
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.expandBtn, { borderTopColor: colors.border }]}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
      >
        <Text style={[styles.expandText, { color: colors.primary }]}>
          {expanded ? 'Hide Tasks' : `View ${tasks.length} Tasks`}
        </Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.primary}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.taskList}>
          {tasks.map((task, index) => {
            const isDone = completed.includes(index);
            const key = `${index}-${task.substring(0, 20)}`;

            return (
              <Swipeable
                key={key}
                renderRightActions={() => renderRightActions(index)}
                rightThreshold={40}
                friction={2}
                overshootRight={false}
              >
                <TouchableOpacity
                  style={[styles.taskItem, { backgroundColor: colors.cardLight }]}
                  onPress={() => onToggleTask?.(index)}
                  activeOpacity={0.7}
                >
                  <View style={styles.taskContent}>
                    <Ionicons
                      name={isDone ? 'checkmark-circle' : 'ellipse-outline'}
                      size={24}
                      color={isDone ? colors.success : colors.mutedText}
                    />
                    <Text
                      style={[
                        styles.taskText,
                        { color: colors.text },
                        isDone && [styles.taskTextDone, { color: colors.mutedText }]
                      ]}
                    >
                      {task}
                    </Text>
                  </View>
                </TouchableOpacity>
              </Swipeable>
            );
          })}
        </View>
      )}
    </View>
  );
}

function getDayName(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

function getDayNumber(dateStr: string): number {
  const d = new Date(dateStr + 'T00:00:00');
  return d.getDate();
}

function getMonth(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short' });
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    elevation: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: 4,
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  progressFill: {
    height: '100%'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  dateBadge: {
    alignItems: 'center',
    width: 58,
    marginRight: Spacing.md
  },
  dayName: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  dayNumber: {
    fontSize: FontSize.xxxl,
    fontWeight: '700',
    lineHeight: 34
  },
  month: {
    fontSize: FontSize.xs
  },
  headerContent: {
    flex: 1
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700'
  },
  taskMeta: {
    fontSize: FontSize.sm,
    marginTop: 4
  },
  actions: {
    flexDirection: 'row',
    gap: 4
  },
  iconBtn: {
    padding: 8,
    borderRadius: BorderRadius.md
  },
  expandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
    borderTopWidth: 1,
  },
  expandText: {
    fontWeight: '600',
    marginRight: 6
  },
  taskList: {
    marginTop: Spacing.xs,
    gap: Spacing.xs
  },
  taskItem: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm
  },
  taskText: {
    fontSize: FontSize.md,
    flex: 1
  },
  taskTextDone: {
    textDecorationLine: 'line-through'
  },
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderTopRightRadius: BorderRadius.md,
    borderBottomRightRadius: BorderRadius.md,
  },
});