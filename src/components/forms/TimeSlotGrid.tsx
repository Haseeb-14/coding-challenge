import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Colors} from '../../constants/colors';
import {Spacing, FontSize, BorderRadius} from '../../constants/dimensions';
import {TimeSlot} from '../../types/store';
import {helpers} from '../../utils/helpers';

interface TimeSlotGridProps {
  timeSlots: TimeSlot[];
  selectedTime?: string | null;
  onTimeSelect: (time: string) => void;
  disabled?: boolean;
}

const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({
  timeSlots,
  selectedTime,
  onTimeSelect,
  disabled = false,
}) => {
  const handleTimePress = (slot: TimeSlot) => {
    if (slot.isAvailable && !disabled) {
      onTimeSelect(slot.time);
    }
  };

  if (timeSlots.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No time slots available for this date
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {timeSlots.map((slot, index) => {
          const isSelected = selectedTime === slot.time;
          const isDisabled = !slot.isAvailable || disabled;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.timeSlot,
                isSelected && styles.timeSlotSelected,
                isDisabled && styles.timeSlotDisabled,
              ]}
              onPress={() => handleTimePress(slot)}
              disabled={isDisabled}>
              <Text
                style={[
                  styles.timeSlotText,
                  isSelected && styles.timeSlotTextSelected,
                  isDisabled && styles.timeSlotTextDisabled,
                ]}>
                {helpers.formatTime(slot.time)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlot: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 48,
    justifyContent: 'center',
  },
  timeSlotSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timeSlotDisabled: {
    backgroundColor: Colors.gray[100],
    borderColor: Colors.gray[200],
  },
  timeSlotText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  timeSlotTextSelected: {
    color: Colors.white,
  },
  timeSlotTextDisabled: {
    color: Colors.textTertiary,
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

export default TimeSlotGrid;
