import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Animated, Pressable, Text, TextInput, View } from 'react-native';

import { EditorLabel, SectionTitle, SelectChip } from '../../../components/ui';
import { MedicalReminderFormState, MedicalReminderItem } from '../../../data/cycleData';
import { formatDateLongWithYear } from '../../../lib/cycle';
import { useAppStyles, useColors } from '../../../styles/useAppStyles';
import { medicalReminderOptions } from '../constants';
import { getMedicalReminderCategoryLabel } from '../helpers';

type MedicalRemindersTabProps = {
  medicalReminderForm: MedicalReminderFormState;
  medicalReminders: MedicalReminderItem[];
  medicalReminderMessage: string;
  onMedicalReminderFieldChange: (patch: Partial<MedicalReminderFormState>) => void;
  formatDateTyping: (value: string) => string;
  onSaveMedicalReminder: () => void;
  onDeleteMedicalReminder: (id: string) => void;
  onToggleMedicalReminderCompleted: (id: string) => void;
};

function ReminderRow({
  item,
  onDelete,
  onToggle,
  styles,
}: {
  item: MedicalReminderItem;
  onDelete: () => void;
  onToggle: () => void;
  styles: ReturnType<typeof useAppStyles>;
}) {
  const c = useColors();
  const renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0.5],
      extrapolate: 'clamp',
    });
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Supprimer ${item.title}`}
        onPress={onDelete}
        style={{
          backgroundColor: c.errorFg,
          justifyContent: 'center',
          alignItems: 'center',
          width: 80,
          borderRadius: 12,
          marginBottom: 10,
        }}
      >
        <Animated.Text
          style={{
            color: c.textOnDark,
            fontWeight: '700',
            fontSize: 13,
            transform: [{ scale }],
          }}
        >
          Supprimer
        </Animated.Text>
      </Pressable>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions} overshootRight={false}>
      <View
        style={[
          styles.medicalReminderItem,
          item.completed && { opacity: 0.5 },
        ]}
      >
        <View style={styles.medicalReminderHeader}>
          <View style={styles.medicalReminderHeading}>
            <Text
              style={[
                styles.medicalReminderTitle,
                item.completed && { textDecorationLine: 'line-through' },
              ]}
            >
              {item.title}
            </Text>
            <Text style={styles.medicalReminderCategory}>
              {getMedicalReminderCategoryLabel(item.category)}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={item.completed ? 'Marquer comme non fait' : 'Marquer comme fait'}
            accessibilityState={{ checked: item.completed }}
            onPress={onToggle}
            hitSlop={8}
            style={{
              width: 26,
              height: 26,
              borderRadius: 13,
              borderWidth: 2,
              borderColor: item.completed ? '#2ecc71' : c.border,
              backgroundColor: item.completed ? '#2ecc71' : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {item.completed && (
              <Text style={{ color: c.textOnDark, fontSize: 13, fontWeight: '800' }}>✓</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.detailBadgeRow}>
          <View style={styles.detailBadge}>
            <Text style={styles.detailBadgeText}>
              {item.appointmentDate
                ? `RDV ${formatDateLongWithYear(item.appointmentDate)}`
                : 'Sans date'}
            </Text>
          </View>
          <View style={[styles.detailBadge, styles.detailBadgeSoft]}>
            <Text style={styles.detailBadgeText}>
              {item.reminderDate
                ? `Rappel ${formatDateLongWithYear(item.reminderDate)}`
                : 'Rappel à définir'}
            </Text>
          </View>
        </View>

        {Boolean(item.notes.trim()) && (
          <Text style={styles.medicalReminderNotes}>{item.notes}</Text>
        )}
      </View>
    </Swipeable>
  );
}

export function MedicalRemindersTab({
  medicalReminderForm,
  medicalReminders,
  medicalReminderMessage,
  onMedicalReminderFieldChange,
  formatDateTyping,
  onSaveMedicalReminder,
  onDeleteMedicalReminder,
  onToggleMedicalReminderCompleted,
}: MedicalRemindersTabProps) {
  const styles = useAppStyles();
  const c = useColors();
  return (
    <View style={styles.section}>
      <SectionTitle
        title="Rendez-vous médicaux"
        subtitle="Ajoute ici tes rendez-vous médicaux, avec une date de rappel si besoin."
      />
      <View style={styles.editorCard}>
        <EditorLabel label="Type de rendez-vous" />
        <View style={styles.optionWrap}>
          {medicalReminderOptions.map((option) => (
            <SelectChip
              key={option.value}
              label={option.label}
              selected={medicalReminderForm.category === option.value}
              onPress={() => onMedicalReminderFieldChange({ category: option.value })}
            />
          ))}
        </View>

        {medicalReminderForm.category === 'other' && (
          <>
            <EditorLabel label="Intitulé personnalisé" />
            <TextInput
              style={styles.textInput}
              value={medicalReminderForm.customTitle}
              onChangeText={(value) => onMedicalReminderFieldChange({ customTitle: value })}
              placeholder="Ex. Consultation dermatologue"
              placeholderTextColor={c.placeholder}
            />
          </>
        )}

        <EditorLabel label="Date du rendez-vous" />
        <TextInput
          style={styles.textInput}
          value={medicalReminderForm.appointmentDate}
          onChangeText={(value) =>
            onMedicalReminderFieldChange({ appointmentDate: formatDateTyping(value) })
          }
          placeholder="JJ/MM/AAAA"
          placeholderTextColor={c.placeholder}
          autoCapitalize="none"
          keyboardType="number-pad"
          maxLength={10}
        />

        <EditorLabel label="Date du rappel" />
        <TextInput
          style={styles.textInput}
          value={medicalReminderForm.reminderDate}
          onChangeText={(value) =>
            onMedicalReminderFieldChange({ reminderDate: formatDateTyping(value) })
          }
          placeholder="JJ/MM/AAAA"
          placeholderTextColor={c.placeholder}
          autoCapitalize="none"
          keyboardType="number-pad"
          maxLength={10}
        />

        <EditorLabel label="Note" />
        <TextInput
          style={[styles.textInput, styles.notesInput]}
          value={medicalReminderForm.notes}
          onChangeText={(value) => onMedicalReminderFieldChange({ notes: value })}
          placeholder="Ajoute un contexte, une adresse, une consigne, un motif..."
          placeholderTextColor={c.placeholder}
          multiline
          textAlignVertical="top"
        />

        <View style={styles.actionsRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Enregistrer le rendez-vous"
            style={styles.primaryAction}
            onPress={onSaveMedicalReminder}
          >
            <Text style={styles.primaryActionText}>Enregistrer le rendez-vous</Text>
          </Pressable>
        </View>

        {Boolean(medicalReminderMessage) && (
          <Text style={styles.saveMessage}>{medicalReminderMessage}</Text>
        )}

        {Boolean(medicalReminders.length) && (
          <View style={styles.medicalReminderList}>
            <Text style={styles.medicalReminderListTitle}>Rendez-vous enregistrés</Text>
            <Text style={{ color: c.textTertiary, fontSize: 12, marginBottom: 8, marginTop: -4 }}>
              Glisse vers la gauche pour supprimer
            </Text>
            {medicalReminders.map((item) => (
              <ReminderRow
                key={item.id}
                item={item}
                onDelete={() => onDeleteMedicalReminder(item.id)}
                onToggle={() => onToggleMedicalReminderCompleted(item.id)}
                styles={styles}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
