import * as React from 'react';
import {Text} from 'react-native';
import {useTheme} from './ThemeProvider';

const AppText = props => {
  const {colors} = useTheme();
  return (
    <Text style={[{color: colors.text}, props.style]}>{props.children}</Text>
  );
};

export default AppText;
