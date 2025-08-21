import React from 'react';
import {View, StyleSheet, ViewProps} from 'react-native';
import {Colors} from '../../constants/colors';
import {Spacing, BorderRadius} from '../../constants/dimensions';

interface CardProps extends ViewProps {
  padding?: 'none' | 'small' | 'medium' | 'large';
  elevation?: boolean;
  bordered?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  padding = 'medium',
  elevation = true,
  bordered = true,
  style,
  ...props
}) => {
  const getCardStyle = () => {
    const baseStyle = [styles.card];

    // Padding styles
    switch (padding) {
      case 'none':
        break;
      case 'small':
        baseStyle.push(styles.smallPadding);
        break;
      case 'medium':
        baseStyle.push(styles.mediumPadding);
        break;
      case 'large':
        baseStyle.push(styles.largePadding);
        break;
    }

    // Elevation and border
    if (elevation) {
      baseStyle.push(styles.elevated);
    }

    if (bordered) {
      baseStyle.push(styles.bordered);
    }

    return baseStyle;
  };

  return (
    <View style={[getCardStyle(), style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
  },

  // Padding styles
  smallPadding: {
    padding: Spacing.sm,
  },
  mediumPadding: {
    padding: Spacing.md,
  },
  largePadding: {
    padding: Spacing.lg,
  },

  // Elevation and border
  elevated: {
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bordered: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
});

export default Card;
