// components/ui/AnimatedTimeline.tsx
import { Colors, FontSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TimelineNode {
  id: string;
  date: string;
  title: string;
  subtitle: string;
  isActive?: boolean;
  tasks?: string[];       // ← add
  completed?: number[];   // ← add
}

interface Props {
  node: TimelineNode;
  onToggleTask?: (nodeId: string, taskIndex: number) => void; // ← add
}

export default function AnimatedTimeline({ node, onToggleTask }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.nodeContainer}>
      <View style={styles.lineContainer}>
        <View style={styles.verticalLine} />
        <View style={[styles.dot, node.isActive && styles.dotActive]} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.date, { color: colors.mutedText }]}>{node.date}</Text>
        <Text style={[styles.title, { color: colors.text }]}>{node.title}</Text>

        {node.tasks && node.tasks.length > 0 && (
          <View style={styles.taskList}>
            {node.tasks.map((task, index) => {
              const isDone = (node.completed ?? []).includes(index);
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.taskRow}
                  onPress={() => onToggleTask?.(node.id, index)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isDone ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={isDone ? colors.success : colors.mutedText}
                  />
                  <Text style={[
                    styles.taskText,
                    { color: isDone ? colors.mutedText : colors.text },
                    isDone && styles.taskTextDone,
                  ]}>
                    {task}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  nodeContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.xs,
  },
  lineContainer: {
    alignItems: 'center',
    width: 24,
    marginRight: Spacing.md,
  },
  verticalLine: {
    position: 'absolute',
    top: 12,
    bottom: -32, // Reaches downward smoothly to connect with the next node row
    width: 2,
    backgroundColor: Colors.border,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.card,
    borderWidth: 3,
    borderColor: Colors.primary,
    zIndex: 1,
  },
  dotActive: {
    backgroundColor: Colors.primary,
  },
  content: {
    flex: 1,
    paddingTop: 2,
  },
  date: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginVertical: 4,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.mutedText,
  },
  taskList: {
    marginTop: Spacing.sm,
    gap: 6
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4
  },
  taskText: {
    fontSize: FontSize.sm,
    flex: 1
  },
  taskTextDone: {
    textDecorationLine: 'line-through'
  },
});