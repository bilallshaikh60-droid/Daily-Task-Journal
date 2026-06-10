import AnimatedTimeline from '@/components/ui/AnimatedTimeline';
import EmptyState from '@/components/ui/EmptyState';
import EntryCard from '@/components/ui/EntryCard';
import FloatingAddButton from '@/components/ui/FloatingAddButton'; // ← add
import ScreenHeader from '@/components/ui/ScreenHeader';
import { historyStyles } from '@/constants/styles';
import { TaskEntry } from '@/constants/types';
import { useTheme } from '@/context/ThemeContext';
import { storage } from '@/services/storage';
import { formatTimelineDate } from '@/utils/helpers';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

function handleEdit(entry: TaskEntry) {
  router.push(`/edit-entry?id=${entry.id}&date=${entry.date}`);
}

export default function HistoryScreen() {
  const { colors } = useTheme();
  const [entries, setEntries] = useState<TaskEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'timeline'>('cards');
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [])
  );

  async function loadEntries() {
    const all = await storage.getAllEntries();
    setEntries(all);
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadEntries();
    setRefreshing(false);
  }

  async function handleSearch(text: string) {
    setSearchQuery(text);
    if (text.trim()) {
      setEntries(await storage.searchEntries(text));
    } else {
      await loadEntries();
    }
  }

  const refreshAfterAction = async () => {
    if (searchQuery.trim()) {
      setEntries(await storage.searchEntries(searchQuery));
    } else {
      await loadEntries();
    }
  };

  async function handleDeleteEntry(id: string) {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;
    Alert.alert(
      'Delete Entry',
      `Delete entire entry for ${entry.date}? (${entry.tasks.length} tasks)`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await storage.deleteEntry(entry.id);
            await refreshAfterAction();
          },
        },
      ]
    );
  }

  async function handleRemoveTask(entry: TaskEntry, taskIndex: number) {
    const taskTitle = entry.tasks[taskIndex];
    Alert.alert('Delete Task', `Permanently delete "${taskTitle}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await storage.removeTaskFromEntry(entry.id, taskIndex);
          await refreshAfterAction();
        },
      },
    ]);
  }

  async function handleToggleTask(entry: TaskEntry, taskIndex: number) {
    const completed = entry.completed ?? [];
    const updatedCompleted = completed.includes(taskIndex)
      ? completed.filter(i => i !== taskIndex)
      : [...completed, taskIndex];

    await storage.saveEntry({ ...entry, completed: updatedCompleted });
    await refreshAfterAction();
  }

  const sortedEntries = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  if (entries.length === 0 && !searchQuery) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={[historyStyles.container, { backgroundColor: colors.background }]}>
        <View style={{ flex: 1 }}>  
          <ScreenHeader title="History" />
          <EmptyState onAddFirst={() => router.push('/')} />
          <FloatingAddButton onPress={() => router.push('/')} /> 
        </View>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView edges={['top', 'bottom']} style={[historyStyles.container, { backgroundColor: colors.background }]}>
         <View style={{ flex: 1 }}>
        <ScreenHeader title="History" subtitle={`${sortedEntries.length} entries`} />

        <View style={historyStyles.searchContainer}>
          <View style={[historyStyles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="search" size={18} color={colors.mutedText} />
            <TextInput
              style={[historyStyles.searchInput, { color: colors.text }]}
              value={searchQuery}
              onChangeText={handleSearch}
              placeholder="Search dates or tasks..."
              placeholderTextColor={colors.mutedText}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <Ionicons name="close-circle" size={20} color={colors.mutedText} />
              </TouchableOpacity>
            )}
          </View>

          <View style={[historyStyles.viewToggle, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity
              style={[historyStyles.toggleBtn, viewMode === 'cards' && { backgroundColor: colors.cardLight }]}
              onPress={() => setViewMode('cards')}
            >
              <Ionicons
                name="grid-outline"
                size={20}
                color={viewMode === 'cards' ? colors.primary : colors.mutedText}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[historyStyles.toggleBtn, viewMode === 'timeline' && { backgroundColor: colors.cardLight }]}
              onPress={() => setViewMode('timeline')}
            >
              <Ionicons
                name="time-outline"
                size={20}
                color={viewMode === 'timeline' ? colors.primary : colors.mutedText}
              />
            </TouchableOpacity>
          </View>
        </View>

        {viewMode === 'cards' ? (
          <FlatList
            data={sortedEntries}
            keyExtractor={(item) => item.id}
            contentContainerStyle={historyStyles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
            }
            renderItem={({ item }) => (
              <EntryCard
                entry={item}
                onEdit={handleEdit}
                onDelete={handleDeleteEntry}
                onRemoveTask={(index) => handleRemoveTask(item, index)}
                onToggleTask={(index) => handleToggleTask(item, index)}
              />
            )}
            ListFooterComponent={<View style={{ height: 140 }} />}

          />

        ) : (
          <FlatList
            data={sortedEntries}
            keyExtractor={(item) => `timeline-${item.id}`}
            contentContainerStyle={historyStyles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
            }
            renderItem={({ item }) => (
              <AnimatedTimeline
                node={{
                  id: item.id,
                  date: formatTimelineDate(item.date),
                  title: `${item.tasks.length} tasks completed`,
                  subtitle: item.date,
                  isActive: true,
                  tasks: item.tasks,
                  completed: item.completed,
                }}
                onToggleTask={(_, taskIndex) => handleToggleTask(item, taskIndex)}
              />
            )}
            ListFooterComponent={<View style={{ height: 140 }} />}
          />
        )}
        <FloatingAddButton onPress={() => router.push('/')} />
      </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
