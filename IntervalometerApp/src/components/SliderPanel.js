import * as React from 'react';
import {StyleSheet, View, Image} from 'react-native';

import {useTheme} from './ThemeProvider';
import Text from './Text';
import Slider from '@react-native-community/slider';
import CheckBox from '@react-native-community/checkbox';

const styles = StyleSheet.create({
  titleContainer: {flexDirection: 'row', alignItems: 'center'},
  icon: {
    resizeMode: 'contain',
    width: 40,
    height: 40,
    marginEnd: 6,
  },
  valueText: {fontSize: 16, fontWeight: '700'},
  title: {marginStart: 2},
  slider: {width: '100%', height: 40},
});

const SliderPanel = ({
  style,
  icon,
  title = '',
  valueText = '1',
  onValueChange = () => {},
  minValue = 0,
  maxValue = 1,
  step = 1,
  withCheckBox = false,
  checkBoxValue = false,
  onCheckBoxValueChange = () => {},
  disabled = false,
}) => {
  const {colors} = useTheme();
  var tintStyle = {tintColor: colors.text};
  return (
    <View style={style}>
      <View style={styles.titleContainer}>
        <Image style={[styles.icon, tintStyle]} source={icon} />
        {withCheckBox && (
          <CheckBox
            tintColors={{true: colors.primary, false: colors.secondary}}
            tintColor={colors.secondary}
            onTintColor={colors.primary}
            onFillColor={colors.primary}
            value={checkBoxValue}
            onValueChange={onCheckBoxValueChange}
          />
        )}
        <View style={styles.title}>
          <Text>{title}</Text>
          <Text style={styles.valueText}>{valueText}</Text>
        </View>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={minValue}
        maximumValue={maxValue}
        step={step}
        value={minValue}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.secondary}
        thumbTintColor={colors.primary}
        onValueChange={onValueChange}
        disabled={disabled}
      />
    </View>
  );
};

export default SliderPanel;
