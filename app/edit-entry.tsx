import DateSelectorField from '@/components/ui/DateSelectorField';
import TaskInputRow from '@/components/ui/TaskInputRow';
import { editEntryStyles } from '@/constants/styles';
import { TaskEntry, toLocalDateString } from '@/constants/types';
import { useTheme } from '@/context/ThemeContext';
import { storage } from '@/services/storage';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditEntryScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { id, date: paramDate } = useLocalSearchParams<{ id: string; date: string }>();
  const [selectedDate, setSelectedDate] = useState(paramDate || toLocalDateString(new Date()));
  const [tasks, setTasks] = useState<string[]>(['']);
  const dateRef = useRef(selectedDate);

  async function loadEntry() {
    const entries = await storage.getAllEntries();
    const entry = entries.find(e => e.id === id);
    if (entry) {
      dateRef.current = entry.date;
      setSelectedDate(entry.date);
      setTasks(entry.tasks.length > 0 ? entry.tasks : ['']);
    }
  }

  useEffect(() => {
    if (id) {
      loadEntry();
    }
  }, [id]);

  function updateDate(dateStr: string) {
    dateRef.current = dateStr;
    setSelectedDate(dateStr);
  }

  function addTaskField() {
    setTasks([...tasks, '']);
  }

  function updateTask(index: number, text: string) {
    const updated = [...tasks];
    updated[index] = text;
    setTasks(updated);
  }

  function removeTask(index: number) {
    setTasks(tasks.filter((_, i) => i !== index));
  }

  async function handleSave() {
    const saveDate = dateRef.current;
    const validTasks = tasks.filter(t => t.trim().length > 0);
    if (validTasks.length === 0) {
      Alert.alert('No tasks', 'Please add at least one task.');
      return;
    }

    const existing = await storage.getEntryByDate(saveDate);
    const entry: TaskEntry = {
      id: id || existing?.id || Date.now().toString(36) + Math.random().toString(36).substring(2, 9),
      date: saveDate,
      tasks: validTasks,
    };

    await storage.saveEntry(entry);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/');
    }
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[editEntryStyles.container, { backgroundColor: colors.background }]}>
      <View style={editEntryStyles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.push('/')} activeOpacity={0.7}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[editEntryStyles.title, { color: colors.text }]}>{id ? 'Edit Entry' : 'New Entry'}</Text>
        <TouchableOpacity onPress={handleSave} activeOpacity={0.7}>
          <Ionicons name="checkmark" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <DateSelectorField value={selectedDate} onChange={updateDate} />

      <Text style={[editEntryStyles.sectionLabel, { color: colors.mutedText }]}>Tasks</Text>
      <FlatList
        data={tasks}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <TaskInputRow
            value={item}
            onChange={(t) => updateTask(index, t)}
            onDelete={() => removeTask(index)}
            index={index}
          />
        )}
        ListFooterComponent={
          <TouchableOpacity style={editEntryStyles.addTaskBtn} onPress={addTaskField} activeOpacity={0.7}>
            <Ionicons name="add" size={18} color={colors.secondary} />
            <Text style={[editEntryStyles.addTaskText, { color: colors.secondary }]}>Add Task</Text>
          </TouchableOpacity>
        }
      />
    </SafeAreaView>
  );
}
