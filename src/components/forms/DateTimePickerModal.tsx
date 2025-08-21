import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import DatePicker from 'react-native-date-picker';
import Modal from 'react-native-modal';
import Button from '../ui/Button';
import {Colors} from '../../constants/colors';
import {Spacing, FontSize, BorderRadius} from '../../constants/dimensions';

interface DateTimePickerModalProps {
  isVisible: boolean;
  date: Date;
  mode?: 'date' | 'time' | 'datetime';
  minimumDate?: Date;
  maximumDate?: Date;
  onDateChange: (date: Date) => void;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
  title?: string;
}

const DateTimePickerModal: React.FC<DateTimePickerModalProps> = ({
  isVisible,
  date,
  mode = 'date',
  minimumDate,
  maximumDate,
  onDateChange,
  onConfirm,
  onCancel,
  title,
}) => {
  const handleConfirm = () => {
    onConfirm(date);
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onCancel}
      style={styles.modal}>
      <View style={styles.modalContent}>
        {title && <Text style={styles.title}>{title}</Text>}

        <DatePicker
          date={date}
          mode={mode}
          onDateChange={onDateChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />

        <View style={styles.buttonContainer}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={onCancel}
            style={styles.button}
          />
          <Button
            title="Confirm"
            variant="primary"
            onPress={handleConfirm}
            style={styles.button}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    width: '90%',
    maxWidth: 400,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  button: {
    flex: 1,
  },
});

export default DateTimePickerModal;
