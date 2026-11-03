import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ReduceMotion, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { palette as c } from '@/constants/palette';
import type { Task } from '@/storage/tasks';

export function TaskRow({ task, blocked, onToggle, onEdit, onDelete }: {
  task: Task; blocked: boolean; onToggle: () => void; onEdit: () => void; onDelete: () => Promise<boolean>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const checkStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(task.done ? c.purple : c.white, { duration: 180, reduceMotion: ReduceMotion.System }),
    transform: [{ scale: withTiming(task.done ? 1 : 0.92, { duration: 180, reduceMotion: ReduceMotion.System }) }],
  }));
  return (
    <Animated.View entering={FadeInDown.duration(220).reduceMotion(ReduceMotion.System)} style={[s.card, task.done && s.doneCard]}>
      <View style={s.row}>
        <Pressable accessibilityRole="checkbox" accessibilityLabel={task.title} accessibilityHint={task.done ? 'Mark as active' : 'Mark as complete'} accessibilityState={{ checked: task.done, disabled: blocked }} disabled={blocked} onPress={onToggle} style={({ pressed }) => [s.toggle, pressed && s.pressed]}>
          <Animated.View style={[s.check, checkStyle]}><Text style={s.tick}>{task.done ? '✓' : ''}</Text></Animated.View>
          <Text style={[s.title, task.done && s.done]}>{task.title}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={`Options for ${task.title}`} accessibilityState={{ expanded, disabled: blocked }} disabled={blocked} onPress={() => { setExpanded(!expanded); setConfirming(false); }} style={({ pressed }) => [s.more, pressed && s.pressed]}>
          <Text style={s.dots}>···</Text>
        </Pressable>
      </View>
      {expanded && <View style={s.actions}>
        {confirming ? <>
          <Text style={s.prompt}>Delete this task?</Text>
          <View style={s.buttons}>
            <Pressable accessibilityRole="button" accessibilityLabel="Cancel deletion" disabled={blocked} style={s.action} onPress={() => setConfirming(false)}><Text style={s.actionText}>Keep task</Text></Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel={`Confirm delete ${task.title}`} disabled={blocked} style={[s.action, s.delete]} onPress={async () => { await onDelete(); }}><Text style={s.deleteText}>Delete</Text></Pressable>
          </View>
        </> : <View style={s.buttons}>
          <Pressable accessibilityRole="button" accessibilityLabel={`Edit ${task.title}`} disabled={blocked} style={s.action} onPress={() => { setExpanded(false); onEdit(); }}><Text style={s.actionText}>Edit task</Text></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={`Delete ${task.title}`} disabled={blocked} style={s.action} onPress={() => setConfirming(true)}><Text style={s.deleteText}>Delete task</Text></Pressable>
        </View>}
      </View>}
    </Animated.View>
  );
}
const s = StyleSheet.create({
  card: { backgroundColor: c.white, borderWidth: 1, borderColor: c.border, borderRadius: 22, marginBottom: 10, overflow: 'hidden' },
  doneCard: { backgroundColor: '#F7F3FC' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  toggle: { flex: 1, minHeight: 76, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 14 },
  check: { width: 26, height: 26, borderWidth: 1.5, borderColor: '#BFA9E3', borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  tick: { color: c.white, fontWeight: '700', fontSize: 16 },
  title: { flex: 1, fontSize: 16, lineHeight: 23, color: c.ink, fontWeight: '500' },
  done: { color: c.muted, textDecorationLine: 'line-through' },
  more: { minWidth: 44, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 14 },
  dots: { fontSize: 30, lineHeight: 32, color: c.muted, fontWeight: '700' },
  pressed: { opacity: 0.6, transform: [{ scale: 0.98 }] },
  actions: { padding: 12, borderTopWidth: 1, borderColor: c.border },
  buttons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end' },
  action: { minHeight: 44, paddingHorizontal: 16, justifyContent: 'center', borderRadius: 12, backgroundColor: c.lavender },
  actionText: { color: c.purpleDark, fontWeight: '600', fontSize: 13 },
  delete: { backgroundColor: c.pinkLight },
  deleteText: { color: c.pinkDark, fontWeight: '600', fontSize: 13 },
  prompt: { color: c.ink, fontSize: 14, marginBottom: 8, paddingHorizontal: 4 },
});
