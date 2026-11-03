import { TaskProgress } from '@/components/task-progress';
import { TaskRow } from '@/components/task-row';
import { palette as c } from '@/constants/palette';
import { useTasks } from '@/hooks/use-tasks';
import { MAX_TASK_TITLE_LENGTH, type Task } from '@/storage/tasks';
import { useRef, useState, type ComponentRef } from 'react';
import { ActivityIndicator, FlatList, Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown, ReduceMotion, useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

type Filter = 'All' | 'Active' | 'Done';
export default function HomeScreen() {
  const { tasks, loading, loaded, saving, error, reload, update } = useTasks();
  const [draft, setDraft] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const [editing, setEditing] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const listRef = useRef<FlatList<Task>>(null);
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const reduceMotion = useReducedMotion();
  const blocked = !loaded || loading || saving;
  const done = tasks.filter(task => task.done).length;
  const visible = tasks.filter(task => filter === 'All' || (filter === 'Done' ? task.done : !task.done));
  async function submit() {
    const title = draft.trim();
    if (!title || blocked) return;
    const next = editing ? tasks.map(task => task.id === editing ? { ...task, title } : task)
      : [{ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, title, done: false }, ...tasks];
    if (await update(next)) { setDraft(''); setEditing(null); setFilter('All'); Keyboard.dismiss(); }
  }
  return <SafeAreaView style={s.safe}>
    <KeyboardAvoidingView style={s.page} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <FlatList ref={listRef} data={visible} keyExtractor={task => task.id} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={s.content} showsVerticalScrollIndicator={false}
        ListHeaderComponent={<>
          <View style={s.brandRow}>
            <View style={s.brand}><View style={s.logo}><Text style={s.logoMark}>✓</Text></View><Text style={s.brandName}>little list<Text style={s.brandDot}>.</Text></Text></View>
          </View>
          <Animated.View entering={FadeInDown.duration(400).reduceMotion(ReduceMotion.System)}>
            <Text style={s.eyebrow}>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase()}</Text>
            <Text accessibilityRole="header" style={s.heading}>Less Rush.{'\n'}<Text style={s.headingAccent}>More Intention.</Text></Text>
            <Text style={s.subtitle}>A little focus. A lighter day.</Text>
            <TaskProgress done={done} total={tasks.length} loaded={loaded} />
          </Animated.View>
          <View style={s.sectionRow}><Text accessibilityRole="header" style={s.section}>{editing ? 'Make it yours' : 'Your next small step'}</Text><Text style={s.sectionHint}>{editing ? 'EDITING' : 'ONE THING AT A TIME'}</Text></View>
          <View style={[s.composer, focused && s.composerFocused]}>
            <TextInput ref={inputRef} accessibilityLabel="Task title" placeholder={editing ? 'Update your task…' : 'What would you like to do?'} placeholderTextColor={c.muted} selectionColor={c.purple} style={s.input} value={draft} onChangeText={setDraft} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} maxLength={MAX_TASK_TITLE_LENGTH} returnKeyType="done" onSubmitEditing={submit} editable={!blocked} />
            <Pressable accessibilityRole="button" accessibilityLabel={editing ? 'Save task' : 'Add task'} accessibilityState={{ disabled: !draft.trim() || blocked }} disabled={!draft.trim() || blocked} onPress={submit} style={({ pressed }) => [s.add, (!draft.trim() || blocked) && s.disabled, pressed && s.pressed]}>{saving ? <ActivityIndicator color={c.white} /> : <Text style={s.addText}>{editing ? '✓' : '+'}</Text>}</Pressable>
          </View>
          {(editing || draft.length >= 160) && <View style={s.editorMeta}>
            {editing && <Pressable accessibilityRole="button" disabled={saving} onPress={() => { setEditing(null); setDraft(''); Keyboard.dismiss(); }} style={s.cancel}><Text style={s.link}>Cancel editing</Text></Pressable>}
            <Text style={s.counter}>{draft.length}/{MAX_TASK_TITLE_LENGTH}</Text>
          </View>}
          {error && <View style={s.errorBox}><Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={s.error}>{error}</Text>{!loaded && !loading && <Pressable accessibilityRole="button" onPress={reload} style={s.cancel}><Text style={s.link}>Try again</Text></Pressable>}</View>}
          <View style={s.listHeading}><Text accessibilityRole="header" style={s.section}>Your tasks</Text><Text style={s.taskCount}>{loaded ? `${tasks.length - done} remaining` : 'Loading…'}</Text></View>
          <View style={s.filters}>{(['All', 'Active', 'Done'] as const).map(value => <Pressable key={value} accessibilityRole="button" accessibilityLabel={`${value} tasks`} accessibilityState={{ selected: filter === value }} onPress={() => setFilter(value)} style={({ pressed }) => [s.filter, filter === value && s.selected, pressed && s.pressed]}>
            <Text style={[s.filterText, filter === value && s.selectedText]}>{value}</Text><Text style={[s.filterCount, filter === value && s.selectedCount]}>{value === 'All' ? tasks.length : value === 'Done' ? done : tasks.length - done}</Text>
          </Pressable>)}</View>
        </>}
        renderItem={({ item }) => <TaskRow task={item} blocked={blocked}
          onToggle={() => { void update(tasks.map(task => task.id === item.id ? { ...task, done: !task.done } : task)); }}
          onEdit={() => { setEditing(item.id); setDraft(item.title); listRef.current?.scrollToOffset({ offset: 0, animated: !reduceMotion }); inputRef.current?.focus(); }}
          onDelete={async () => { const saved = await update(tasks.filter(task => task.id !== item.id)); if (saved && editing === item.id) { setEditing(null); setDraft(''); } return saved; }} />}
        ListEmptyComponent={loading ? <ActivityIndicator style={s.empty} color={c.purple} /> : !loaded ? undefined : <Animated.View entering={FadeInDown.duration(250).reduceMotion(ReduceMotion.System)} style={s.empty}>
          <View style={s.emptyIcon}><Text style={s.emptyMark}>{filter === 'Active' && tasks.length ? '✓' : '✦'}</Text></View>
          <Text style={s.emptyTitle}>{filter === 'Done' ? 'Good things take small steps' : filter === 'Active' && tasks.length ? 'A little more breathing room' : 'Start with one little thing'}</Text>
          <Text style={s.emptyText}>{filter === 'Done' ? 'Finish a task and find your little wins here.' : filter === 'Active' && tasks.length ? 'You’ve done it all. Take a moment for yourself.' : 'Add a task above. The rest can follow.'}</Text>
        </Animated.View>}
        ListFooterComponent={<View style={s.footer}><View style={s.footerLine} /><Text style={s.footerText}>A little progress is still progress.</Text><View style={s.footerLine} /></View>} />
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },
  page: { flex: 1, width: '100%', maxWidth: 620, alignSelf: 'center' },
  content: { padding: 22, paddingTop: 16, paddingBottom: 32 },
  brandRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 22 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  logo: { width: 31, height: 31, borderRadius: 11, backgroundColor: c.purple, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-8deg' }] },
  logoMark: { fontSize: 19, color: c.white, fontWeight: '700' },
  brandName: { fontSize: 20, color: c.ink, fontWeight: '700', letterSpacing: -0.7 },
  brandDot: { color: c.purple },
  localBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: c.pinkLight, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20 },
  localDot: { height: 5, width: 5, borderRadius: 3, backgroundColor: c.pinkDark },
  localLabel: { fontSize: 10, fontWeight: '600', color: c.pinkDark },
  eyebrow: { color: c.muted, fontSize: 10, fontWeight: '600', letterSpacing: 1.6, marginBottom: 10 },
  heading: { color: c.ink, fontSize: 34, lineHeight: 39, fontWeight: '700', letterSpacing: -1.7 },
  headingAccent: { color: c.purple },
  subtitle: { color: c.muted, fontSize: 14, lineHeight: 22, marginTop: 8, marginBottom: 18 },
  sectionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  section: { color: c.ink, fontSize: 16, fontWeight: '700', letterSpacing: -0.3 },
  sectionHint: { color: c.muted, fontSize: 8, fontWeight: '600', letterSpacing: 0.8 },
  composer: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: c.white, borderRadius: 19, borderWidth: 1.5, borderColor: c.border, padding: 6 },
  composerFocused: { borderColor: c.purple },
  input: { flex: 1, minWidth: 0, minHeight: 46, fontSize: 14, color: c.ink, paddingHorizontal: 10, paddingVertical: 10 },
  add: { width: 46, height: 46, backgroundColor: c.purple, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  addText: { fontSize: 29, lineHeight: 34, color: c.white, fontWeight: '400' },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.75, transform: [{ scale: 0.96 }] },
  editorMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cancel: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 4 },
  link: { color: c.purpleDark, fontSize: 13, fontWeight: '600' },
  counter: { color: c.muted, fontSize: 11, marginLeft: 'auto' },
  errorBox: { backgroundColor: c.pinkLight, padding: 12, borderRadius: 14, marginTop: 12 },
  error: { color: c.pinkDark, fontSize: 13, lineHeight: 20 },
  listHeading: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center', justifyContent: 'space-between', marginTop: 26, marginBottom: 14 },
  taskCount: { color: c.muted, fontSize: 11 },
  filters: { flexDirection: 'row', backgroundColor: c.lavender, borderRadius: 16, padding: 4, gap: 4, marginBottom: 18 },
  filter: { flex: 1, minHeight: 44, paddingHorizontal: 4, paddingVertical: 8, borderRadius: 12, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 6 },
  selected: { backgroundColor: c.white, shadowColor: '#49217C', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 5, elevation: 2 },
  filterText: { color: c.muted, fontSize: 12, fontWeight: '600' },
  selectedText: { color: c.purpleDark },
  filterCount: { color: c.muted, fontSize: 10, fontWeight: '600', paddingHorizontal: 5, paddingVertical: 2, overflow: 'hidden', borderRadius: 6 },
  selectedCount: { backgroundColor: c.lavender, color: c.purpleDark },
  empty: { paddingVertical: 30, paddingHorizontal: 12, alignItems: 'center' },
  emptyIcon: { backgroundColor: c.pinkLight, width: 62, height: 62, borderRadius: 23, alignItems: 'center', justifyContent: 'center', marginBottom: 16, transform: [{ rotate: '-6deg' }] },
  emptyMark: { fontSize: 31, color: c.pinkDark },
  emptyTitle: { color: c.ink, fontSize: 17, fontWeight: '600', textAlign: 'center', marginBottom: 8 },
  emptyText: { color: c.muted, fontSize: 13, lineHeight: 21, textAlign: 'center' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingTop: 24 },
  footerLine: { height: 1, flex: 1, maxWidth: 28, backgroundColor: c.border },
  footerText: { color: c.muted, fontSize: 10, textAlign: 'center', flexShrink: 1 },
});
