import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {Colors} from '../../constants/colors';
import {Spacing, FontSize, BorderRadius} from '../../constants/dimensions';
import {helpers} from '../../utils/helpers';

interface DateSelectorProps {
  dates: string[];
  selectedDate?: string | null;
  onDateSelect: (date: string) => void;
  disabled?: boolean;
}

const DateSelector: React.FC<DateSelectorProps> = ({
  dates,
  selectedDate,
  onDateSelect,
  disabled = false,
}) => {
  if (dates.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No dates available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        {dates.map((date, index) => {
          const isSelected = selectedDate === date;
          const isToday = helpers.isToday(date);
          const isTomorrow = helpers.isTomorrow(date);

          let displayText = '';
          if (isToday) {
            displayText = 'Today';
          } else if (isTomorrow) {
            displayText = 'Tomorrow';
          } else {
            displayText = helpers.formatDate(date, 'MMM DD');
          }

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dateCard,
                isSelected && styles.dateCardSelected,
                disabled && styles.dateCardDisabled,
              ]}
              onPress={() => !disabled && onDateSelect(date)}
              disabled={disabled}>
              <Text
                style={[
                  styles.dateText,
                  isSelected && styles.dateTextSelected,
                  disabled && styles.dateTextDisabled,
                ]}>
                {displayText}
              </Text>
              <Text
                style={[
                  styles.dateSubtext,
                  isSelected && styles.dateSubtextSelected,
                  disabled && styles.dateSubtextDisabled,
                ]}>
                {helpers.formatDate(date, 'ddd')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
  },
  dateCard: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.md,
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateCardSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dateCardDisabled: {
    backgroundColor: Colors.gray[100],
    borderColor: Colors.gray[200],
  },
  dateText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  dateTextSelected: {
    color: Colors.white,
  },
  dateTextDisabled: {
    color: Colors.textTertiary,
  },
  dateSubtext: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  dateSubtextSelected: {
    color: Colors.white,
  },
  dateSubtextDisabled: {
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

export default DateSelector;
