import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import { palette as c } from '@/constants/palette';

export function TaskProgress({ done, total, loaded }: {
  done: number;
  total: number;
  loaded: boolean;
}) {
  const percent = total ? Math.round(done / total * 100) : 0;
  const fill = useAnimatedStyle(() => ({
    width: withTiming(`${percent}%`, {
      duration: 450,
      reduceMotion: ReduceMotion.System,
    }),
  }));

  return (
    <View style={s.card}>
      <View pointerEvents="none" style={s.orbit} />
      <View style={s.top}>
        <View style={s.copy}>
          <Text style={s.eyebrow}>A LITTLE EVERY DAY</Text>
          <Text style={s.heading}>
            {total && done === total ? 'Look at you go.' : 'Small steps. Big calm.'}
          </Text>
        </View>
        <View style={s.badge}>
          <Text style={s.percent}>{percent}<Text style={s.sign}>%</Text></Text>
        </View>
      </View>
      <View
        accessibilityRole="progressbar"
        accessibilityLabel="Completed tasks"
        accessibilityValue={{ min: 0, max: total || 1, now: done }}
        style={s.track}
      >
        <Animated.View style={[s.fill, fill]} />
      </View>
      <View style={s.bottom}>
        <Text style={s.label}>
          {!loaded ? 'Loading your space…' : `${done} of ${total} tasks complete`}
        </Text>
        <Text style={s.sparkle}>✦</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: c.purple, borderRadius: 25, padding: 18, overflow: 'hidden', marginBottom: 22 },
  orbit: { position: 'absolute', height: 190, width: 190, borderRadius: 100, borderWidth: 30, borderColor: '#8256DD', right: -65, top: -70 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  copy: { flex: 1 },
  eyebrow: { color: '#EEE4FF', fontSize: 9, fontWeight: '600', letterSpacing: 1.5, marginBottom: 8 },
  heading: { color: c.white, fontSize: 19, fontWeight: '600', letterSpacing: -0.4 },
  badge: { minWidth: 52, minHeight: 52, padding: 8, borderRadius: 18, backgroundColor: '#885FE0', alignItems: 'center', justifyContent: 'center' },
  percent: { color: c.white, fontSize: 24, fontWeight: '700', letterSpacing: -0.9 },
  sign: { fontSize: 12, color: '#F5DBEE' },
  track: { height: 6, backgroundColor: '#926DE2', borderRadius: 6, marginTop: 16, marginBottom: 8, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 6, backgroundColor: c.pink },
  bottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { color: '#F5EBFF', fontSize: 11, flex: 1 },
  sparkle: { color: '#FFD3E9', fontSize: 19 },
});
