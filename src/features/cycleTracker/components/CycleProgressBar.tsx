import { Text, View } from 'react-native';

import { CycleProfile } from '../../../data/cycleData';
import { useColors } from '../../../styles/useAppStyles';

type Props = {
  cycleDay: number;
  nextPeriodInDays: number;
  profile: CycleProfile;
};

function getPhaseInfo(
  cycleDay: number,
  cycleLength: number,
  periodLength: number
): { label: string; color: string } {
  if (cycleDay <= periodLength) return { label: 'Menstruation', color: '#f06292' };
  if (cycleDay <= cycleLength - 16) return { label: 'Phase folliculaire', color: '#ce93d8' };
  if (cycleDay <= cycleLength - 12) return { label: 'Ovulation', color: '#ffb74d' };
  return { label: 'Phase lutéale', color: '#90caf9' };
}

export function CycleProgressBar({ cycleDay, nextPeriodInDays, profile }: Props) {
  const c = useColors();
  const { cycleLength, periodLength } = profile;

  const clampedDay = Math.max(1, Math.min(cycleDay, cycleLength));
  const phase = getPhaseInfo(clampedDay, cycleLength, periodLength);

  const follicularLength = Math.max(1, cycleLength - 16 - periodLength);
  const lutealLength = Math.max(1, 12 - 4);

  const countdownLabel =
    nextPeriodInDays === 0
      ? "aujourd'hui"
      : nextPeriodInDays === 1
        ? 'demain'
        : `dans ${nextPeriodInDays} j`;

  return (
    <View
      style={{
        marginHorizontal: 20,
        marginBottom: 12,
        backgroundColor: c.bgCard,
        borderRadius: 16,
        padding: 16,
        gap: 10,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: c.textPrimary, fontWeight: '700', fontSize: 13 }}>
          {phase.label}
        </Text>
        <Text style={{ color: c.textSecondary, fontSize: 12 }}>
          J{clampedDay} · prochaines règles {countdownLabel}
        </Text>
      </View>

      {/* Main fill bar */}
      <View
        style={{
          flexDirection: 'row',
          height: 8,
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <View style={{ flex: clampedDay, backgroundColor: phase.color }} />
        <View
          style={{
            flex: Math.max(0, cycleLength - clampedDay),
            backgroundColor: c.bgCardAlt,
          }}
        />
      </View>

      {/* Phase band reference */}
      <View style={{ flexDirection: 'row', height: 4, borderRadius: 2, overflow: 'hidden' }}>
        <View style={{ flex: periodLength, backgroundColor: '#f06292' }} />
        <View style={{ flex: follicularLength, backgroundColor: '#ce93d8' }} />
        <View style={{ flex: 4, backgroundColor: '#ffb74d' }} />
        <View style={{ flex: lutealLength, backgroundColor: '#90caf9' }} />
      </View>

      {/* Phase labels */}
      <View style={{ flexDirection: 'row' }}>
        <Text style={{ flex: periodLength, color: c.textTertiary, fontSize: 9 }}>Règles</Text>
        <Text style={{ flex: follicularLength, color: c.textTertiary, fontSize: 9 }}>
          Folliculaire
        </Text>
        <Text style={{ flex: 4, color: c.textTertiary, fontSize: 9 }}>Ovul.</Text>
        <Text
          style={{ flex: lutealLength, color: c.textTertiary, fontSize: 9, textAlign: 'right' }}
        >
          Lutéale
        </Text>
      </View>
    </View>
  );
}
