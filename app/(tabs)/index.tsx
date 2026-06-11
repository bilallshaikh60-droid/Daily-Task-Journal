import DateSelectorField from '@/components/ui/DateSelectorField';
import EmptyState from '@/components/ui/EmptyState';
import FloatingAddButton from '@/components/ui/FloatingAddButton';
import InsightsCard from '@/components/ui/InsightsCard';
import ProgressRing from '@/components/ui/ProgressRing';
import ScreenHeader from '@/components/ui/ScreenHeader';
import TaskInputRow from '@/components/ui/TaskInputRow';
import TodayTaskList from '@/components/ui/TodayTaskList';
import { screenStyles } from '@/constants/styles';
import { Spacing } from '@/constants/theme';
import { getCompletedCount, TaskEntry } from '@/constants/types';
import { useTheme } from '@/context/ThemeContext';
import { useWorkingDays } from '@/context/WorkingDaysContext';
import { storage } from '@/services/storage';
import { generateInsights, getDayData, getTodayString } from '@/utils/helpers';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetBackdrop, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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
  const { workingDays, isLoaded } = useWorkingDays();

  // Bottom sheet ref and snap points
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['60%', '90%'], []);

  const dateRef = useRef(selectedDate);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [])
  );

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
    setTasks(prev => [...prev, { text: '', completed: false }]);
  }

  function updateTask(index: number, text: string) {
    setTasks(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], text };
      return updated;
    });
  }

  function removeTask(index: number) {
    setTasks(prev => prev.filter((_, i) => i !== index));
  }

  function toggleTaskCompleted(index: number) {
    setTasks(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], completed: !updated[index].completed };
      return updated;
    });
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

 const handleQuickAddToday = async () => {
    const today = getTodayString();
    await loadExistingTasks(today);
    dateRef.current = today;
    setSelectedDate(today);
    bottomSheetRef.current?.expand(); // ← open bottom sheet
  }

  function handleModalClose() {
    bottomSheetRef.current?.close(); // ← close bottom sheet
    setTasks([{ text: '', completed: false }]);
  }

  const todayEntry = entries.find(e => e.date === getTodayString());
  const todayCount = todayEntry ? todayEntry.tasks.length : 0;
  const todayDone = todayEntry ? getCompletedCount(todayEntry) : 0;
  const todayProgress = todayCount > 0 ? todayDone / todayCount : 0;
  const insights = generateInsights(entries);
  const dayData = getDayData(entries);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  const isEditing = !!entries.find(e => e.date === selectedDate);

  if (entries.length === 0) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView edges={['top', 'bottom']} style={[screenStyles.container, { backgroundColor: colors.background }]}>
          <View style={[screenStyles.container, { backgroundColor: colors.background }]}>
            <ScreenHeader
              title="Daily Task Journal"
              subtitle={new Date(getTodayString() + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            />
            <EmptyState onAddFirst={handleQuickAddToday} />
            <FloatingAddButton onPress={handleQuickAddToday} />
          </View>

          {/* Bottom Sheet */}
          <BottomSheet
            ref={bottomSheetRef}
            index={-1}
            snapPoints={snapPoints}
            enablePanDownToClose
            backdropComponent={renderBackdrop}
            backgroundStyle={{ backgroundColor: colors.card }}
            handleIndicatorStyle={{ backgroundColor: colors.mutedText }}
            keyboardBehavior="extend"
            keyboardBlurBehavior="restore"
          >
            <BottomSheetFlatList
              data={tasks}
              keyExtractor={(_, i) => `task-${i}`}
              contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: 40 }}
              keyboardShouldPersistTaps="handled"

              // ← Header contains title, date selector, badge
              ListHeaderComponent={
                <View>
                  {/* Title row */}
                  <View style={[screenStyles.modalHeader, { borderBottomColor: colors.border }]}>
                    <Text style={[screenStyles.modalTitle, { color: colors.text }]}>
                      {isEditing ? 'Edit Entry' : 'New Entry'}
                    </Text>
                    <TouchableOpacity onPress={handleModalClose} activeOpacity={0.7}>
                      <Ionicons name="close" size={24} color={colors.mutedText} />
                    </TouchableOpacity>
                  </View>

                  <DateSelectorField value={selectedDate} onChange={updateDate} />

                  {isEditing && (
                    <View style={[screenStyles.existingBadge, { backgroundColor: colors.cardLight }]}>
                      <Ionicons name="refresh-outline" size={14} color={colors.secondary} />
                      <Text style={[screenStyles.existingBadgeText, { color: colors.mutedText }]}>
                        Updating entry — {entries.find(e => e.date === selectedDate)?.tasks.length} tasks previously saved
                      </Text>
                    </View>
                  )}

                  <Text style={[screenStyles.sectionLabel, { color: colors.mutedText }]}>Tasks</Text>
                </View>
              }

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
                <View style={{ paddingTop: Spacing.sm, paddingBottom: Spacing.xl }}>
                  <TouchableOpacity
                    style={screenStyles.addTaskBtn}
                    onPress={addTaskField}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={18} color={colors.secondary} />
                    <Text style={[screenStyles.addTaskText, { color: colors.secondary }]}>Add Task</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[screenStyles.saveBtn, { backgroundColor: colors.primary }]}
                    onPress={handleSave}
                    activeOpacity={0.9}
                  >
                    <Ionicons name="save-outline" size={20} color="#fff" />
                    <Text style={screenStyles.saveBtnText}>
                      {isEditing ? 'Update Entry' : 'Save Entry'}
                    </Text>
                  </TouchableOpacity>
                </View>
              }
            />
          </BottomSheet>
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView edges={['top' , 'bottom']} style={[screenStyles.container, { backgroundColor: colors.background }]}>
        {/* Main content — edges top only, bottom handled by sheet */}
        <View style={[screenStyles.container, { backgroundColor: colors.background }]}>
          <ScreenHeader
            title="Daily Task Journal"
            subtitle={new Date(getTodayString() + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}
          />

          <FlatList
            data={['progress', 'insights', 'heatmap', 'today']}
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
              if (item === 'today' && todayEntry) {
                return (
                  <View style={[screenStyles.insightsSection, { paddingBottom: Spacing.md }]}>
                    <Text style={[screenStyles.sectionTitle, { color: colors.text }]}>Today's Tasks</Text>
                    <TodayTaskList
                      entry={todayEntry}
                      onToggleTask={async (index) => {
                        const completed = todayEntry.completed ?? [];
                        const updatedCompleted = completed.includes(index)
                          ? completed.filter(i => i !== index)
                          : [...completed, index];
                        await storage.saveEntry({ ...todayEntry, completed: updatedCompleted });
                        await loadEntries();
                      }}
                      onEdit={handleQuickAddToday}
                      onDelete={async (id) => {
                        await storage.deleteEntry(id);
                        await loadEntries();
                      }}
                    />
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

          <FloatingAddButton onPress={handleQuickAddToday} />
        </View>

        {/* Bottom Sheet — outside main content, inside SafeAreaView */}
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose
          backdropComponent={renderBackdrop}
          backgroundStyle={{ backgroundColor: colors.card }}
          handleIndicatorStyle={{ backgroundColor: colors.mutedText }}
          keyboardBehavior="extend"
          keyboardBlurBehavior="restore"
        >
          <BottomSheetFlatList
            data={tasks}
            keyExtractor={(_, i) => `task-${i}`}
            contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"

            // ← Header contains title, date selector, badge
            ListHeaderComponent={
              <View>
                {/* Title row */}
                <View style={[screenStyles.modalHeader, { borderBottomColor: colors.border }]}>
                  <Text style={[screenStyles.modalTitle, { color: colors.text }]}>
                    {isEditing ? 'Edit Entry' : 'New Entry'}
                  </Text>
                  <TouchableOpacity onPress={handleModalClose} activeOpacity={0.7}>
                    <Ionicons name="close" size={24} color={colors.mutedText} />
                  </TouchableOpacity>
                </View>

                <DateSelectorField value={selectedDate} onChange={updateDate} />

                {isEditing && (
                  <View style={[screenStyles.existingBadge, { backgroundColor: colors.cardLight }]}>
                    <Ionicons name="refresh-outline" size={14} color={colors.secondary} />
                    <Text style={[screenStyles.existingBadgeText, { color: colors.mutedText }]}>
                      Updating entry — {entries.find(e => e.date === selectedDate)?.tasks.length} tasks previously saved
                    </Text>
                  </View>
                )}

                <Text style={[screenStyles.sectionLabel, { color: colors.mutedText }]}>Tasks</Text>
              </View>
            }

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
              <View style={{ paddingTop: Spacing.sm, paddingBottom: Spacing.xl }}>
                <TouchableOpacity
                  style={screenStyles.addTaskBtn}
                  onPress={addTaskField}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={18} color={colors.secondary} />
                  <Text style={[screenStyles.addTaskText, { color: colors.secondary }]}>Add Task</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[screenStyles.saveBtn, { backgroundColor: colors.primary }]}
                  onPress={handleSave}
                  activeOpacity={0.9}
                >
                  <Ionicons name="save-outline" size={20} color="#fff" />
                  <Text style={screenStyles.saveBtnText}>
                    {isEditing ? 'Update Entry' : 'Save Entry'}
                  </Text>
                </TouchableOpacity>
              </View>
            }
          />
        </BottomSheet>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}