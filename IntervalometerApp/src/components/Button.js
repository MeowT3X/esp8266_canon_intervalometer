import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import {useTheme} from './ThemeProvider';

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    borderRadius: 6,
    paddingHorizontal: 4,
  },
  textStyle: {
    fontSize: 16,
  },
});

const AppButton = ({
  color,
  title,
  disable,
  progress,
  style,
  onPress = () => {},
}) => {
  const {colors} = useTheme();

  if (!color) {
    color = colors.primary;
  }

  var bgColor = color;
  if (disable || progress) {
    bgColor = colors.secondary;
  }

  return (
    <TouchableOpacity
      disabled={disable}
      style={[styles.buttonContainer, style, {backgroundColor: bgColor}]}
      onPress={() => {
        if (!disable && !progress) {
          onPress();
        }
      }}>
      {!progress && (
        <Text style={[styles.textStyle, {color: colors.text}]}>{title}</Text>
      )}
      {progress && <ActivityIndicator size="large" color={color} />}
    </TouchableOpacity>
  );
};

export default AppButton;
