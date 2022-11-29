import React from 'react';
import {StyleSheet, View} from 'react-native';

import Text from './Text';

import {useTheme} from './ThemeProvider';

const styles = StyleSheet.create({
  container: {flexDirection: 'row'},
  text: {fontWeight: '700', fontSize: 16},
});

const Status = ({counter, shots, estimatedTime}) => {
  const {colors} = useTheme();
  return (
    <>
      <View style={styles.container}>
        <Text style={styles.text}>
          {counter} / {shots}
        </Text>
      </View>
      <Text style={[styles.text, {color: colors.primary}]}>
        ≈{estimatedTime}
      </Text>
    </>
  );
};

export default Status;
