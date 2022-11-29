import * as React from 'react';
import {useColorScheme} from 'react-native';
import {lightTheme, darkTheme} from '../assets';

export const ThemeContext = React.createContext({
  isDark: false,
  colors: lightTheme,
  setScheme: () => {},
});

export const ThemeProvider = props => {
  // Getting te device color scheme, can be dark / light / no-preference
  const colorScheme = useColorScheme();

  const [isDark, setIsDark] = React.useState(colorScheme === 'dark');

  // Listening to changes of device appearance
  React.useEffect(() => {
    setIsDark(colorScheme === 'dark');
  }, [colorScheme]);

  const theme = {
    isDark,
    colors: isDark ? darkTheme : lightTheme,
    setScheme: scheme => setIsDark(scheme === 'dark'),
  };

  return (
    <ThemeContext.Provider value={theme}>
      {props.children}
    </ThemeContext.Provider>
  );
};

// Hook to get the theme object returns
export const useTheme = () => React.useContext(ThemeContext);
