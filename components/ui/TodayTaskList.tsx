// components/ui/TodayTaskList.tsx
import { BorderRadius, FontSize, Spacing } from '@/constants/theme';
import { TaskEntry } from '@/constants/types';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  entry: TaskEntry;
  onToggleTask: (index: number) => void;
  onEdit: () => void;        
  onDelete: (id: string) => void; 
}

export default function TodayTaskList({ entry, onToggleTask, onEdit, onDelete }: Props) {
  const { colors } = useTheme();
  const { tasks, completed = [] } = entry;

  if (tasks.length === 0) return null;

  return (
    <View style={styles.container}>

      {/* Header row with edit/delete */}
      <View style={styles.headerRow}>
        <Text style={[styles.meta, { color: colors.mutedText }]}>
          {completed.length}/{tasks.length} completed
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={onEdit}
            style={[styles.actionBtn, { backgroundColor: colors.cardLight, borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <Ionicons name="pencil" size={16} color={colors.secondary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onDelete(entry.id)}
            style={[styles.actionBtn, { backgroundColor: colors.cardLight, borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={16} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Task list */}
      {tasks.map((task, index) => {
        const isDone = completed.includes(index);
        return (
          <TouchableOpacity
            key={`${index}-${task.substring(0, 20)}`}
            style={[styles.taskItem, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => onToggleTask(index)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isDone ? 'checkmark-circle' : 'ellipse-outline'}
              size={22}
              color={isDone ? colors.success : colors.mutedText}
            />
            <Text
              style={[
                styles.taskText,
                { color: isDone ? colors.mutedText : colors.text },
                isDone && styles.taskTextDone,
              ]}
            >
              {task}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  meta: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  taskText: {
    fontSize: FontSize.md,
    flex: 1,
  },
  taskTextDone: {
    textDecorationLine: 'line-through',
  },
});