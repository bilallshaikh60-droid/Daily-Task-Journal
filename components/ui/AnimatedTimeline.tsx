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
  tasks?: string[];
  completed?: number[];
  doneCount?: number;
  pendingCount: number;
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
        <View style={styles.badgeRow}>
          {(node.doneCount ?? 0) > 0 && (
            <View style={[styles.badge, styles.badgeDone]}>
              <Ionicons name="checkmark-circle" size={13} color="#16a34a" />
              <Text style={styles.badgeTextDone}>{node.doneCount} completed</Text>
            </View>
          )}
          {(node.pendingCount ?? 0) > 0 && (
            <View style={[styles.badge, styles.badgePending]}>
              <Ionicons name="time-outline" size={13} color="#dc2626" />
              <Text style={styles.badgeTextPending}>{node.pendingCount} pending</Text>
            </View>
          )}
          {(node.doneCount === 0 && node.pendingCount === 0) && (
            <Text style={[styles.title, { color: colors.text }]}>{node.title}</Text>
          )}
        </View>
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
  badgeRow: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 6,
  marginVertical: 4,
},
badge: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
  paddingHorizontal: 8,
  paddingVertical: 3,
  borderRadius: 999,
},
badgeDone: {
  backgroundColor: '#dcfce7', // light green
},
badgePending: {
  backgroundColor: '#fee2e2', // light red
},
badgeTextDone: {
  fontSize: FontSize.xs,
  fontWeight: '600',
  color: '#16a34a', // dark green text
},
badgeTextPending: {
  fontSize: FontSize.xs,
  fontWeight: '600',
  color: '#dc2626', // dark red text
},
});