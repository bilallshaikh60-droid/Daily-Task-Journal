import DateSelectorField from '@/components/ui/DateSelectorField';
import EmptyState from '@/components/ui/EmptyState';
import FloatingAddButton from '@/components/ui/FloatingAddButton';
import InsightsCard from '@/components/ui/InsightsCard';
import ProgressRing from '@/components/ui/ProgressRing';
import ScreenHeader from '@/components/ui/ScreenHeader';
import TaskInputRow from '@/components/ui/TaskInputRow';
import { screenStyles } from '@/constants/styles';
import { getCompletedCount, TaskEntry } from '@/constants/types';
import { useTheme } from '@/context/ThemeContext';
import { useWorkingDays } from '@/context/WorkingDaysContext';
import { storage } from '@/services/storage';
import { generateInsights, getDayData, getTodayString } from '@/utils/helpers';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

let idCounter = 0;
function generateId(): string {
  idCounter += 1;
  return Date.now().toString(36) + idCounter.toString(36) + Math.random().toString(36).substring(2, 9);
}

type TaskDraft = { text: string; completed: boolean };

export default function HomeScreen() {
  const [tasks, setTasks] = useState<TaskDraft[]>([{ text: '', completed: false }]);
  const { colors, isDark } = useTheme();
  const [entries, setEntries] = useState<TaskEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [showModal, setShowModal] = useState(false);

  const dateRef = useRef(selectedDate);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [])
  );

  useEffect(() => {
    if (showModal) {
      loadExistingTasks(selectedDate);
    }
  }, [selectedDate, showModal]);

  async function loadEntries() {
    const all = await storage.getAllEntries();
    setEntries(all);
  }

  function updateDate(dateStr: string) {
    dateRef.current = dateStr;
    setSelectedDate(dateStr);
    loadExistingTasks(dateStr);
  }

  async function loadExistingTasks(date: string) {
    const existing = await storage.getEntryByDate(date);
    if (existing && existing.tasks.length > 0) {
      setTasks(
        existing.tasks.map((text, i) => ({
          text,
          completed: (existing.completed ?? []).includes(i),
        }))
      );
    } else {
      setTasks([{ text: '', completed: false }]);
    }
  }

  function addTaskField() {
    setTasks([...tasks, { text: '', completed: false }]);
  }

  function updateTask(index: number, text: string) {
    const updated = [...tasks];
    updated[index] = { ...updated[index], text };
    setTasks(updated);
  }

  function removeTask(index: number) {
    setTasks(tasks.filter((_, i) => i !== index));
  }

  function toggleTaskCompleted(index: number) {
    const updated = [...tasks];
    updated[index] = { ...updated[index], completed: !updated[index].completed };
    setTasks(updated);
  }

  async function handleSave() {
    const saveDate = selectedDate;
    const validTasks = tasks.filter(t => t.text.trim().length > 0);

    if (validTasks.length === 0) {
      const entryForDate = await storage.getEntryByDate(saveDate);
      if (!entryForDate) {
        Alert.alert('No tasks', 'Please add at least one task.');
        return;
      }
      await storage.deleteEntry(entryForDate.id);
      await loadEntries();
      setTasks([{ text: '', completed: false }]);
      handleModalClose();
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const existing = await storage.getEntryByDate(saveDate);
    const taskTexts = validTasks.map(t => t.text.trim());
    const preCompleted = validTasks
      .map((t, i) => (t.completed ? i : -1))
      .filter(i => i !== -1);

    const entry: TaskEntry = {
      id: existing ? existing.id : generateId(),
      date: saveDate,
      tasks: taskTexts,
      completed: preCompleted,
    };

    await storage.saveEntry(entry);
    await loadEntries();
    setTasks([{ text: '', completed: false }]);
    handleModalClose();
  }

  async function handleQuickAddToday() {
    const today = getTodayString();
    await loadExistingTasks(today);
    dateRef.current = today;
    setSelectedDate(today);
    setShowModal(true);
  }

  async function handleModalClose() {
    setShowModal(false);
    setTasks([{ text: '', completed: false }]);
  }

  const todayEntry = entries.find(e => e.date === getTodayString());
  const todayCount = todayEntry ? todayEntry.tasks.length : 0;
  const todayDone = todayEntry ? getCompletedCount(todayEntry) : 0;
  const todayProgress = todayCount > 0 ? todayDone / todayCount : 0;
  const insights = generateInsights(entries);
  const dayData = getDayData(entries);

  const { workingDays, isLoaded } = useWorkingDays();

  const renderModal = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={screenStyles.modalOverlay}
    >
      <View style={[screenStyles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.3)' }]}>
        <View style={[screenStyles.modalContent, { backgroundColor: colors.card }]}>
          <View style={[screenStyles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[screenStyles.modalTitle, { color: colors.text }]}>
              {entries.find(e => e.date === selectedDate) ? 'Edit Entry' : 'New Entry'}
            </Text>
            <TouchableOpacity onPress={handleModalClose} activeOpacity={0.7}>
              <Ionicons name="close" size={24} color={colors.mutedText} />
            </TouchableOpacity>
          </View>

          <DateSelectorField value={selectedDate} onChange={updateDate} />

          {entries.find(e => e.date === selectedDate) && (
            <View style={[screenStyles.existingBadge, { backgroundColor: colors.cardLight }]}>
              <Ionicons name="refresh-outline" size={14} color={colors.secondary} />
              <Text style={[screenStyles.existingBadgeText, { color: colors.mutedText }]}>
                Updating entry — {entries.find(e => e.date === selectedDate)?.tasks.length} tasks previously saved
              </Text>
            </View>
          )}

          <Text style={[screenStyles.sectionLabel, { color: colors.mutedText }]}>Tasks</Text>
          <FlatList
            data={tasks}
            keyExtractor={(item, i) => `task-${i}`}
            style={screenStyles.taskList}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item, index }) => (
              <TaskInputRow
                value={item.text}
                onChange={(t) => updateTask(index, t)}
                onDelete={() => removeTask(index)}
                index={index}
                completed={item.completed}
                onToggleComplete={() => toggleTaskCompleted(index)}
              />
            )}
            ListFooterComponent={
              <TouchableOpacity style={screenStyles.addTaskBtn} onPress={addTaskField} activeOpacity={0.7}>
                <Ionicons name="add" size={18} color={colors.secondary} />
                <Text style={[screenStyles.addTaskText, { color: colors.secondary }]}>Add Task</Text>
              </TouchableOpacity>
            }
          />

          <TouchableOpacity style={[screenStyles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSave} activeOpacity={0.9}>
            <Ionicons name="save-outline" size={20} color="#fff" />
            <Text style={screenStyles.saveBtnText}>
              {entries.find(e => e.date === selectedDate) ? 'Update Entry' : 'Save Entry'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );

  if (entries.length === 0 && !showModal) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={[screenStyles.container, { backgroundColor: colors.background }]}>
        <View style={[screenStyles.container, { backgroundColor: colors.background }]}>
          <ScreenHeader title="Daily Task Journal" subtitle={new Date(getTodayString() + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} />
          <EmptyState onAddFirst={handleQuickAddToday} />
          <FloatingAddButton onPress={handleQuickAddToday} />
        </View> 
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView edges={['top', 'bottom']} style={[screenStyles.container, { backgroundColor: colors.background }]}>
      <View
        style={[screenStyles.container, { backgroundColor: colors.background }]}
        accessibilityElementsHidden={showModal}
        importantForAccessibility={showModal ? 'no-hide-descendants' : 'yes'}
      >
        <ScreenHeader title="Daily Task Journal" subtitle={new Date(getTodayString() + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} />

        <FlatList
          data={['progress', 'heatmap', 'insights']}
          keyExtractor={item => item}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            if (item === 'progress') {
              return (
                <View style={screenStyles.progressSection}>
                  <ProgressRing
                    progress={todayCount > 0 ? todayProgress : 0}
                    label={todayCount > 0 ? `${todayDone}/${todayCount}` : '0'}
                    sublabel={todayCount > 0 ? 'tasks done' : 'tasks today'}
                  />
                  <TouchableOpacity
                    style={[screenStyles.quickAddBtn, { backgroundColor: colors.card, borderColor: colors.primary }]}
                    onPress={handleQuickAddToday}
                    activeOpacity={0.8}
                  >
                    <Text style={[screenStyles.quickAddBtnText, { color: colors.primary }]}>
                      {todayEntry ? 'Update Today' : 'Log Today'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            }
            if (item === 'insights' && insights.length > 0) {
              return (
                <View style={screenStyles.insightsSection}>
                  <Text style={[screenStyles.sectionTitle, { color: colors.text }]}>Insights</Text>
                  {insights.map((insight, i) => (
                    <InsightsCard
                      key={i}
                      icon={i === 0 ? 'stats-chart' : i === 1 ? 'trophy' : 'flash'}
                      text={insight}
                      color={i === 0 ? colors.secondary : i === 1 ? '#FBBF24' : colors.primary}
                      index={i}
                    />
                  ))}
                </View>
              );
            }
            return null;
          }}
          ListFooterComponent={<View style={{ height: 140 }} />}
        />

        {!showModal && <FloatingAddButton onPress={handleQuickAddToday} />}
      </View>

      {showModal && renderModal()}
    </SafeAreaView>
  );
}
